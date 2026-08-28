---
name: poormad-brand-guard
description: "Scan any project for branding drift: repo, builds, docs, assets."
version: 0.1.0
author: PoorMad
license: MIT
platforms: [linux, macos, windows]
metadata:
  poormad:
    tags: [Branding, Quality, Rebrand, Consistency]
    related_skills: [hermes-parity-port, codebase-inspection]
---

# PoorMad Brand Guard

Detect branding drift in any project — leftover upstream names, stale URLs,
unrenamed assets, or inconsistent product naming across repo, code, docs,
build outputs, and release artifacts.

## When to Use

- After a rebrand: verify nothing upstream leaked through.
- Before a release: confirm all user-facing strings are on-brand.
- On PR review: catch accidental reverts of branded strings.

## How to Run

1. Inventory candidate tokens: the product names, package names, domains,
   and env-var prefixes that must NOT appear (e.g. `hermes`, `Hermes`,
   `HERMES`, `nousresearch`, `NousResearch`, old domain).
2. Scan the tree:
   ```bash
   grep -rInE '\b(Hermes|HERMES|nousresearch|NousResearch)\b' <root> \
     --exclude-dir=.git --exclude-dir=node_modules
   ```
3. Whitelist legitimate occurrences: third-party package names
   (e.g. `hermes-parser`, `hermes-estree`, `@nous-research/ui`), model
   slugs (`nousresearch/hermes-4-405b`), real contributor emails, and
   `LICENSE`/`NOTICE` attribution (legal requirement — never flag those).
4. Report: for each leak, file:line, the string, and a suggested fix.
5. Verify fix: re-run scan, expect zero non-whitelisted hits.

## Pitfalls

- `synchronous` contains "nous" — always use word boundaries `\b`.
- `LICENSE` and `NOTICE` must keep upstream copyright — legal, not drift.
- Lockfiles legitimately contain third-party deps with upstream names.
- Binary assets (.png/.exe/.zip) can't be grepped — list filenames too.
