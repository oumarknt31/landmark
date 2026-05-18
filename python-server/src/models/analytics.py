from pydantic import BaseModel


class XpBySource(BaseModel):
    quiz: int
    lesson: int


class AnalyticsTotals(BaseModel):
    xp: int
    xpBySource: XpBySource
    attempts: int
    lessonsRead: int
    overallAccuracy: float | None
    currentStreak: int


class WeakestTopic(BaseModel):
    topicId: str
    attempts: int
    avgAccuracy: float
    bestAccuracy: float
    lastAttempt: str | None


class XpPoint(BaseModel):
    date: str
    xp: int


class AccuracyPoint(BaseModel):
    completedAt: str | None
    rollingAccuracy: float


class AnalyticsResponse(BaseModel):
    userId: str
    totals: AnalyticsTotals
    weakestTopics: list[WeakestTopic]
    xpLast30Days: list[XpPoint]
    accuracyTrend: list[AccuracyPoint]
