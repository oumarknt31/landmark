"""pandas analytics over a user's progress JSONB blob."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

import pandas as pd


def _attempts_dataframe(attempts: list[dict[str, Any]]) -> pd.DataFrame:
    if not attempts:
        return pd.DataFrame(
            columns=["topicId", "score", "totalQuestions", "completedAt", "accuracy"]
        )
    df = pd.DataFrame(attempts)
    df["completedAt"] = pd.to_datetime(df["completedAt"], utc=True, errors="coerce")
    df["accuracy"] = df["score"] / df["totalQuestions"].clip(lower=1)
    return df.sort_values("completedAt").reset_index(drop=True)


def weakest_topics(df: pd.DataFrame, limit: int = 5) -> list[dict[str, Any]]:
    if df.empty:
        return []
    grouped = (
        df.groupby("topicId")
        .agg(
            attempts=("topicId", "count"),
            avg_accuracy=("accuracy", "mean"),
            best_accuracy=("accuracy", "max"),
            last_attempt=("completedAt", "max"),
        )
        .reset_index()
        .sort_values("avg_accuracy", ascending=True)
        .head(limit)
    )
    return [
        {
            "topicId": row.topicId,
            "attempts": int(row.attempts),
            "avgAccuracy": round(float(row.avg_accuracy), 3),
            "bestAccuracy": round(float(row.best_accuracy), 3),
            "lastAttempt": row.last_attempt.isoformat() if pd.notna(row.last_attempt) else None,
        }
        for row in grouped.itertuples()
    ]


def xp_last_30_days(daily_xp: dict[str, int]) -> list[dict[str, Any]]:
    today = datetime.now(timezone.utc).date()
    start = today - timedelta(days=29)
    series = pd.Series(
        {pd.Timestamp(k).date(): int(v) for k, v in (daily_xp or {}).items() if v},
        dtype="int64",
    )
    out = []
    for i in range(30):
        d = start + timedelta(days=i)
        out.append({"date": d.isoformat(), "xp": int(series.get(d, 0))})
    return out


def accuracy_trend(df: pd.DataFrame, window: int = 5) -> list[dict[str, Any]]:
    """Rolling-window mean accuracy over the user's attempts in chronological order."""
    if df.empty:
        return []
    rolled = df["accuracy"].rolling(window=window, min_periods=1).mean()
    return [
        {
            "completedAt": ts.isoformat() if pd.notna(ts) else None,
            "rollingAccuracy": round(float(r), 3),
        }
        for ts, r in zip(df["completedAt"], rolled, strict=False)
    ]


def current_streak(daily_xp: dict[str, int]) -> int:
    """Consecutive days (ending today or yesterday) with XP > 0."""
    if not daily_xp:
        return 0
    earned = {k for k, v in daily_xp.items() if v}
    today = datetime.now(timezone.utc).date()
    # Allow a one-day grace: if today has no XP but yesterday does, count from yesterday.
    cursor = today if today.isoformat() in earned else (today - timedelta(days=1))
    streak = 0
    while cursor.isoformat() in earned:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


def summarize(state: dict[str, Any]) -> dict[str, Any]:
    attempts = state.get("attempts") or []
    df = _attempts_dataframe(attempts)
    daily_xp = state.get("dailyXp") or {}
    xp_by_source = state.get("xpBySource") or {"quiz": 0, "lesson": 0}

    total_xp = int(sum(daily_xp.values()))
    total_attempts = int(len(df))
    overall_accuracy = round(float(df["accuracy"].mean()), 3) if not df.empty else None
    lessons_read = list(state.get("lessonsRead") or [])

    return {
        "totals": {
            "xp": total_xp,
            "xpBySource": {
                "quiz": int(xp_by_source.get("quiz", 0)),
                "lesson": int(xp_by_source.get("lesson", 0)),
            },
            "attempts": total_attempts,
            "lessonsRead": len(lessons_read),
            "overallAccuracy": overall_accuracy,
            "currentStreak": current_streak(daily_xp),
        },
        "weakestTopics": weakest_topics(df),
        "xpLast30Days": xp_last_30_days(daily_xp),
        "accuracyTrend": accuracy_trend(df),
    }
