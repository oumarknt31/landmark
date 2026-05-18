from fastapi import APIRouter, Header, HTTPException

from ..config import settings
from ..lib.supabase_client import get_supabase
from ..models.analytics import AnalyticsResponse
from ..services.analytics import summarize

router = APIRouter()


def _require_admin(authorization: str | None) -> None:
    """Gate this endpoint behind the shared admin token. The Hono gateway adds
    it server-side after validating the caller's JWT, so the browser never
    sees it."""
    if not settings.admin_token:
        raise HTTPException(status_code=503, detail="ADMIN_TOKEN not configured")
    expected = f"Bearer {settings.admin_token}"
    if authorization != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.get("/user/{user_id}", response_model=AnalyticsResponse)
def user_analytics(
    user_id: str,
    authorization: str | None = Header(default=None),
) -> AnalyticsResponse:
    _require_admin(authorization)

    sb = get_supabase()
    res = sb.table("user_progress").select("state").eq("user_id", user_id).limit(1).execute()
    rows = res.data or []
    state = rows[0]["state"] if rows else {}

    summary = summarize(state)
    return AnalyticsResponse(userId=user_id, **summary)
