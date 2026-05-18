from pydantic import BaseModel


class SearchResult(BaseModel):
    id: str
    kind: str  # "lesson" | "question"
    topic_id: str
    topic_name: str
    title: str
    snippet: str
    score: float


class SearchResponse(BaseModel):
    query: str
    count: int
    results: list[SearchResult]
