"""PoorMad skin/theme engine — the theme SDK for every surface.

A data-driven skin system that lets users (and PoorMad itself) customize the
visual appearance across the CLI, the TUI, and the desktop GUI from a single
file. Skins are defined as YAML files in ~/.poormad/skins/ or as built-in presets.
No code changes are needed to add a new skin.

This module is the source of truth: it resolves the active skin, and the gateway
pushes the resolved palette to the TUI and desktop (see tui_gateway's
``resolve_skin`` / ``skin.changed``). A skin dropped in ~/.poormad/skins/ therefore
themes all three surfaces at once — the theme analogue of the plugin SDK.

SKIN YAML SCHEMA
================

All fields are optional. Missing values inherit from the ``default`` skin.

.. code-block:: yaml

    # Required: skin identity
    name: mytheme                         # Unique skin name (lowercase, hyphens ok)
    description: Short description        # Shown in /skin listing

    # Colors: hex values for Rich markup (banner, UI, response box)
    colors:
      background: "#0e0e12"               # App/base surface — the seed the TUI
                                          # status bar and the desktop GUI derive
                                          # their whole palette from (see below).
      banner_border: "#CD7F32"            # Panel border color
      banner_title: "#FFD700"             # Panel title text color
      banner_accent: "#FFBF00"            # Section headers (Available Tools, etc.)
      banner_dim: "#B8860B"               # Dim/muted text (separators, labels)
      banner_text: "#FFF8DC"              # Body text (tool names, skill names)
      ui_accent: "#FFBF00"               # General UI accent
      ui_label: "#DAA520"                # UI labels (warm gold; teal clashed w/ default banner gold)
      ui_ok: "#4caf50"                   # Success indicators
      ui_error: "#ef5350"                # Error indicators
      ui_warn: "#ffa726"                 # Warning indicators
      ui_tool: "#FFBF00"                 # Tool-call markers (● / spinner); falls back to ui_accent
      ui_thinking: "#CC9B1F"             # Reasoning/thinking text; falls back to banner_dim
      diff_added: "#dcffdc"              # Diff added-line background (TUI)
      diff_removed: "#ffdcdc"            # Diff removed-line background
      diff_added_word: "#248a3d"         # Diff added word-level foreground
      diff_removed_word: "#cf222e"       # Diff removed word-level foreground
      syntax_string: "#FFBF00"           # Code strings; falls back to ui_accent
      syntax_number: "#FFF8DC"           # Code numbers; falls back to ui_text
      syntax_keyword: "#CD7F32"          # Code keywords; falls back to ui_border
      syntax_comment: "#CC9B1F"          # Code comments; falls back to banner_dim
      prompt: "#FFF8DC"                  # Prompt text color
      input_rule: "#CD7F32"              # Input area horizontal rule
      response_border: "#FFD700"         # Response box border (ANSI)
      status_bar_bg: "#1a1a2e"           # Status bar background
      status_bar_text: "#C0C0C0"         # Status bar default text
      status_bar_strong: "#FFD700"       # Status bar highlighted text
      status_bar_dim: "#8B8682"          # Status bar separators/muted text
      status_bar_good: "#8FBC8F"         # Healthy context usage
      status_bar_warn: "#FFD700"         # Warning context usage
      status_bar_bad: "#FF8C00"          # High context usage
      status_bar_critical: "#FF6B6B"     # Critical context usage
      session_label: "#DAA520"           # Session label color
      session_border: "#8B8682"          # Session ID dim color
      status_bar_bg: "#1a1a2e"          # TUI status/usage bar background
      voice_status_bg: "#1a1a2e"        # TUI voice status background
      selection_bg: "#333355"           # TUI mouse-selection highlight background
      completion_menu_bg: "#1a1a2e"      # Completion menu background
      completion_menu_current_bg: "#333355"  # Active completion row background
      completion_menu_meta_bg: "#1a1a2e"     # Completion meta column background
      completion_menu_meta_current_bg: "#333355"  # Active completion meta background

    # Optional paired palette for the opposite terminal polarity (mirrors the
    # desktop app's colors/darkColors pairing). If `colors` above is authored
    # for dark terminals, `light_colors` supplies the hand-tuned light-terminal
    # variant (same keys); light-authored skins supply `dark_colors` instead.
    # Without a paired block, the TUI adapts `colors` automatically
    # (contrast-clamped foregrounds, polarity-corrected fills).
    light_colors:
      banner_title: "#8B6914"
      # ... same keys as `colors` ...

    # Spinner: customize the animated spinner during API calls
    spinner:
      waiting_faces:                      # Faces shown while waiting for API
        - "(⚔)"
        - "(⛨)"
      thinking_faces:                     # Faces shown during reasoning
        - "(⌁)"
        - "(<>)"
      thinking_verbs:                     # Verbs for spinner messages
        - "forging"
        - "plotting"
      wings:                              # Optional left/right spinner decorations
        - ["⟪⚔", "⚔⟫"]                  # Each entry is [left, right] pair
        - ["⟪▲", "▲⟫"]

    # Branding: text strings used throughout the CLI
    branding:
      agent_name: "PoorMad"          # Banner title, status display
      welcome: "Welcome message"          # Shown at CLI startup
      goodbye: "Goodbye! 🌑"              # Shown on exit
      response_label: " 🌑 PoorMad "       # Response box header label
      prompt_symbol: "❯"                 # Input prompt symbol (bare token; renderers add trailing space)
      help_header: "🌑 Commands"      # /help header text

    # Tool prefix: character for tool output lines (default: ┊)
    tool_prefix: "┊"

    # Tool emojis: override the default emoji for any tool (used in spinners & progress)
    tool_emojis:
      terminal: "⚔"           # Override terminal tool emoji
      web_search: "🔮"        # Override web_search tool emoji
      # Any tool not listed here uses its registry default

USAGE
=====

.. code-block:: python

    from poormad_cli.skin_engine import get_active_skin, list_skins, set_active_skin

    skin = get_active_skin()
    print(skin.colors["banner_title"])    # "#FFD700"
    print(skin.get_branding("agent_name"))  # "PoorMad"

    set_active_skin("ares")               # Switch to built-in ares skin
    set_active_skin("mytheme")            # Switch to user skin from ~/.poormad/skins/

BUILT-IN SKINS
==============

- ``default`` — Classic PoorMad gold/kawaii (the current look)
- ``ares``    — Crimson/bronze war-god theme with custom spinner wings
- ``mono``    — Clean grayscale monochrome
- ``slate``   — Cool blue developer-focused theme
- ``daylight`` — Light background theme with dark text and blue accents
- ``warm-lightmode`` — Warm brown/gold text for light terminal backgrounds

USER SKINS
==========

Drop a YAML file in ``~/.poormad/skins/<name>.yaml`` following the schema above.
Activate with ``/skin <name>`` in the CLI or ``display.skin: <name>`` in config.yaml.
"""

import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from poormad_constants import get_poormad_home

logger = logging.getLogger(__name__)


# =============================================================================
# Skin data structure
# =============================================================================

@dataclass
class SkinConfig:
    """Complete skin configuration."""
    name: str
    description: str = ""
    colors: Dict[str, str] = field(default_factory=dict)
    # Paired palettes for terminals whose background polarity differs from the
    # one `colors` was authored against (mirrors the desktop app's
    # colors/darkColors pairing). A consumer that knows the terminal is light
    # prefers `light_colors` (falling back to `colors`), and vice versa for
    # `dark_colors`. Both merge over the default skin's matching block, so
    # partial user skins still resolve to a complete palette.
    light_colors: Dict[str, str] = field(default_factory=dict)
    dark_colors: Dict[str, str] = field(default_factory=dict)
    spinner: Dict[str, Any] = field(default_factory=dict)
    branding: Dict[str, str] = field(default_factory=dict)
    tool_prefix: str = "┊"
    tool_emojis: Dict[str, str] = field(default_factory=dict)  # per-tool emoji overrides
    banner_logo: str = ""    # Rich-markup ASCII art logo (replaces POORMAD_AGENT_LOGO)
    banner_hero: str = ""    # Rich-markup hero art (replaces POORMAD_CADUCEUS)
    # Box style: a Rich box name ("ROUNDED", "HEAVY", "DOUBLE", "SQUARE",
    # "ASCII", "MINIMAL") used for the banner/response/status panels so each
    # theme can have a visually distinct frame character set.
    box: str = "ROUNDED"
    # Cycling accent: list of hex colors the accent "breathes" through over
    # time (applied to the banner title + prompt glyph). Empty = static accent.
    accent_cycle: List[str] = field(default_factory=list)

    def get_color(self, key: str, fallback: str = "") -> str:
        """Get a color value with fallback."""
        return self.colors.get(key, fallback)

    def get_spinner_wings(self) -> List[Tuple[str, str]]:
        """Get spinner wing pairs, or empty list if none."""
        raw = self.spinner.get("wings", [])
        result = []
        for pair in raw:
            if isinstance(pair, (list, tuple)) and len(pair) == 2:
                result.append((str(pair[0]), str(pair[1])))
        return result

    def get_branding(self, key: str, fallback: str = "") -> str:
        """Get a branding value with fallback."""
        return self.branding.get(key, fallback)

    def get_box(self) -> "object":
        """Return the Rich Box instance for this skin (falls back to ROUNDED)."""
        from rich.box import ROUNDED, HEAVY, DOUBLE, SQUARE, ASCII, MINIMAL, ROUNDED
        _MAP = {
            "ROUNDED": ROUNDED, "HEAVY": HEAVY, "DOUBLE": DOUBLE,
            "SQUARE": SQUARE, "ASCII": ASCII, "MINIMAL": MINIMAL,
        }
        return _MAP.get(self.box.upper(), ROUNDED)

    def get_accent(self, now: Optional[float] = None) -> str:
        """Return the current accent color, cycling through `accent_cycle` if set.

        Static skins (empty cycle) return `ui_accent`. The cycle period is ~6s
        so the shift is a slow breathe, not a strobe.
        """
        if not self.accent_cycle:
            return self.colors.get("ui_accent", "#8b5cf6")
        import time as _t
        if now is None:
            now = _t.monotonic()
        idx = int(now * 10) % len(self.accent_cycle)
        return self.accent_cycle[idx]


# =============================================================================
# Built-in skin definitions
# =============================================================================

_BUILTIN_SKINS: Dict[str, Dict[str, Any]] = {
    "default": {
        "name": "default",
        "description": "PoorMad house theme — space-black with violet nebula accent",
        # Dark-authored. The brand theme: space-black + violet/lavender nebula.
        "colors": {
            "banner_border": "#1e1b2e",
            "banner_title": "#c4b5fd",
            "banner_accent": "#8b5cf6",
            "banner_dim": "#6b6480",
            "banner_text": "#e5e0f0",
            "ui_accent": "#8b5cf6",
            "ui_label": "#a78bfa",
            "ui_ok": "#34d399",
            "ui_error": "#f87171",
            "ui_warn": "#fbbf24",
            "prompt": "#c4b5fd",
            "input_rule": "#8b5cf6",
            "response_border": "#c4b5fd",
            "status_bar_bg": "#0d0d16",
            "status_bar_text": "#e5e0f0",
            "status_bar_strong": "#c4b5fd",
            "status_bar_dim": "#6b6480",
            "status_bar_good": "#34d399",
            "status_bar_warn": "#fbbf24",
            "status_bar_bad": "#fb923c",
            "status_bar_critical": "#f87171",
            "session_label": "#c4b5fd",
            "session_border": "#1e1b2e",
            "completion_menu_bg": "#0d0d16",
            "completion_menu_current_bg": "#2a2440",
            "selection_bg": "#3a2f5a",
            "shell_dollar": "#8b5cf6",
            "voice_status_bg": "#0d0d16",
        },
        # Light overlay (merged onto `colors`; dark mode renders the vivid
        # block above untouched). Violet/ink ladder for light terminals.
        "light_colors": {
            "banner_title": "#6d28d9",
            "banner_accent": "#7c3aed",
            "banner_dim": "#6b6480",
            "banner_text": "#1e1b2e",
            "ui_accent": "#7c3aed",
            "ui_label": "#6d28d9",
            "ui_ok": "#15803d",
            "ui_error": "#b91c1c",
            "ui_warn": "#b45309",
            "prompt": "#1e1b2e",
            "response_border": "#6d28d9",
            "session_label": "#6d28d9",
            "status_bar_text": "#3f3f46",
            "status_bar_strong": "#6d28d9",
            "status_bar_dim": "#6b6480",
            "status_bar_good": "#15803d",
            "status_bar_warn": "#b45309",
            "status_bar_bad": "#c2410c",
            "status_bar_critical": "#b91c1c",
            "shell_dollar": "#6d28d9",
            "completion_menu_bg": "#f5f3ff",
            "completion_menu_current_bg": "#ede9fe",
            "selection_bg": "#ddd6fe",
            "status_bar_bg": "#f5f3ff",
            "voice_status_bg": "#f5f3ff",
        },
        "spinner": {
            "waiting_faces": ["(🌑)", "(✶)", "(◍)"],
            "thinking_faces": ["(🌑)", "(✶)", "(◍)", "(⚡)"],
            "thinking_verbs": [
                "thinking", "planning", "forging",
                "connecting the dots", "summoning",
            ],
            "wings": [
                ["⟪🌑", "🌑⟫"],
                ["⟪✦", "✦⟫"],
                ["⟪⚡", "⚡⟫"],
            ],
        },
        "branding": {
            "agent_name": "PoorMad",
            "welcome": "Welcome to PoorMad — poor in cost, mad in capability. Type a message or /help.",
            "goodbye": "Goodbye! 🌑",
            "response_label": " 🌑 PoorMad ",
            "prompt_symbol": "🌑",
            "help_header": "🌑 Available Commands",
        },
        "tool_prefix": "┊",
        "tool_emojis": {
            "terminal": "⚡",
            "web_search": "🔮",
            "image_generation": "🎨",
            "browser": "🌐",
            "code_execution": "⚙",
            "file_read": "📄",
            "file_write": "✍",
            "memory": "🧠",
            "skills": "🔧",
            "tts": "🔊",
            "vision": "👁",
            "cron": "⏱",
        },
        "banner_logo": "[bold #c4b5fd]██████╗  ██████╗  ██████╗ ██████╗ ███╗   ███╗ █████╗ ██████╗ [/]\n[#8b5cf6]██████╔╝██║   ██║██║   ██║██████╔╝██╔████╔██║███████║██║  ██║[/]\n[#6d28d9]██╔═══╝ ██║   ██║██║   ██║██╔══██╗██║╚██╔╝██║██╔══██║██║  ██║[/]\n[#8b5cf6]██║     ╚██████╔╝╚██████╔╝██║  ██║██║ ╚═╝ ██║██║  ██║██████╔╝[/]\n[#6d28d9]╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═════╝ [/]",
        "banner_hero": "[#8b5cf6]⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣤⣤⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀[/]\n[#8b5cf6]⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣴⣿⣿⠟⠛⠻⣿⣷⣦⡀⠀⠀⠀⠀⠀⠀⠀[/]\n[#c4b5fd]⠀⠀⠀⠀⠀⠀⣠⣾⣿⠟⠀⠀⠀⠀⠀⠀⠙⢿⣷⣄⠀⠀⠀⠀⠀[/]\n[#c4b5fd]⠀⠀⠀⠀⣰⣿⠟⠀⠀⠀⢀⣴⣶⡄⠀⠀⠀⠙⢿⣷⡀⠀⠀⠀[/]\n[#8b5cf6]⠀⠀⠀⣰⣿⠃⠀⠀⠀⣰⣿⣿⣿⣆⠀⠀⠀⠀⢻⣿⠀⠀⠀[/]\n[#8b5cf6]⠀⠀⢰⣿⠃⠀⠀⢀⣾⡿⠋⠙⢿⣷⡀⠀⠀⠹⣿⡆⠀⠀[/]\n[#6d28d9]⠀⠀⣿⡇⠀⠀⣠⣿⠟⠀⠀⠀⠻⣿⣄⠀⠀⢸⣿⠀⠀[/]\n[#6d28d9]⠀⠀⣿⡇⠀⠀⠙⠋⠀⠀⚡⠀⠀⠙⠋⠀⠀⢸⣿⠀⠀[/]\n[#6d28d9]⠀⠀⢿⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⡿⠀⠀[/]\n[#8b5cf6]⠀⠀⠀⢿⣷⣄⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⡿⠀⠀⠀[/]\n[#c4b5fd]⠀⠀⠀⠀⠈⠻⣿⣷⣶⣤⣀⣀⣤⣶⣿⠿⠋⠀⠀⠀⠀[/]\n[#c4b5fd]⠀⠀⠀⠀⠀⠀⠀⠉⠛⠿⠿⠿⠛⠉⠀⠀⠀⠀⠀⠀⠀[/]\n[#8b5cf6]⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀🌑⠀⠀⠀⠀⠀⠀⠀⠀⠀[/]\n[dim #6d28d9]⠀⠀⠀⠀⠀⠀⠀⠀poor in cost, mad in capability⠀⠀⠀⠀⠀⠀⠀⠀[/]",
    },
    "ares": {
        "name": "ares",
        "description": "War-god theme — crimson and bronze",
        "colors": {
            "banner_border": "#A93333",
            "banner_title": "#C7A96B",
            "banner_accent": "#DD4A3A",
            "banner_dim": "#905151",
            "banner_text": "#F1E6CF",
            "ui_accent": "#DD4A3A",
            "ui_label": "#C7A96B",
            "ui_ok": "#4caf50",
            "ui_error": "#ef5350",
            "ui_warn": "#ffa726",
            "prompt": "#F1E6CF",
            "input_rule": "#A93333",
            "response_border": "#C7A96B",
            "status_bar_bg": "#2A1212",
            "status_bar_text": "#F1E6CF",
            "status_bar_strong": "#C7A96B",
            "status_bar_dim": "#756054",
            "status_bar_good": "#7BC96F",
            "status_bar_warn": "#C7A96B",
            "status_bar_bad": "#DD4A3A",
            "status_bar_critical": "#EF5350",
            "session_label": "#C7A96B",
            "session_border": "#6E584B",
            "completion_menu_bg": "#2A1212",
            "completion_menu_current_bg": "#5C221D",
            "selection_bg": "#692620",
            "shell_dollar": "#DD4A3A",
            "voice_status_bg": "#2A1212",
        },
        "spinner": {
            "waiting_faces": ["(⚔)", "(⛨)", "(▲)", "(<>)", "(/)"],
            "thinking_faces": ["(⚔)", "(⛨)", "(▲)", "(⌁)", "(<>)"],
            "thinking_verbs": [
                "forging", "marching", "sizing the field", "holding the line",
                "hammering plans", "tempering steel", "plotting impact", "raising the shield",
            ],
            "wings": [
                ["⟪⚔", "⚔⟫"],
                ["⟪▲", "▲⟫"],
                ["⟪╸", "╺⟫"],
                ["⟪⛨", "⛨⟫"],
            ],
        },
        "branding": {
            "agent_name": "Ares Agent",
            "welcome": "Welcome to Ares Agent! Type your message or /help for commands.",
            "goodbye": "Farewell, warrior! ⚔",
            "response_label": " ⚔ Ares ",
            "prompt_symbol": "⚔",
            "help_header": "(⚔) Available Commands",
        },
        "tool_prefix": "╎",
        "banner_logo": """[bold #A3261F] █████╗ ██████╗ ███████╗███████╗       █████╗  ██████╗ ███████╗███╗   ██╗████████╗[/]
[bold #B73122]██╔══██╗██╔══██╗██╔════╝██╔════╝      ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝[/]
[#C93C24]███████║██████╔╝█████╗  ███████╗█████╗███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║[/]
[#D84A28]██╔══██║██╔══██╗██╔══╝  ╚════██║╚════╝██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║[/]
[#E15A2D]██║  ██║██║  ██║███████╗███████║      ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║[/]
[#EB6C32]╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝      ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝[/]""",
        "banner_hero": """[#9F1C1C]⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀[/]
[#9F1C1C]⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⣿⠟⠻⣿⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀[/]
[#C7A96B]⠀⠀⠀⠀⠀⠀⠀⣠⣾⡿⠋⠀⠀⠀⠙⢿⣷⣄⠀⠀⠀⠀⠀⠀⠀[/]
[#C7A96B]⠀⠀⠀⠀⠀⢀⣾⡿⠋⠀⠀⢠⡄⠀⠀⠙⢿⣷⡀⠀⠀⠀⠀⠀[/]
[#DD4A3A]⠀⠀⠀⠀⣰⣿⠟⠀⠀⠀⣰⣿⣿⣆⠀⠀⠀⠻⣿⣆⠀⠀⠀⠀[/]
[#DD4A3A]⠀⠀⠀⢰⣿⠏⠀⠀⢀⣾⡿⠉⢿⣷⡀⠀⠀⠹⣿⡆⠀⠀⠀[/]
[#9F1C1C]⠀⠀⠀⣿⡟⠀⠀⣠⣿⠟⠀⠀⠀⠻⣿⣄⠀⠀⢻⣿⠀⠀⠀[/]
[#9F1C1C]⠀⠀⠀⣿⡇⠀⠀⠙⠋⠀⠀⚔⠀⠀⠙⠋⠀⠀⢸⣿⠀⠀⠀[/]
[#6B1717]⠀⠀⠀⢿⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⡿⠀⠀⠀[/]
[#6B1717]⠀⠀⠀⠘⢿⣷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⡿⠃⠀⠀⠀[/]
[#C7A96B]⠀⠀⠀⠀⠈⠻⣿⣷⣦⣤⣀⣀⣤⣤⣶⣿⠿⠋⠀⠀⠀⠀[/]
[#C7A96B]⠀⠀⠀⠀⠀⠀⠀⠉⠛⠿⠿⠿⠿⠛⠉⠀⠀⠀⠀⠀⠀⠀[/]
[#DD4A3A]⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⚔⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀[/]
[dim #6B1717]⠀⠀⠀⠀⠀⠀⠀⠀war god online⠀⠀⠀⠀⠀⠀⠀⠀[/]""",
    },
    "mono": {
        "name": "mono",
        "description": "Monochrome — clean grayscale",
        "colors": {
            "banner_border": "#5E5E5E",
            "banner_title": "#e6edf3",
            "banner_accent": "#aaaaaa",
            "banner_dim": "#606060",
            "banner_text": "#c9d1d9",
            "ui_accent": "#aaaaaa",
            "ui_label": "#888888",
            "ui_ok": "#888888",
            "ui_error": "#cccccc",
            "ui_warn": "#999999",
            "prompt": "#c9d1d9",
            "input_rule": "#606060",
            "response_border": "#aaaaaa",
            "status_bar_bg": "#1F1F1F",
            "status_bar_text": "#C9D1D9",
            "status_bar_strong": "#E6EDF3",
            "status_bar_dim": "#777777",
            "status_bar_good": "#B5B5B5",
            "status_bar_warn": "#AAAAAA",
            "status_bar_bad": "#D0D0D0",
            "status_bar_critical": "#F0F0F0",
            "session_label": "#888888",
            "session_border": "#5E5E5E",
            "completion_menu_bg": "#1F1F1F",
            "completion_menu_current_bg": "#464646",
            "selection_bg": "#505050",
            "shell_dollar": "#aaaaaa",
            "voice_status_bg": "#1F1F1F",
        },
        "spinner": {},
        "branding": {
            "agent_name": "PoorMad",
            "welcome": "Welcome to PoorMad! Type your message or /help for commands.",
            "goodbye": "Goodbye! 🌑",
            "response_label": " 🌑 PoorMad ",
            "prompt_symbol": "❯",
            "help_header": "[?] Available Commands",
        },
        "tool_prefix": "┊",
    },
    "slate": {
        "name": "slate",
        "description": "Cool blue — developer-focused",
        "colors": {
            "banner_border": "#4169e1",
            "banner_title": "#7eb8f6",
            "banner_accent": "#8EA8FF",
            "banner_dim": "#545E6B",
            "banner_text": "#c9d1d9",
            "ui_accent": "#7eb8f6",
            "ui_label": "#8EA8FF",
            "ui_ok": "#63D0A6",
            "ui_error": "#F7A072",
            "ui_warn": "#e6a855",
            "prompt": "#c9d1d9",
            "input_rule": "#4169e1",
            "response_border": "#7eb8f6",
            "status_bar_bg": "#151C2F",
            "status_bar_text": "#C9D1D9",
            "status_bar_strong": "#7EB8F6",
            "status_bar_dim": "#5D6672",
            "status_bar_good": "#63D0A6",
            "status_bar_warn": "#E6A855",
            "status_bar_bad": "#F7A072",
            "status_bar_critical": "#FF7A7A",
            "session_label": "#7eb8f6",
            "session_border": "#545E6B",
            "completion_menu_bg": "#151C2F",
            "completion_menu_current_bg": "#324867",
            "selection_bg": "#3A5375",
            "shell_dollar": "#7eb8f6",
            "voice_status_bg": "#151C2F",
        },
        "spinner": {},
        "branding": {
            "agent_name": "PoorMad",
            "welcome": "Welcome to PoorMad! Type your message or /help for commands.",
            "goodbye": "Goodbye! 🌑",
            "response_label": " 🌑 PoorMad ",
            "prompt_symbol": "❯",
            "help_header": "🌑 Available Commands",
        },
        "tool_prefix": "┊",
    },
    "daylight": {
        "name": "daylight",
        "description": "Light theme for bright terminals with dark text and cool blue accents",
        "colors": {
            "banner_border": "#2563EB",
            "banner_title": "#0F172A",
            "banner_accent": "#1D4ED8",
            "banner_dim": "#475569",
            "banner_text": "#111827",
            "ui_accent": "#2563EB",
            "ui_label": "#0F766E",
            "ui_ok": "#15803D",
            "ui_error": "#B91C1C",
            "ui_warn": "#B45309",
            "prompt": "#111827",
            "input_rule": "#6E94BE",
            "response_border": "#2563EB",
            "status_bar_bg": "#E5EDF8",
            "status_bar_text": "#111827",
            "status_bar_strong": "#2563EB",
            "status_bar_dim": "#838890",
            "status_bar_good": "#15803D",
            "status_bar_warn": "#B45309",
            "status_bar_bad": "#B45309",
            "status_bar_critical": "#B91C1C",
            "session_label": "#1D4ED8",
            "session_border": "#64748B",
            "completion_menu_bg": "#F8FAFC",
            "completion_menu_current_bg": "#DBEAFE",
            "completion_menu_meta_bg": "#EEF2FF",
            "completion_menu_meta_current_bg": "#BFDBFE",
            "selection_bg": "#D3E0FB",
            "shell_dollar": "#2563EB",
            "voice_status_bg": "#E5EDF8",
        },
        "spinner": {},
        "branding": {
            "agent_name": "PoorMad",
            "welcome": "Welcome to PoorMad! Type your message or /help for commands.",
            "goodbye": "Goodbye! 🌑",
            "response_label": " 🌑 PoorMad ",
            "prompt_symbol": "❯",
            "help_header": "[?] Available Commands",
        },
        "tool_prefix": "│",
    },
    "warm-lightmode": {
        "name": "warm-lightmode",
        "description": "Warm light mode — dark brown/gold text for light terminal backgrounds",
        "colors": {
            "banner_border": "#8B6914",
            "banner_title": "#5C3D11",
            "banner_accent": "#8B4513",
            "banner_dim": "#8B7355",
            "banner_text": "#2C1810",
            "ui_accent": "#8B4513",
            "ui_label": "#5C3D11",
            "ui_ok": "#2E7D32",
            "ui_error": "#C62828",
            "ui_warn": "#E65100",
            "prompt": "#2C1810",
            "input_rule": "#8B6914",
            "response_border": "#8B6914",
            "status_bar_bg": "#F5F0E8",
            "status_bar_text": "#2C1810",
            "status_bar_strong": "#8B4513",
            "status_bar_dim": "#8A8F98",
            "status_bar_good": "#2E7D32",
            "status_bar_warn": "#E65100",
            "status_bar_bad": "#DA4D00",
            "status_bar_critical": "#C62828",
            "session_label": "#5C3D11",
            "session_border": "#A0845C",
            "completion_menu_bg": "#F5EFE0",
            "completion_menu_current_bg": "#E8DCC8",
            "completion_menu_meta_bg": "#F0E8D8",
            "completion_menu_meta_current_bg": "#DFCFB0",
            "selection_bg": "#E8DAD0",
            "shell_dollar": "#8B4513",
            "voice_status_bg": "#F5F0E8",
        },
        "spinner": {},
        "branding": {
            "agent_name": "PoorMad",
            "welcome": "Welcome to PoorMad! Type your message or /help for commands.",
            "goodbye": "Goodbye! \u2695",
            "response_label": " \u2695 PoorMad ",
            "prompt_symbol": "\u276f",
            "help_header": "🌑 Available Commands",
        },
        "tool_prefix": "\u250a",
    },
    "poseidon": {
        "name": "poseidon",
        "description": "Ocean-god theme — deep blue and seafoam",
        "colors": {
            "banner_border": "#2A6FB9",
            "banner_title": "#A9DFFF",
            "banner_accent": "#5DB8F5",
            "banner_dim": "#44638F",
            "banner_text": "#EAF7FF",
            "ui_accent": "#5DB8F5",
            "ui_label": "#A9DFFF",
            "ui_ok": "#4caf50",
            "ui_error": "#ef5350",
            "ui_warn": "#ffa726",
            "prompt": "#EAF7FF",
            "input_rule": "#2A6FB9",
            "response_border": "#5DB8F5",
            "status_bar_bg": "#0F2440",
            "status_bar_text": "#EAF7FF",
            "status_bar_strong": "#A9DFFF",
            "status_bar_dim": "#52708A",
            "status_bar_good": "#6ED7B0",
            "status_bar_warn": "#5DB8F5",
            "status_bar_bad": "#3576BC",
            "status_bar_critical": "#D94F4F",
            "session_label": "#A9DFFF",
            "session_border": "#496884",
            "completion_menu_bg": "#0F2440",
            "completion_menu_current_bg": "#254D73",
            "selection_bg": "#2A587F",
            "shell_dollar": "#5DB8F5",
            "voice_status_bg": "#0F2440",
        },
        "spinner": {
            "waiting_faces": ["(≈)", "(Ψ)", "(∿)", "(◌)", "(◠)"],
            "thinking_faces": ["(Ψ)", "(∿)", "(≈)", "(⌁)", "(◌)"],
            "thinking_verbs": [
                "charting currents", "sounding the depth", "reading foam lines",
                "steering the trident", "tracking undertow", "plotting sea lanes",
                "calling the swell", "measuring pressure",
            ],
            "wings": [
                ["⟪≈", "≈⟫"],
                ["⟪Ψ", "Ψ⟫"],
                ["⟪∿", "∿⟫"],
                ["⟪◌", "◌⟫"],
            ],
        },
        "branding": {
            "agent_name": "Poseidon Agent",
            "welcome": "Welcome to Poseidon Agent! Type your message or /help for commands.",
            "goodbye": "Fair winds! Ψ",
            "response_label": " Ψ Poseidon ",
            "prompt_symbol": "Ψ",
            "help_header": "(Ψ) Available Commands",
        },
        "tool_prefix": "│",
        "banner_logo": """[bold #B8E8FF]██████╗  ██████╗ ███████╗███████╗██╗██████╗  ██████╗ ███╗   ██╗       █████╗  ██████╗ ███████╗███╗   ██╗████████╗[/]
[bold #97D6FF]██╔══██╗██╔═══██╗██╔════╝██╔════╝██║██╔══██╗██╔═══██╗████╗  ██║      ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝[/]
[#75C1F6]██████╔╝██║   ██║███████╗█████╗  ██║██║  ██║██║   ██║██╔██╗ ██║█████╗███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║[/]
[#4FA2E0]██╔═══╝ ██║   ██║╚════██║██╔══╝  ██║██║  ██║██║   ██║██║╚██╗██║╚════╝██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║[/]
[#2E7CC7]██║     ╚██████╔╝███████║███████╗██║██████╔╝╚██████╔╝██║ ╚████║      ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║[/]
[#1B4F95]╚═╝      ╚═════╝ ╚══════╝╚══════╝╚═╝╚═════╝  ╚═════╝ ╚═╝  ╚═══╝      ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝[/]""",
        "banner_hero": """[#2A6FB9]⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀[/]
[#5DB8F5]⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⣿⣷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀[/]
[#5DB8F5]⠀⠀⠀⠀⠀⠀⠀⢠⣿⠏⠀Ψ⠀⠹⣿⡄⠀⠀⠀⠀⠀⠀⠀[/]
[#A9DFFF]⠀⠀⠀⠀⠀⠀⠀⣿⡟⠀⠀⠀⠀⠀⢻⣿⠀⠀⠀⠀⠀⠀⠀[/]
[#A9DFFF]⠀⠀⠀≈≈≈≈≈⣿⡇⠀⠀⠀⠀⠀⢸⣿≈≈≈≈≈⠀⠀⠀[/]
[#5DB8F5]⠀⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀⢸⣿⠀⠀⠀⠀⠀⠀⠀[/]
[#2A6FB9]⠀⠀⠀⠀⠀⠀⠀⢿⣧⠀⠀⠀⠀⠀⣼⡿⠀⠀⠀⠀⠀⠀⠀[/]
[#2A6FB9]⠀⠀⠀⠀⠀⠀⠀⠘⢿⣷⣄⣀⣠⣾⡿⠃⠀⠀⠀⠀⠀⠀⠀[/]
[#153C73]⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⣿⡿⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀[/]
[#153C73]⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀[/]
[#5DB8F5]⠀⠀⠀⠀⠀≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈⠀⠀⠀⠀⠀[/]
[#A9DFFF]⠀⠀⠀⠀⠀⠀≈≈≈≈≈≈≈≈≈≈≈≈≈⠀⠀⠀⠀⠀⠀[/]
[dim #153C73]⠀⠀⠀⠀⠀⠀⠀deep waters hold⠀⠀⠀⠀⠀⠀⠀[/]""",
    },
    "sisyphus": {
        "name": "sisyphus",
        "description": "Sisyphean theme — austere grayscale with persistence",
        "colors": {
            "banner_border": "#B7B7B7",
            "banner_title": "#F5F5F5",
            "banner_accent": "#E7E7E7",
            "banner_dim": "#5C5C5C",
            "banner_text": "#D3D3D3",
            "ui_accent": "#E7E7E7",
            "ui_label": "#D3D3D3",
            "ui_ok": "#919191",
            "ui_error": "#E7E7E7",
            "ui_warn": "#B7B7B7",
            "prompt": "#F5F5F5",
            "input_rule": "#656565",
            "response_border": "#B7B7B7",
            "status_bar_bg": "#202020",
            "status_bar_text": "#D3D3D3",
            "status_bar_strong": "#F5F5F5",
            "status_bar_dim": "#6D6D6D",
            "status_bar_good": "#B7B7B7",
            "status_bar_warn": "#D3D3D3",
            "status_bar_bad": "#E7E7E7",
            "status_bar_critical": "#F5F5F5",
            "session_label": "#919191",
            "session_border": "#656565",
            "completion_menu_bg": "#202020",
            "completion_menu_current_bg": "#585858",
            "selection_bg": "#666666",
            "shell_dollar": "#E7E7E7",
            "voice_status_bg": "#202020",
        },
        "spinner": {
            "waiting_faces": ["(◉)", "(◌)", "(◬)", "(⬤)", "(::)"],
            "thinking_faces": ["(◉)", "(◬)", "(◌)", "(○)", "(●)"],
            "thinking_verbs": [
                "finding traction", "measuring the grade", "resetting the boulder",
                "counting the ascent", "testing leverage", "setting the shoulder",
                "pushing uphill", "enduring the loop",
            ],
            "wings": [
                ["⟪◉", "◉⟫"],
                ["⟪◬", "◬⟫"],
                ["⟪◌", "◌⟫"],
                ["⟪⬤", "⬤⟫"],
            ],
        },
        "branding": {
            "agent_name": "Sisyphus Agent",
            "welcome": "Welcome to Sisyphus Agent! Type your message or /help for commands.",
            "goodbye": "The boulder waits. ◉",
            "response_label": " ◉ Sisyphus ",
            "prompt_symbol": "◉",
            "help_header": "(◉) Available Commands",
        },
        "tool_prefix": "│",
        "banner_logo": """[bold #F5F5F5]███████╗██╗███████╗██╗   ██╗██████╗ ██╗  ██╗██╗   ██╗███████╗       █████╗  ██████╗ ███████╗███╗   ██╗████████╗[/]
[bold #E7E7E7]██╔════╝██║██╔════╝╚██╗ ██╔╝██╔══██╗██║  ██║██║   ██║██╔════╝      ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝[/]
[#D7D7D7]███████╗██║███████╗ ╚████╔╝ ██████╔╝███████║██║   ██║███████╗█████╗███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║[/]
[#BFBFBF]╚════██║██║╚════██║  ╚██╔╝  ██╔═══╝ ██╔══██║██║   ██║╚════██║╚════╝██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║[/]
[#8F8F8F]███████║██║███████║   ██║   ██║     ██║  ██║╚██████╔╝███████║      ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║[/]
[#626262]╚══════╝╚═╝╚══════╝   ╚═╝   ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚══════╝      ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝[/]""",
        "banner_hero": """[#B7B7B7]⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣀⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀[/]
[#D3D3D3]⠀⠀⠀⠀⠀⠀⠀⣠⣾⣿⣿⣿⣿⣷⣄⠀⠀⠀⠀⠀⠀⠀⠀[/]
[#E7E7E7]⠀⠀⠀⠀⠀⠀⣾⣿⣿⣿⣿⣿⣿⣿⣷⠀⠀⠀⠀⠀⠀⠀[/]
[#F5F5F5]⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀[/]
[#E7E7E7]⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀[/]
[#D3D3D3]⠀⠀⠀⠀⠀⠀⠘⢿⣿⣿⣿⣿⣿⡿⠃⠀⠀⠀⠀⠀⠀⠀[/]
[#B7B7B7]⠀⠀⠀⠀⠀⠀⠀⠀⠙⠿⣿⠿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀[/]
[#919191]⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀[/]
[#656565]⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀[/]
[#656565]⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀[/]
[#4A4A4A]⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⣿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀[/]
[#4A4A4A]⠀⠀⠀⠀⠀⣀⣴⣿⣿⣿⣿⣿⣿⣦⣀⠀⠀⠀⠀⠀⠀[/]
[#656565]⠀⠀⠀━━━━━━━━━━━━━━━━━━━━━━━⠀⠀⠀[/]
[dim #4A4A4A]⠀⠀⠀⠀⠀⠀⠀⠀⠀the boulder⠀⠀⠀⠀⠀⠀⠀⠀⠀[/]""",
    },
    "charizard": {
        "name": "charizard",
        "description": "Volcanic theme — burnt orange and ember",
        "colors": {
            "banner_border": "#C75B1D",
            "banner_title": "#FFD39A",
            "banner_accent": "#F29C38",
            "banner_dim": "#C58A45",
            "banner_text": "#FFF0D4",
            "ui_accent": "#F29C38",
            "ui_label": "#FFD39A",
            "ui_ok": "#4caf50",
            "ui_error": "#ef5350",
            "ui_warn": "#ffa726",
            "prompt": "#FFF0D4",
            "input_rule": "#C75B1D",
            "response_border": "#F29C38",
            "status_bar_bg": "#2B160E",
            "status_bar_text": "#FFF0D4",
            "status_bar_strong": "#FFD39A",
            "status_bar_dim": "#826144",
            "status_bar_good": "#6BCB77",
            "status_bar_warn": "#F29C38",
            "status_bar_bad": "#E2832B",
            "status_bar_critical": "#EF5350",
            "session_label": "#FFD39A",
            "session_border": "#7B593A",
            "completion_menu_bg": "#0B0503",
            "completion_menu_current_bg": "#4A1B07",
            "completion_menu_meta_bg": "#120806",
            "completion_menu_meta_current_bg": "#5A260D",
            "selection_bg": "#5A260D",
            "shell_dollar": "#F29C38",
            "voice_status_bg": "#2B160E",
        },
        "spinner": {
            "waiting_faces": ["(✦)", "(▲)", "(◇)", "(<>)", "(🔥)"],
            "thinking_faces": ["(✦)", "(▲)", "(◇)", "(⌁)", "(🔥)"],
            "thinking_verbs": [
                "banking into the draft", "measuring burn", "reading the updraft",
                "tracking ember fall", "setting wing angle", "holding the flame core",
                "plotting a hot landing", "coiling for lift",
            ],
            "wings": [
                ["⟪✦", "✦⟫"],
                ["⟪▲", "▲⟫"],
                ["⟪◌", "◌⟫"],
                ["⟪◇", "◇⟫"],
            ],
        },
        "branding": {
            "agent_name": "Charizard Agent",
            "welcome": "Welcome to Charizard Agent! Type your message or /help for commands.",
            "goodbye": "Flame out! ✦",
            "response_label": " ✦ Charizard ",
            "prompt_symbol": "✦",
            "help_header": "(✦) Available Commands",
        },
        "tool_prefix": "│",
        "banner_logo": """[bold #FFF0D4] ██████╗██╗  ██╗ █████╗ ██████╗ ██╗███████╗ █████╗ ██████╗ ██████╗        █████╗  ██████╗ ███████╗███╗   ██╗████████╗[/]
[bold #FFD39A]██╔════╝██║  ██║██╔══██╗██╔══██╗██║╚══███╔╝██╔══██╗██╔══██╗██╔══██╗      ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝[/]
[#F29C38]██║     ███████║███████║██████╔╝██║  ███╔╝ ███████║██████╔╝██║  ██║█████╗███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║[/]
[#E2832B]██║     ██╔══██║██╔══██║██╔══██╗██║ ███╔╝  ██╔══██║██╔══██╗██║  ██║╚════╝██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║[/]
[#C75B1D]╚██████╗██║  ██║██║  ██║██║  ██║██║███████╗██║  ██║██║  ██║██████╔╝      ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║[/]
[#7A3511] ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝       ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝[/]""",
        "banner_hero": """[#FFD39A]⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⠶⠶⠶⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀[/]
[#F29C38]⠀⠀⠀⠀⠀⠀⣴⠟⠁⠀⠀⠀⠀⠈⠻⣦⠀⠀⠀⠀⠀⠀[/]
[#F29C38]⠀⠀⠀⠀⠀⣼⠏⠀⠀⠀✦⠀⠀⠀⠀⠹⣧⠀⠀⠀⠀⠀[/]
[#E2832B]⠀⠀⠀⠀⢰⡟⠀⠀⣀⣤⣤⣤⣀⠀⠀⠀⢻⡆⠀⠀⠀⠀[/]
[#E2832B]⠀⠀⣠⡾⠛⠁⣠⣾⠟⠉⠀⠉⠻⣷⣄⠀⠈⠛⢷⣄⠀⠀[/]
[#C75B1D]⠀⣼⠟⠀⢀⣾⠟⠁⠀⠀⠀⠀⠀⠈⠻⣷⡀⠀⠻⣧⠀[/]
[#C75B1D]⢸⡟⠀⠀⣿⡟⠀⠀⠀🔥⠀⠀⠀⠀⢻⣿⠀⠀⢻⡇[/]
[#7A3511]⠀⠻⣦⡀⠘⢿⣧⡀⠀⠀⠀⠀⠀⢀⣼⡿⠃⢀⣴⠟⠀[/]
[#7A3511]⠀⠀⠈⠻⣦⣀⠙⢿⣷⣤⣤⣤⣾⡿⠋⣀⣴⠟⠁⠀⠀[/]
[#C75B1D]⠀⠀⠀⠀⠈⠙⠛⠶⠤⠭⠭⠤⠶⠛⠋⠁⠀⠀⠀⠀[/]
[#F29C38]⠀⠀⠀⠀⠀⠀⠀⠀⣰⡿⢿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀[/]
[#F29C38]⠀⠀⠀⠀⠀⠀⠀⣼⡟⠀⠀⢻⣧⠀⠀⠀⠀⠀⠀⠀⠀[/]
[dim #7A3511]⠀⠀⠀⠀⠀⠀⠀tail flame lit⠀⠀⠀⠀⠀⠀⠀⠀[/]""",
    },
    "jarvis": {
        "name": "jarvis",
        "description": 'JARVIS — cyan ARC-reactor HUD, rounded neon chrome',
        "box": 'ROUNDED',
        "colors": {
            'banner_border': '#0e3a4a',
            'banner_title': '#67e8f9',
            'banner_accent': '#22d3ee',
            'banner_dim': '#3b7a8c',
            'banner_text': '#cffafe',
            'ui_accent': '#22d3ee',
            'ui_label': '#67e8f9',
            'ui_ok': '#34d399',
            'ui_error': '#f87171',
            'ui_warn': '#fbbf24',
            'prompt': '#67e8f9',
            'input_rule': '#22d3ee',
            'response_border': '#67e8f9',
            'status_bar_bg': '#06141c',
            'status_bar_text': '#cffafe',
            'status_bar_strong': '#67e8f9',
            'status_bar_dim': '#3b7a8c',
            'status_bar_good': '#34d399',
            'status_bar_warn': '#fbbf24',
            'status_bar_bad': '#fb923c',
            'status_bar_critical': '#f87171',
            'session_label': '#67e8f9',
            'session_border': '#0e3a4a',
            'completion_menu_bg': '#06141c',
            'completion_menu_current_bg': '#0e3a4a',
            'selection_bg': '#155e75',
            'shell_dollar': '#22d3ee',
            'voice_status_bg': '#06141c',
        },
        "light_colors": {
            'banner_title': '#0e7490',
            'banner_accent': '#0891b2',
            'banner_dim': '#3b7a8c',
            'banner_text': '#0c4a6e',
            'ui_accent': '#0891b2',
            'ui_label': '#0e7490',
            'ui_ok': '#15803d',
            'ui_error': '#b91c1c',
            'ui_warn': '#b45309',
            'prompt': '#0c4a6e',
            'response_border': '#0e7490',
            'session_label': '#0e7490',
            'status_bar_text': '#334155',
            'status_bar_strong': '#0e7490',
            'status_bar_dim': '#64748b',
            'status_bar_good': '#15803d',
            'status_bar_warn': '#b45309',
            'status_bar_bad': '#c2410c',
            'status_bar_critical': '#b91c1c',
            'shell_dollar': '#0891b2',
            'completion_menu_bg': '#ecfeff',
            'completion_menu_current_bg': '#cffafe',
            'selection_bg': '#a5f3fc',
            'status_bar_bg': '#ecfeff',
            'voice_status_bg': '#ecfeff',
        },
        "spinner": {
            'waiting_faces': ['(◌)', '(◍)', '(◎)', '(◉)', '(●)', '(◉)', '(◎)', '(◍)'],
            'thinking_faces': ['(◌)', '(◍)', '(◎)', '(◉)', '(⚡)', '(◉)', '(◎)', '(◍)'],
            'thinking_verbs': ['initializing', 'computing', 'routing', 'calibrating', 'thinking'],
            'wings': [['⟪◌', '◌⟫'], ['⟪⚡', '⚡⟫'], ['⟪◎', '◎⟫']],
        },
        "branding": {
            'agent_name': 'JARVIS',
            'welcome': 'JARVIS online. Poor in cost, mad in capability. How may I assist?',
            'goodbye': 'Powering down. 🔵',
            'response_label': ' 🔵 JARVIS ',
            'prompt_symbol': '🔵',
            'help_header': '🔵 JARVIS Commands',
        },
        "tool_prefix": '┊',
        "tool_emojis": {
            'terminal': '⚡',
            'web_search': '🔮',
            'image_generation': '🎨',
            'browser': '🌐',
            'code_execution': '⚙',
            'file_read': '📄',
            'file_write': '✍',
            'memory': '🧠',
            'skills': '🔧',
            'tts': '🔊',
            'vision': '👁',
            'cron': '⏱',
        },
        "banner_logo": '[bold #67e8f9]██████╗  ██████╗  ██████╗ ██████╗ ███╗   ███╗ █████╗ ██████╗ [/]\n[#22d3ee]██████╔╝██║   ██║██║   ██║██████╔╝██╔████╔██║███████║██║  ██║[/]\n[#0891b2]██╔═══╝ ██║   ██║██║   ██║██╔══██╗██║╚██╔╝██║██╔══██║██║  ██║[/]\n[#22d3ee]██║     ╚██████╔╝╚██████╔╝██║  ██║██║ ╚═╝ ██║██║  ██║██████╔╝[/]\n[#0891b2]╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═════╝ [/]',
        "banner_hero": '[#22d3ee]⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⠀⢀⡀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀[/]\n[#67e8f9]⠀⠀⠀⠀⠀⠀⠀⠀⢀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⢀⠀⠀⠀⠀⠀⠀⠀[/]\n[#67e8f9]⠀⠀⠀⠀⠀⠀⠀⢀⠀⠀⠀⢀⣴⣶⣶⣶⣶⣶⣶⣦⡀⠀⠀⠀⠀⠀⠀⠀[/]\n[#22d3ee]⠀⠀⠀⠀⠀⢀⣴⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⡀⠀⠀⠀⠀⠀[/]\n[#22d3ee]⠀⠀⠀⠀⣴⣿⣿⣿⣿⣿⣿⣿⣿⠿⠿⠿⣿⣿⣿⣿⣿⣿⣿⣦⠀⠀⠀⠀[/]\n[#0891b2]⠀⠀⠀⣴⣿⣿⣿⣿⣿⣿⣿⠟⠀⠀⠀⠙⢿⣿⣿⣿⣿⣿⣿⣦⠀⠀⠀[/]\n[#0891b2]⠀⠀⢀⣿⣿⣿⣿⣿⣿⣿⠏⠀⠀⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⣿⡀⠀⠀[/]\n[#22d3ee]⠀⠀⠀⠻⣿⣿⣿⣿⣿⣿⣿⣶⣶⣶⣶⣶⣶⣿⣿⣿⣿⣿⣿⠟⠀⠀⠀[/]\n[#22d3ee]⠀⠀⠀⠀⠀⠙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠀⠀⠀⠀⠀[/]\n[#67e8f9]⠀⠀⠀⠀⠀⠀⠀⠙⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠋⠀⠀⠀⠀⠀⠀⠀[/]\n[#67e8f9]⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠻⣿⣿⣿⣿⠟⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀[/]\n[#22d3ee]⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠟⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀[/]\n[dim #0891b2]⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀ARC REACTOR ONLINE⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀[/]',
    },
    "ironman": {
        "name": "ironman",
        "description": 'Iron Man — red & gold HUD, heavy armored chrome',
        "box": 'HEAVY',
        "colors": {
            'banner_border': '#5a1a0a',
            'banner_title': '#fbbf24',
            'banner_accent': '#ef4444',
            'banner_dim': '#a16207',
            'banner_text': '#fde68a',
            'ui_accent': '#ef4444',
            'ui_label': '#fbbf24',
            'ui_ok': '#34d399',
            'ui_error': '#f87171',
            'ui_warn': '#fbbf24',
            'prompt': '#fbbf24',
            'input_rule': '#ef4444',
            'response_border': '#fbbf24',
            'status_bar_bg': '#1a0606',
            'status_bar_text': '#fde68a',
            'status_bar_strong': '#fbbf24',
            'status_bar_dim': '#a16207',
            'status_bar_good': '#34d399',
            'status_bar_warn': '#fbbf24',
            'status_bar_bad': '#fb923c',
            'status_bar_critical': '#f87171',
            'session_label': '#fbbf24',
            'session_border': '#5a1a0a',
            'completion_menu_bg': '#1a0606',
            'completion_menu_current_bg': '#5a1a0a',
            'selection_bg': '#7f1d1d',
            'shell_dollar': '#ef4444',
            'voice_status_bg': '#1a0606',
        },
        "light_colors": {
            'banner_title': '#b45309',
            'banner_accent': '#b91c1c',
            'banner_dim': '#a16207',
            'banner_text': '#78350f',
            'ui_accent': '#b91c1c',
            'ui_label': '#b45309',
            'ui_ok': '#15803d',
            'ui_error': '#b91c1c',
            'ui_warn': '#b45309',
            'prompt': '#78350f',
            'response_border': '#b45309',
            'session_label': '#b45309',
            'status_bar_text': '#44403c',
            'status_bar_strong': '#b45309',
            'status_bar_dim': '#78716c',
            'status_bar_good': '#15803d',
            'status_bar_warn': '#b45309',
            'status_bar_bad': '#c2410c',
            'status_bar_critical': '#b91c1c',
            'shell_dollar': '#b91c1c',
            'completion_menu_bg': '#fffbeb',
            'completion_menu_current_bg': '#fef3c7',
            'selection_bg': '#fde68a',
            'status_bar_bg': '#fffbeb',
            'voice_status_bg': '#fffbeb',
        },
        "spinner": {
            'waiting_faces': ['(▰)', '(▰▱)', '(▰▰)', '(▰▰▱)', '(▱▰▰)', '(▱▰)', '(▱)', '(▱▰)'],
            'thinking_faces': ['(▰)', '(◣)', '(◢)', '(▰)', '(⚡)', '(▰)', '(◣)', '(◢)'],
            'thinking_verbs': ['arming', 'scanning', 'targeting', 'computing', 'deploying'],
            'wings': [['⟪▰', '▰⟫'], ['⟪⚡', '⚡⟫'], ['⟪◣', '◢⟫']],
        },
        "branding": {
            'agent_name': 'Stark OS',
            'welcome': "Stark OS engaged. Poor in cost, mad in capability. What's the mission?",
            'goodbye': 'Disengaging. 🔴',
            'response_label': ' 🔴 STARK ',
            'prompt_symbol': '🔴',
            'help_header': '🔴 STARK OS Commands',
        },
        "tool_prefix": '╽',
        "tool_emojis": {
            'terminal': '⚡',
            'web_search': '🔮',
            'image_generation': '🎨',
            'browser': '🌐',
            'code_execution': '⚙',
            'file_read': '📄',
            'file_write': '✍',
            'memory': '🧠',
            'skills': '🔧',
            'tts': '🔊',
            'vision': '👁',
            'cron': '⏱',
        },
        "banner_logo": '[bold #fbbf24]██████╗  ██████╗  ██████╗ ██████╗ ███╗   ███╗ █████╗ ██████╗ [/]\n[#ef4444]██████╔╝██║   ██║██║   ██║██████╔╝██╔████╔██║███████║██║  ██║[/]\n[#b91c1c]██╔═══╝ ██║   ██║██║   ██║██╔══██╗██║╚██╔╝██║██╔══██║██║  ██║[/]\n[#ef4444]██║     ╚██████╔╝╚██████╔╝██║  ██║██║ ╚═╝ ██║██║  ██║██████╔╝[/]\n[#b91c1c]╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═════╝ [/]',
        "banner_hero": '[#ef4444]⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⣿⣷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀[/]\n[#fbbf24]⠀⠀⠀⠀⠀⠀⠀⠀⢀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣦⡀⠀⠀⠀⠀⠀⠀⠀[/]\n[#fbbf24]⠀⠀⠀⠀⠀⣀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⡀⠀⠀⠀⠀⠀[/]\n[#ef4444]⠀⠀⠀⣠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀[/]\n[#ef4444]⠀⠀⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⠛⠛⠛⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀[/]\n[#b91c1c]⠀⢠⣿⣿⣿⣿⣿⣿⣿⠟⠀⠀⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⡆⠀⠀[/]\n[#b91c1c]⠀⣿⣿⣿⣿⣿⣿⠏⠀⠀⠀⡌⢳⡀⠀⠀⠹⣿⣿⣿⣿⣿⣿⠀⠀[/]\n[#ef4444]⠀⠀⠻⣿⣿⣿⣿⣿⣿⣶⣶⣶⣶⣶⣶⣿⣿⣿⣿⣿⣿⠟⠀⠀[/]\n[#ef4444]⠀⠀⠀⠀⠙⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠋⠀⠀⠀⠀[/]\n[#fbbf24]⠀⠀⠀⠀⠀⠀⠀⠙⠻⣿⣿⣿⣿⣿⣿⣿⠟⠋⠀⠀⠀⠀⠀⠀⠀[/]\n[#fbbf24]⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠻⣿⣿⠟⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀[/]\n[#ef4444]⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀[/]\n[dim #b91c1c]⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀REPULSOR CORE READY⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀[/]',
    },
    "agentic-os": {
        "name": "agentic-os",
        "description": 'Agentic OS — matrix-green terminal operating system',
        "box": 'ASCII',
        "colors": {
            'banner_border': '#0a2e0a',
            'banner_title': '#4ade80',
            'banner_accent': '#22c55e',
            'banner_dim': '#15803d',
            'banner_text': '#bbf7d0',
            'ui_accent': '#22c55e',
            'ui_label': '#4ade80',
            'ui_ok': '#4ade80',
            'ui_error': '#f87171',
            'ui_warn': '#facc15',
            'prompt': '#4ade80',
            'input_rule': '#22c55e',
            'response_border': '#4ade80',
            'status_bar_bg': '#021107',
            'status_bar_text': '#bbf7d0',
            'status_bar_strong': '#4ade80',
            'status_bar_dim': '#15803d',
            'status_bar_good': '#4ade80',
            'status_bar_warn': '#facc15',
            'status_bar_bad': '#fb923c',
            'status_bar_critical': '#f87171',
            'session_label': '#4ade80',
            'session_border': '#0a2e0a',
            'completion_menu_bg': '#021107',
            'completion_menu_current_bg': '#0a2e0a',
            'selection_bg': '#14532d',
            'shell_dollar': '#22c55e',
            'voice_status_bg': '#021107',
        },
        "light_colors": {
            'banner_title': '#15803d',
            'banner_accent': '#16a34a',
            'banner_dim': '#15803d',
            'banner_text': '#14532d',
            'ui_accent': '#16a34a',
            'ui_label': '#15803d',
            'ui_ok': '#15803d',
            'ui_error': '#b91c1c',
            'ui_warn': '#a16207',
            'prompt': '#14532d',
            'response_border': '#15803d',
            'session_label': '#15803d',
            'status_bar_text': '#334155',
            'status_bar_strong': '#15803d',
            'status_bar_dim': '#64748b',
            'status_bar_good': '#15803d',
            'status_bar_warn': '#a16207',
            'status_bar_bad': '#c2410c',
            'status_bar_critical': '#b91c1c',
            'shell_dollar': '#16a34a',
            'completion_menu_bg': '#f0fdf4',
            'completion_menu_current_bg': '#dcfce7',
            'selection_bg': '#bbf7d0',
            'status_bar_bg': '#f0fdf4',
            'voice_status_bg': '#f0fdf4',
        },
        "spinner": {
            'waiting_faces': ['[|]', '[/]', '[-]', '[\\]', '[|]', '[/]', '[-]', '[\\]'],
            'thinking_faces': ['(>_)', '(>_<)', '(o_o)', '(@_@)', '(>_)', '(^_^)', '(o_o)', '(@_@)'],
            'thinking_verbs': ['booting', 'spawning', 'executing', 'indexing', 'thinking'],
            'wings': [['< ', ' >'], ['[ ', ' ]'], ['<<', '>>']],
        },
        "branding": {
            'agent_name': 'AgenticOS',
            'welcome': 'AgenticOS v1.0 — login: poormad. Poor in cost, mad in capability.',
            'goodbye': 'shutdown -h now. 🟢',
            'response_label': ' 🟢 AgenticOS ',
            'prompt_symbol': '🟢',
            'help_header': '🟢 AgenticOS :: help',
        },
        "tool_prefix": '>',
        "tool_emojis": {
            'terminal': '⚡',
            'web_search': '🔮',
            'image_generation': '🎨',
            'browser': '🌐',
            'code_execution': '⚙',
            'file_read': '📄',
            'file_write': '✍',
            'memory': '🧠',
            'skills': '🔧',
            'tts': '🔊',
            'vision': '👁',
            'cron': '⏱',
        },
        "banner_logo": '[bold #4ade80] ____   ___  ___ ___  _  _  ___  ___ [/]\n[#22c55e]|  _ \\ / _ \\/ __| _ \\| || |/ _ \\/ __|[/]\n[#15803d]| |_) | (_) | (_ |  _/| __ | (_) \\__ \\\n[#22c55e]|  __/ \\___/ \\___|_|  |_||_|\\___/|___/[/]\n[#4ade80]|_|  Agentic Operating System[/]',
        "banner_hero": '[#22c55e]+----------------------------+[/]\n[#4ade80]| > boot agentic-os v1.0   |[/]\n[#4ade80]| > mount /skills ...... ok |[/]\n[#4ade80]| > mount /memory ..... ok |[/]\n[#22c55e]| > spawn core agent .. ok |[/]\n[#4ade80]| > net link .......... ok |[/]\n[#4ade80]| > user: poormad @ ~      |[/]\n[#22c55e]+----------------------------+[/]\n[#15803d]|# cat /proc/capability   |[/]\n[#4ade80]|# POOR IN COST           |[/]\n[#4ade80]|# MAD  IN CAPABILITY     |[/]\n[#22c55e]+----------------------------+[/]',
    },
    "aurora": {
        "name": "aurora",
        "description": 'Aurora — animated violet↔teal nebula, breathing accent',
        "box": 'DOUBLE',
        "accent_cycle": ['#8b5cf6', '#a855f7', '#6366f1', '#22d3ee', '#2dd4bf', '#8b5cf6'],
        "colors": {
            'banner_border': '#1e1b3a',
            'banner_title': '#c4b5fd',
            'banner_accent': '#22d3ee',
            'banner_dim': '#6b6480',
            'banner_text': '#e0e7ff',
            'ui_accent': '#8b5cf6',
            'ui_label': '#a78bfa',
            'ui_ok': '#34d399',
            'ui_error': '#f87171',
            'ui_warn': '#fbbf24',
            'prompt': '#c4b5fd',
            'input_rule': '#8b5cf6',
            'response_border': '#c4b5fd',
            'status_bar_bg': '#0c0a1f',
            'status_bar_text': '#e0e7ff',
            'status_bar_strong': '#c4b5fd',
            'status_bar_dim': '#6b6480',
            'status_bar_good': '#34d399',
            'status_bar_warn': '#fbbf24',
            'status_bar_bad': '#fb923c',
            'status_bar_critical': '#f87171',
            'session_label': '#c4b5fd',
            'session_border': '#1e1b3a',
            'completion_menu_bg': '#0c0a1f',
            'completion_menu_current_bg': '#241f4a',
            'selection_bg': '#3b2f6b',
            'shell_dollar': '#22d3ee',
            'voice_status_bg': '#0c0a1f',
        },
        "light_colors": {
            'banner_title': '#6d28d9',
            'banner_accent': '#0e7490',
            'banner_dim': '#6b6480',
            'banner_text': '#1e1b4b',
            'ui_accent': '#7c3aed',
            'ui_label': '#6d28d9',
            'ui_ok': '#15803d',
            'ui_error': '#b91c1c',
            'ui_warn': '#b45309',
            'prompt': '#1e1b4b',
            'response_border': '#6d28d9',
            'session_label': '#6d28d9',
            'status_bar_text': '#334155',
            'status_bar_strong': '#6d28d9',
            'status_bar_dim': '#64748b',
            'status_bar_good': '#15803d',
            'status_bar_warn': '#b45309',
            'status_bar_bad': '#c2410c',
            'status_bar_critical': '#b91c1c',
            'shell_dollar': '#0e7490',
            'completion_menu_bg': '#f5f3ff',
            'completion_menu_current_bg': '#ede9fe',
            'selection_bg': '#ddd6fe',
            'status_bar_bg': '#f5f3ff',
            'voice_status_bg': '#f5f3ff',
        },
        "spinner": {
            'waiting_faces': ['(◐)', '(◓)', '(◑)', '(◒)', '(◐)', '(◓)', '(◑)', '(◒)'],
            'thinking_faces': ['(◐)', '(◓)', '(◑)', '(◒)', '(✦)', '(◒)', '(◑)', '(◓)'],
            'thinking_verbs': ['dreaming', 'weaving', 'flowing', 'shifting', 'thinking'],
            'wings': [['⟪✦', '✦⟫'], ['⟪◐', '◑⟫'], ['⟪🌌', '🌌⟫']],
        },
        "branding": {
            'agent_name': 'Aurora',
            'welcome': 'Aurora awakens. Poor in cost, mad in capability. The lights are yours.',
            'goodbye': 'Fading to stardust. 🌌',
            'response_label': ' 🌌 Aurora ',
            'prompt_symbol': '🌌',
            'help_header': '🌌 Aurora Commands',
        },
        "tool_prefix": '┊',
        "tool_emojis": {
            'terminal': '⚡',
            'web_search': '🔮',
            'image_generation': '🎨',
            'browser': '🌐',
            'code_execution': '⚙',
            'file_read': '📄',
            'file_write': '✍',
            'memory': '🧠',
            'skills': '🔧',
            'tts': '🔊',
            'vision': '👁',
            'cron': '⏱',
        },
        "banner_logo": '[bold #c4b5fd]██████╗  ██████╗  ██████╗ ██████╗ ███╗   ███╗ █████╗ ██████╗ [/]\n[#22d3ee]██████╔╝██║   ██║██║   ██║██████╔╝██╔████╔██║███████║██║  ██║[/]\n[#8b5cf6]██╔═══╝ ██║   ██║██║   ██║██╔══██╗██║╚██╔╝██║██╔══██║██║  ██║[/]\n[#22d3ee]██║     ╚██████╔╝╚██████╔╝██║  ██║██║ ╚═╝ ██║██║  ██║██████╔╝[/]\n[#8b5cf6]╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═════╝ [/]',
        "banner_hero": '[#22d3ee]⠀⠀⠀⠀⠀⠀⢀⣤⡤⠀⠀⠀⠀⠀⠀⢀⣤⡤⠀⠀⠀⠀⠀⠀⠀⠀[/]\n[#8b5cf6]⠀⠀⠀⠀⢀⣴⣿⣿⣿⣦⡀⠀⠀⢀⣴⣿⣿⣿⣦⡀⠀⠀⠀⠀⠀⠀[/]\n[#8b5cf6]⠀⠀⢀⣴⣿⣿⣿⣿⣿⣿⣿⣦⡀⣴⣿⣿⣿⣿⣿⣿⣦⡀⠀⠀⠀⠀[/]\n[#22d3ee]⠀⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀[/]\n[#22d3ee]⠀⣿⣿⣿⣿⣿⣿⣿⠟⠛⠛⠻⣿⣿⣿⠟⠛⠛⠻⣿⣿⣿⣿⠀⠀[/]\n[#8b5cf6]⠀⠀⠻⣿⣿⣿⣿⣿⠏⠀⠀⠀⠀⠀⠹⣿⣿⣿⣿⣿⠟⠀⠀⠀[/]\n[#8b5cf6]⠀⠀⠀⠀⠻⣿⣿⣿⣶⣶⣶⣶⣶⣶⣿⣿⣿⠟⠀⠀⠀⠀⠀[/]\n[#22d3ee]⠀⠀⠀⠀⠀⠀⠙⠻⣿⣿⣿⣿⣿⣿⠟⠋⠀⠀⠀⠀⠀⠀⠀⠀[/]\n[#22d3ee]⠀⠀⠀⠀⠀⠀⠀⠀⠙⠻⣿⣿⣿⠟⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀[/]\n[#8b5cf6]⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀[/]\n[dim #8b5cf6]⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀🌌 lights shifting 🌌⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀[/]',
    },
}


# =============================================================================
# Skin loading and management
# =============================================================================

_active_skin: Optional[SkinConfig] = None
_active_skin_name: str = "default"


def _skins_dir() -> Path:
    """User skins directory."""
    return get_poormad_home() / "skins"


def _load_skin_from_yaml(path: Path) -> Optional[Dict[str, Any]]:
    """Load a skin definition from a YAML file."""
    try:
        import yaml
        with open(path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
        if isinstance(data, dict) and "name" in data:
            return data
    except Exception as e:
        logger.debug("Failed to load skin from %s: %s", path, e)
    return None


def _mapping_or_empty(value: Any, *, section: str, skin_name: str) -> Dict[str, Any]:
    """Return a mapping value or an empty dict when the section type is invalid."""
    if isinstance(value, dict):
        return value
    if value is None:
        return {}
    logger.warning(
        "Skin '%s' has invalid '%s' section type (%s); ignoring section",
        skin_name,
        section,
        type(value).__name__,
    )
    return {}


def _build_skin_config(data: Dict[str, Any]) -> SkinConfig:
    """Build a SkinConfig from a raw dict (built-in or loaded from YAML)."""
    # Start with default values as base for missing keys
    default = _BUILTIN_SKINS["default"]
    skin_name = str(data.get("name", "unknown"))
    color_overrides = _mapping_or_empty(data.get("colors"), section="colors", skin_name=skin_name)
    spinner_overrides = _mapping_or_empty(data.get("spinner"), section="spinner", skin_name=skin_name)
    branding_overrides = _mapping_or_empty(data.get("branding"), section="branding", skin_name=skin_name)
    emoji_overrides = _mapping_or_empty(data.get("tool_emojis"), section="tool_emojis", skin_name=skin_name)

    colors = dict(default.get("colors", {}))
    colors.update(color_overrides)
    spinner = dict(default.get("spinner", {}))
    spinner.update(spinner_overrides)
    branding = dict(default.get("branding", {}))
    branding.update(branding_overrides)

    # Paired palettes are NOT merged over the default skin's blocks: an empty
    # block means "this skin has no hand-tuned variant for that polarity", and
    # consumers (the TUI) fall back to `colors` + automatic adaptation. Merging
    # the default's gold light palette under a crimson skin would be worse
    # than adapting the crimson.
    light_colors = _mapping_or_empty(data.get("light_colors"), section="light_colors", skin_name=skin_name)
    dark_colors = _mapping_or_empty(data.get("dark_colors"), section="dark_colors", skin_name=skin_name)

    return SkinConfig(
        name=skin_name,
        description=data.get("description", ""),
        colors=colors,
        light_colors=light_colors,
        dark_colors=dark_colors,
        spinner=spinner,
        branding=branding,
        tool_prefix=data.get("tool_prefix", default.get("tool_prefix", "┊")),
        tool_emojis=emoji_overrides,
        banner_logo=data.get("banner_logo", ""),
        banner_hero=data.get("banner_hero", ""),
        box=str(data.get("box", default.get("box", "ROUNDED"))),
        accent_cycle=list(data.get("accent_cycle", default.get("accent_cycle", [])) or []),
    )


def list_skins() -> List[Dict[str, str]]:
    """List all available skins (built-in + user-installed).

    Returns list of {"name": ..., "description": ..., "source": "builtin"|"user"}.
    """
    result = []
    for name, data in _BUILTIN_SKINS.items():
        result.append({
            "name": name,
            "description": data.get("description", ""),
            "source": "builtin",
        })

    skins_path = _skins_dir()
    if skins_path.is_dir():
        for f in sorted(skins_path.glob("*.yaml")):
            data = _load_skin_from_yaml(f)
            if data:
                skin_name = data.get("name", f.stem)
                # Skip if it shadows a built-in
                if any(s["name"] == skin_name for s in result):
                    continue
                result.append({
                    "name": skin_name,
                    "description": data.get("description", ""),
                    "source": "user",
                })

    return result


def load_skin(name: str) -> SkinConfig:
    """Load a skin by name. Checks user skins first, then built-in."""
    # Check user skins directory
    skins_path = _skins_dir()
    user_file = skins_path / f"{name}.yaml"
    if user_file.is_file():
        data = _load_skin_from_yaml(user_file)
        if data:
            return _build_skin_config(data)

    # Check built-in skins
    if name in _BUILTIN_SKINS:
        return _build_skin_config(_BUILTIN_SKINS[name])

    # Fallback to default
    logger.warning("Skin '%s' not found, using default", name)
    return _build_skin_config(_BUILTIN_SKINS["default"])


def get_active_skin() -> SkinConfig:
    """Get the currently active skin config (cached)."""
    global _active_skin
    if _active_skin is None:
        _active_skin = load_skin(_active_skin_name)
    return _active_skin


def set_active_skin(name: str) -> SkinConfig:
    """Switch the active skin. Returns the new SkinConfig."""
    global _active_skin, _active_skin_name
    _active_skin_name = name
    _active_skin = load_skin(name)
    return _active_skin


def get_active_skin_name() -> str:
    """Get the name of the currently active skin."""
    return _active_skin_name


def init_skin_from_config(config: dict) -> None:
    """Initialize the active skin from CLI config at startup.

    Call this once during CLI init with the loaded config dict.
    """
    display = config.get("display") or {}
    if not isinstance(display, dict):
        display = {}
    skin_name = display.get("skin", "default")
    if isinstance(skin_name, str) and skin_name.strip():
        set_active_skin(skin_name.strip())
    else:
        set_active_skin("default")


# =============================================================================
# Convenience helpers for CLI modules
# =============================================================================


def get_active_prompt_symbol(fallback: str = "❯") -> str:
    """Return the interactive prompt symbol with a single trailing space.

    Skins store ``prompt_symbol`` as a bare token (no spaces). The trailing
    space is appended here so callers can drop it straight into a rendered
    prompt without hand-rolling whitespace.
    """
    try:
        raw = get_active_skin().get_branding("prompt_symbol", fallback)
    except Exception:
        raw = fallback

    cleaned = (raw or fallback).strip()

    return f"{cleaned or fallback.strip()} "



def get_active_help_header(fallback: str = "🌑 Available Commands") -> str:
    """Get the /help header from the active skin."""
    try:
        return get_active_skin().get_branding("help_header", fallback)
    except Exception:
        return fallback



def get_active_goodbye(fallback: str = "Goodbye! 🌑") -> str:
    """Get the goodbye line from the active skin."""
    try:
        return get_active_skin().get_branding("goodbye", fallback)
    except Exception:
        return fallback



def get_prompt_toolkit_style_overrides() -> Dict[str, str]:
    """Return prompt_toolkit style overrides derived from the active skin.

    These are layered on top of the CLI's base TUI style so /skin can refresh
    the live prompt_toolkit UI immediately without rebuilding the app.
    """
    try:
        skin = get_active_skin()
    except Exception:
        return {}

    # Input/prompt: leave unset by default so the typed text inherits
    # the terminal's foreground color (readable in both light and dark
    # color schemes).  Skins can opt into a colored prompt by setting
    # `prompt` explicitly in their YAML.
    prompt = skin.get_color("prompt", "")
    input_rule = skin.get_color("input_rule", "#CD7F32")
    title = skin.get_color("banner_title", "#FFD700")
    text = skin.get_color("banner_text", "#FFF8DC")
    dim = skin.get_color("banner_dim", "#555555")
    label = skin.get_color("ui_label", title)
    warn = skin.get_color("ui_warn", "#FF8C00")
    error = skin.get_color("ui_error", "#FF6B6B")
    status_bg = skin.get_color("status_bar_bg", "#1a1a2e")
    status_text = skin.get_color("status_bar_text", text)
    status_strong = skin.get_color("status_bar_strong", title)
    status_dim = skin.get_color("status_bar_dim", dim)
    status_good = skin.get_color("status_bar_good", skin.get_color("ui_ok", "#8FBC8F"))
    status_warn = skin.get_color("status_bar_warn", warn)
    status_bad = skin.get_color("status_bar_bad", skin.get_color("banner_accent", warn))
    status_critical = skin.get_color("status_bar_critical", error)
    voice_bg = skin.get_color("voice_status_bg", status_bg)
    menu_bg = skin.get_color("completion_menu_bg", "#1a1a2e")
    menu_current_bg = skin.get_color("completion_menu_current_bg", "#333355")
    menu_meta_bg = skin.get_color("completion_menu_meta_bg", menu_bg)
    menu_meta_current_bg = skin.get_color("completion_menu_meta_current_bg", menu_current_bg)

    return {
        # Typed input always uses terminal default fg/bg so it's
        # readable in both light and dark Terminal.app modes.  The
        # skin's `prompt` color (if any) only styles the prompt symbol,
        # NOT the user's typed text.
        "input-area": "",
        "placeholder": f"{dim} italic",
        "prompt": prompt,
        "prompt-working": f"{dim} italic",
        "hint": f"{dim} italic",
        "status-bar": f"bg:{status_bg} {status_text}",
        "status-bar-strong": f"bg:{status_bg} {status_strong} bold",
        "status-bar-dim": f"bg:{status_bg} {status_dim}",
        "status-bar-good": f"bg:{status_bg} {status_good} bold",
        "status-bar-warn": f"bg:{status_bg} {status_warn} bold",
        "status-bar-bad": f"bg:{status_bg} {status_bad} bold",
        "status-bar-critical": f"bg:{status_bg} {status_critical} bold",
        "input-rule": input_rule,
        "image-badge": f"{label} bold",
        "completion-menu": f"bg:{menu_bg} {text}",
        "completion-menu.completion": f"bg:{menu_bg} {text}",
        "completion-menu.completion.current": f"bg:{menu_current_bg} {title}",
        "completion-menu.meta.completion": f"bg:{menu_meta_bg} {dim}",
        "completion-menu.meta.completion.current": f"bg:{menu_meta_current_bg} {label}",
        "clarify-border": input_rule,
        "clarify-title": f"{title} bold",
        "clarify-question": f"{text} bold",
        "clarify-choice": dim,
        "clarify-selected": f"{title} bold",
        "clarify-active-other": f"{title} italic",
        "clarify-countdown": input_rule,
        "sudo-prompt": f"{error} bold",
        "sudo-border": input_rule,
        "sudo-title": f"{error} bold",
        "sudo-text": text,
        "approval-border": input_rule,
        "approval-title": f"{warn} bold",
        "approval-desc": f"{text} bold",
        "approval-cmd": f"{dim} italic",
        "approval-choice": dim,
        "approval-selected": f"{title} bold",
        "voice-status": f"bg:{voice_bg} {label}",
        "voice-status-recording": f"bg:{voice_bg} {error} bold",
    }
