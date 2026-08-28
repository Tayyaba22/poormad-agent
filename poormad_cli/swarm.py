"""PoorMad swarm commander: spawn, watch, merge multi-agent workstreams.

Built on the existing subprocess/delegation infrastructure — each worker is
an independent `poormad chat -q` process with its own workspace directory,
so the swarm is a coordination layer, not a new runtime.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

SWARM_ROOT = Path(os.environ.get("POORMAD_HOME", str(Path.home() / ".poormad"))) / "swarm"


def _now() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")


def _run_dir(run_id: str) -> Path:
    return SWARM_ROOT / run_id


def _write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def spawn_swarm(goal: str, workers: int, context: str = "", name: str = "") -> str:
    """Spawn ``workers`` independent agents on ``goal``; return run id."""
    run_id = name or _now()
    run_dir = _run_dir(run_id)
    run_dir.mkdir(parents=True, exist_ok=True)

    manifest = {
        "run_id": run_id,
        "goal": goal,
        "workers": workers,
        "context": context,
        "spawned_at": _now(),
        "status": "running",
    }
    _write(run_dir / "manifest.json", json.dumps(manifest, indent=2))

    for i in range(workers):
        wdir = run_dir / f"worker_{i}"
        wdir.mkdir(parents=True, exist_ok=True)
        brief = (
            f"GOAL: {goal}\n\n"
            f"CONTEXT:\n{context}\n\n"
            f"OUTPUT: write your result to {wdir / 'result.md'}\n"
            f"WORKER: {i} of {workers}\n"
        )
        _write(wdir / "brief.txt", brief)
        _write(wdir / "status.txt", "running")
        _spawn_worker(run_id, i, goal, context, wdir)

    return run_id


def _spawn_worker(run_id: str, i: int, goal: str, context: str, wdir: Path) -> None:
    """Launch one worker as a detached poormad one-shot process."""
    prompt = (
        f"Swarm worker {i}. Goal: {goal}\n\nContext:\n{context}\n\n"
        f"Write your final result to {wdir / 'result.md'} and your status to "
        f"{wdir / 'status.txt'}. Work autonomously, then exit."
    )
    cmd = [
        sys.executable, "-c",
        "from poormad_cli.main import main; import sys; sys.argv = ['poormad', 'chat', '-q', sys.argv[1]]; main()",
        prompt,
    ]
    try:
        proc = subprocess.Popen(
            cmd,
            stdout=open(wdir / "stdout.log", "w"),
            stderr=open(wdir / "stderr.log", "w"),
            start_new_session=True,
        )
        _write(wdir / "pid.txt", str(proc.pid))
    except Exception as exc:  # pragma: no cover - defensive
        _write(wdir / "status.txt", f"failed: {exc}")


def watch_swarm(run_id: str) -> str:
    """Return a status table for a swarm run."""
    run_dir = _run_dir(run_id)
    if not run_dir.exists():
        return f"No swarm run '{run_id}' (swarm root: {SWARM_ROOT})"
    manifest = json.loads((run_dir / "manifest.json").read_text())
    lines = [
        f"Swarm {run_id} — {manifest['goal']}",
        f"Spawned: {manifest['spawned_at']} · Workers: {manifest['workers']}",
        "",
    ]
    done = 0
    for i in range(manifest["workers"]):
        wdir = run_dir / f"worker_{i}"
        status = (wdir / "status.txt").read_text().strip() if (wdir / "status.txt").exists() else "?"
        has_result = (wdir / "result.md").exists()
        lines.append(f"  worker_{i}: {status}" + (" · RESULT ✓" if has_result else ""))
        if has_result or status != "running":
            done += 1
    lines.append("")
    lines.append(f"{done}/{manifest['workers']} workers finished")
    return "\n".join(lines)


def merge_swarm(run_id: str) -> str:
    """Merge worker results into a single report; flag conflicts."""
    run_dir = _run_dir(run_id)
    if not run_dir.exists():
        return f"No swarm run '{run_id}'"
    manifest = json.loads((run_dir / "manifest.json").read_text())
    merged = [f"# Swarm Report — {run_id}", "", f"Goal: {manifest['goal']}", ""]
    seen: dict[str, str] = {}
    for i in range(manifest["workers"]):
        wdir = run_dir / f"worker_{i}"
        res = wdir / "result.md"
        if res.exists():
            text = res.read_text().strip()
            merged += [f"## Worker {i}", "", text, ""]
            # simple conflict detection: same first-line claim, different content
            head = text.splitlines()[0][:80] if text else ""
            if head in seen and seen[head] != text:
                merged += [f"> ⚠ CONFLICT between worker_{i} and a sibling (same claim, different evidence)", ""]
            seen[head] = text
        else:
            status = (wdir / "status.txt").read_text().strip() if (wdir / "status.txt").exists() else "unknown"
            merged += [f"## Worker {i} — no result (status: {status})", ""]
    report = "\n".join(merged)
    _write(run_dir / "merged.md", report)
    return report
