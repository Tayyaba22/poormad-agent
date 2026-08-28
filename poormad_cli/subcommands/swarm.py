"""``poormad swarm`` subcommand parser."""

from __future__ import annotations

from typing import Callable


def build_swarm_parser(subparsers, *, cmd_swarm: Callable) -> None:
    """Attach the ``swarm`` subcommand to ``subparsers``."""
    swarm_parser = subparsers.add_parser(
        "swarm",
        help="PoorMad multi-agent swarm: spawn, watch, merge workers",
        description="Spawn N isolated agents on one goal, watch them, merge results.",
    )
    swarm_subparsers = swarm_parser.add_subparsers(dest="swarm_command")

    spawn = swarm_subparsers.add_parser("spawn", help="Spawn a worker fleet")
    spawn.add_argument("goal", help="One-sentence goal for all workers")
    spawn.add_argument("--workers", type=int, default=3, help="Number of workers (default 3)")
    spawn.add_argument("--context", default="", help="Shared context brief for workers")
    spawn.add_argument("--name", default="", help="Run name (default: timestamp)")

    watch = swarm_subparsers.add_parser("watch", help="Watch a running swarm")
    watch.add_argument("run_id", help="Swarm run id")

    merge = swarm_subparsers.add_parser("merge", help="Merge worker results")
    merge.add_argument("run_id", help="Swarm run id")

    swarm_parser.set_defaults(func=cmd_swarm)
