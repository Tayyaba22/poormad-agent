---
name: poormad-launchpad
description: "End-to-end product launch checklist: repo, site, release, announce."
version: 0.1.0
author: PoorMad
license: MIT
platforms: [linux, macos, windows]
metadata:
  poormad:
    tags: [Launch, Product, Release, Marketing, Checklist]
    related_skills: [poormad-brand-guard, poormad-fleet-ops, github-pr-workflow]
---

# PoorMad Launchpad

The full launch pipeline for a product built on PoorMad: from repo hygiene
to release artifacts to announcement. Use as a checklist; each stage has a
verification gate.

## Stages

### 1. Repo readiness
- [ ] Branding scan clean (`poormad-brand-guard`).
- [ ] LICENSE correct: product copyright + upstream attribution.
- [ ] README rewritten: name, tagline, quickstart, screenshots.
- [ ] `pyproject.toml` name/scripts/description correct.
- [ ] CI green (tests, lint, build).

### 2. Build & release
- [ ] `poormad doctor` clean.
- [ ] Version bump (semver) in pyproject + package.json files.
- [ ] Build: python wheel + sdist; desktop app packages; TUI.
- [ ] Smoke-test the artifacts in a clean venv.
- [ ] Tag `vX.Y.Z`, create GitHub release, attach artifacts.

### 3. Website
- [ ] Landing page: hero, tagline, features, install command, screenshots.
- [ ] Docs published (Docusaurus build deployed to Pages).
- [ ] `poormad.dev` custom domain + HTTPS.
- [ ] Portal page: login, credits, subscription (if monetized).

### 4. Announce
- [ ] Product Hunt / Hacker News / Reddit posts (drafted, cited).
- [ ] Social: X/Twitter threads, LinkedIn.
- [ ] Docs update channel + changelog entry.

## Verification gates

Each stage ends with a check you can run, not just a checkbox:
- Repo: `grep -rI 'Hermes' . --exclude-dir=.git | wc -l` == 0 (or whitelisted)
- Build: `pip install dist/*.whl && poormad --version` in clean venv
- Site: `curl -sI https://poormad.dev` returns 200
- Release: `gh release list` shows the tag with assets

## Pitfalls

- Announce before artifacts are downloadable = lost conversions.
- Screenshots must be re-captured post-rebrand, never reused.
- Custom domain DNS can take 24-48h — set it up before the announce.
