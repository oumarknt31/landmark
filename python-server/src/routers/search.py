from fastapi import APIRouter, HTTPException, Query, Request

from ..models.search import SearchResponse, SearchResult
from ..services.search_index import SearchIndex

router = APIRouter()


@router.get("", response_model=SearchResponse)
def search(
    request: Request,
    q: str = Query(..., min_length=2, max_length=200, description="Search query"),
    limit: int = Query(8, ge=1, le=20),
) -> SearchResponse:
    index: SearchIndex | None = getattr(request.app.state, "search_index", None)
    if index is None:
        raise HTTPException(status_code=503, detail="Search index not initialized")
    try:
        hits = index.search(q, top_k=limit)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e

    return SearchResponse(
        query=q,
        count=len(hits),
        results=[
            SearchResult(
                id=h.doc.id,
                kind=h.doc.kind,
                topic_id=h.doc.topic_id,
                topic_name=h.doc.topic_name,
                title=h.doc.title,
                snippet=h.doc.snippet,
                score=h.score,
            )
            for h in hits
        ],
    )
