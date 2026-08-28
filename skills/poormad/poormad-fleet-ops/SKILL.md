---
name: poormad-fleet-ops
description: "Operate the PoorMad swarm commander: spawn, merge, watch workers."
version: 0.1.0
author: PoorMad
license: MIT
platforms: [linux, macos, windows]
metadata:
  poormad:
    tags: [Swarm, Multi-Agent, Orchestration, Parallel]
    related_skills: [poormad-brand-guard, poormad-launchpad]
---

# PoorMad Fleet Ops

Run multi-agent workstreams: spawn N isolated workers on one goal, monitor
them, merge results, and reconcile conflicts. The swarm layer sits on top
of PoorMad's delegation and background-process infrastructure.

## When to Use

- One goal, many independent slices (research N competitors, review N PRs,
  read N directories).
- A large mechanical job that parallelizes cleanly.
- A deadline task where wall-clock speed matters more than tokens.

## Swarm Lifecycle

1. **Spawn** — `poormad swarm spawn "<goal>" --workers N --context "<brief>"`
   Each worker gets an isolated workspace under
   `~/.poormad/swarm/<run_id>/<worker_i>/` and the full context brief.
   Workers write outputs to their own directory — never shared files.
2. **Watch** — `poormad swarm watch <run_id>` polls worker status and
   streams a live table (id, status, progress, output tail).
3. **Merge** — `poormad swarm merge <run_id>` collects worker outputs,
   dedupes identical results, flags conflicts (same claim, different
   evidence) for human resolution, and writes a merged report.
4. **Schedule** — `poormad swarm schedule "<goal>" --every 6h` registers a
   cron job that spawns the swarm, merges, and delivers the report.

## Worker Brief Template

```
GOAL: <one sentence>
CONTEXT: <everything the worker needs; self-contained>
OUTPUT: write your result to <worker_dir>/result.md
DEADLINE: <time>
LANGUAGE: <lang for the final report>
```

## Pitfalls

- Always give workers disjoint work — overlapping work wastes tokens and
  creates merge conflicts.
- Isolate workspaces: workers sharing files race each other.
- Verify merged claims by re-reading the source, never trusting a worker's
  self-report.
- Prefer 3-5 workers; beyond that, coordination overhead beats speed.
