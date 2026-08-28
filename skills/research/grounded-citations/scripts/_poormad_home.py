"""Resolve POORMAD_HOME for standalone skill scripts.

Skill scripts may run outside the PoorMad process (system Python, nix env,
CI) where ``poormad_constants`` is not importable.  This module provides the
same ``get_poormad_home()`` contract without requiring it on ``sys.path``.

When ``poormad_constants`` IS available it is used directly so profile
resolution and any future enhancements are picked up automatically.
"""

from __future__ import annotations

import os
from pathlib import Path

try:
    from poormad_constants import get_poormad_home as get_poormad_home
except (ModuleNotFoundError, ImportError):

    def get_poormad_home() -> Path:
        """Return the PoorMad home directory (default: ``~/.poormad``)."""
        val = os.environ.get("POORMAD_HOME", "").strip()
        return Path(val) if val else Path.home() / ".poormad"
