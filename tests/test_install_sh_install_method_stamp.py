"""Contract test: install.sh stamps the install method next to the code tree
($INSTALL_DIR), not into the shared $POORMAD_HOME.

Background (shared-$POORMAD_HOME bug)
------------------------------------
$POORMAD_HOME is a data directory users frequently bind-mount into a Docker
gateway as well (``~/.poormad:/opt/data``). The published image stamps 'docker'
there on boot, so if install.sh had written its 'git' marker into the same
$POORMAD_HOME the two installs would fight over one slot — and the container,
booting last, would win and wrongly make the host install look like 'docker'
(blocking ``poormad update``).

The fix: detect_install_method() reads a CODE-scoped stamp first, and the
installer writes ``git`` into $INSTALL_DIR (the git checkout, e.g.
``~/.poormad/poormad-agent``), which is unique to this install and immune to the
shared data dir.
"""
from __future__ import annotations

import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
INSTALL_SH = REPO_ROOT / "scripts" / "install.sh"


def test_install_sh_stamps_code_tree_not_home() -> None:
    text = INSTALL_SH.read_text()

    # Stamps the code tree.
    assert text.count('echo "git" > "$INSTALL_DIR/.install_method"') >= 1, (
        "install.sh must stamp $INSTALL_DIR/.install_method (code-scoped)"
    )

    # Never stamps the shared data dir.
    assert not re.search(r'>\s*"\$POORMAD_HOME/\.install_method"', text), (
        "install.sh must not stamp $POORMAD_HOME/.install_method — that data "
        "dir may be shared with a Docker gateway whose 'docker' stamp would "
        "clobber it and block host-side `poormad update`"
    )
