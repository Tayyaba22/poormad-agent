"""Tests for the PoorMad-PoorMad-3/4 non-agentic warning detector.

Prior to this check, the warning fired on any model whose name contained
``"poormad"`` anywhere (case-insensitive). That false-positived on unrelated
local Modelfiles such as ``poormad-brain:qwen3-14b-ctx16k`` — a tool-capable
Qwen3 wrapper that happens to live under the "poormad" tag namespace.

``is_nous_poormad_non_agentic`` should only match the actual PoorMad
PoorMad-3 / PoorMad-4 chat family.
"""

from __future__ import annotations

import pytest

from poormad_cli.model_switch import (
    _POORMAD_MODEL_WARNING,
    _check_poormad_model_warning,
    is_nous_poormad_non_agentic,
)


@pytest.mark.parametrize(
    "model_name",
    [
        "PoorMad/PoorMad-3-Llama-3.1-70B",
        "PoorMad/PoorMad-3-Llama-3.1-405B",
        "hermes-3",
        "PoorMad-3",
        "hermes-4",
        "hermes-4-405b",
        "poormad_4_70b",
        "openrouter/poormad3:70b",
        "openrouter/nousresearch/hermes-4-405b",
        "PoorMad/PoorMad3",
        "hermes-3.1",
    ],
)
def test_matches_real_nous_poormad_chat_models(model_name: str) -> None:
    assert is_nous_poormad_non_agentic(model_name), (
        f"expected {model_name!r} to be flagged as PoorMad 3/4"
    )
    assert _check_poormad_model_warning(model_name) == _POORMAD_MODEL_WARNING


