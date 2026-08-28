---
name: poormad-vault
description: "Encrypted secret/key rotation helper for projects and deploys."
version: 0.1.0
author: PoorMad
license: MIT
platforms: [linux, macos, windows]
metadata:
  poormad:
    tags: [Secrets, Encryption, Keys, Rotation, Security]
    related_skills: [github-auth, requesting-code-review]
---

# PoorMad Vault

Manage project secrets safely: encrypted storage, rotation workflows, and
leak checks. Complements — never replaces — a real vault (Vault, 1Password,
SOPS). This is the lightweight in-repo answer for solo/small teams.

## When to Use

- "Rotate the API keys for this project."
- "Where is this secret used?"
- "Check we didn't commit a secret."

## Commands

```
poormad vault init          # create .poormad-vault/ (gitignored)
poormad vault add NAME      # add/encrypt a secret (prompts, never echoes)
poormad vault get NAME      # decrypt to stdout (pipe only, no log)
poormad vault list          # names only, no values
poormad vault rotate NAME   # generate a new value, update all refs
poormad vault scan          # scan repo for plaintext secrets (patterns)
```

Storage: one file per secret, encrypted with a key in
`~/.poormad/vault.key` (chmod 600). Never commit the key or values.

## Rotation workflow

1. `poormad vault scan` — find where the old key is used (code, CI,
   config, docs).
2. Generate: `poormad vault rotate NAME`.
3. Update each usage site with the new value (env files, CI secrets,
   config.yaml — never in code).
4. Revoke the old key at the provider (the irreversible step — do last).
5. Re-scan: confirm zero references to the old value.

## Pitfalls

- Never write decrypted values to files or logs — pipe to consumers.
- CI secret stores are separate from the vault; rotation must update both.
- Rotate on: suspected leak, employee offboarding, 90-day policy.
- The vault key itself must be backed up — losing it loses all secrets.
