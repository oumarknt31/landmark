from fastapi import APIRouter, Header, HTTPException

from ..config import settings
from ..models.generate import GenerateRequest, GenerateResponse
from ..services.generator import MODEL, generate_questions

router = APIRouter()


def _require_admin(authorization: str | None) -> None:
    if not settings.admin_token:
        raise HTTPException(status_code=503, detail="ADMIN_TOKEN not configured")
    if authorization != f"Bearer {settings.admin_token}":
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.post("", response_model=GenerateResponse)
def generate(
    req: GenerateRequest,
    authorization: str | None = Header(default=None),
) -> GenerateResponse:
    _require_admin(authorization)
    try:
        questions = generate_questions(req.lesson_markdown, req.count)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=f"generation failed: {e}") from e
    return GenerateResponse(topic_id=req.topic_id, model=MODEL, questions=questions)
