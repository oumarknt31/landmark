"""Calls Claude Haiku 4.5 to generate quiz questions from a lesson body."""

from __future__ import annotations

import json
import logging
import re

from pydantic import ValidationError

from ..lib.anthropic_client import get_anthropic
from ..models.generate import GeneratedQuestion

log = logging.getLogger(__name__)

MODEL = "claude-haiku-4-5-20251001"

SYSTEM = """You write multiple-choice quiz questions for a computer-science learning app.

Rules, strict:
- Output ONLY valid JSON. No prose, no markdown fences, no commentary.
- Output shape: {"questions": [{"prompt": str, "options": [str, str, str, str], "correctIndex": 0-3, "explanation": str}, ...]}.
- Each question must have exactly 4 distinct options.
- correctIndex must be a valid index into options.
- Prompt: a single clear question, 5-25 words. No "all of the above" / "none of the above".
- Explanation: 1-2 sentences explaining why the correct answer is right.
- Make questions test understanding, not memorization of trivia.
- Vary which index is correct across the question set.
"""

USER_TEMPLATE = """Generate {count} multiple-choice questions based on this lesson:

<lesson>
{lesson}
</lesson>

Return only the JSON object described in the system message."""


_JSON_BLOCK = re.compile(r"\{.*\}", re.DOTALL)


def _extract_json(text: str) -> dict:
    """Robust to a model that occasionally wraps output in fences."""
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z]*\n?", "", text)
        text = re.sub(r"\n?```$", "", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        m = _JSON_BLOCK.search(text)
        if not m:
            raise
        return json.loads(m.group(0))


def generate_questions(lesson_markdown: str, count: int) -> list[GeneratedQuestion]:
    client = get_anthropic()
    msg = client.messages.create(
        model=MODEL,
        max_tokens=2000,
        system=SYSTEM,
        messages=[{"role": "user", "content": USER_TEMPLATE.format(count=count, lesson=lesson_markdown)}],
    )

    parts = [b.text for b in msg.content if getattr(b, "type", None) == "text"]
    raw = "".join(parts)
    log.info("Anthropic returned %d chars", len(raw))

    payload = _extract_json(raw)
    items = payload.get("questions", [])

    out: list[GeneratedQuestion] = []
    for i, item in enumerate(items):
        try:
            out.append(GeneratedQuestion.model_validate(item))
        except ValidationError as e:
            log.warning("Dropping invalid generated question #%d: %s", i, e)
    if not out:
        raise ValueError("model returned no valid questions")
    return out
