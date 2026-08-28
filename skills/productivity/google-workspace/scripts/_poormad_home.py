"""Resolve POORMAD_HOME for standalone skill scripts.

Skill scripts may run outside the PoorMad process (e.g. system Python,
nix env, CI) where ``poormad_constants`` is not importable.  This module
provides the same ``get_poormad_home()`` and ``display_poormad_home()``
contracts as ``poormad_constants`` without requiring it on ``sys.path``.

When ``poormad_constants`` IS available it is used directly so that any
future enhancements (profile resolution, Docker detection, etc.) are
picked up automatically.  The fallback path replicates the core logic
from ``poormad_constants.py`` using only the stdlib.

All scripts under ``google-workspace/scripts/`` should import from here
instead of duplicating the ``POORMAD_HOME = Path(os.getenv(...))`` pattern.
"""

from __future__ import annotations

import os
from pathlib import Path

try:
    from poormad_constants import display_poormad_home as display_poormad_home
    from poormad_constants import get_poormad_home as get_poormad_home
except (ModuleNotFoundError, ImportError):

    def get_poormad_home() -> Path:
        """Return the PoorMad home directory (default: ~/.poormad).

        Mirrors ``poormad_constants.get_poormad_home()``."""
        val = os.environ.get("POORMAD_HOME", "").strip()
        return Path(val) if val else Path.home() / ".poormad"

    def display_poormad_home() -> str:
        """Return a user-friendly ``~/``-shortened display string.

        Mirrors ``poormad_constants.display_poormad_home()``."""
        home = get_poormad_home()
        try:
            return "~/" + str(home.relative_to(Path.home()))
        except ValueError:
            return str(home)
