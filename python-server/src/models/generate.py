from pydantic import BaseModel, Field, field_validator


class GeneratedQuestion(BaseModel):
    prompt: str = Field(min_length=8, max_length=400)
    options: list[str] = Field(min_length=4, max_length=4)
    correctIndex: int = Field(ge=0, le=3)
    explanation: str = Field(min_length=8, max_length=600)

    @field_validator("options")
    @classmethod
    def options_distinct(cls, v: list[str]) -> list[str]:
        cleaned = [o.strip() for o in v]
        if any(len(o) == 0 for o in cleaned):
            raise ValueError("options must be non-empty")
        if len(set(cleaned)) != len(cleaned):
            raise ValueError("options must be distinct")
        return cleaned


class GenerateRequest(BaseModel):
    topic_id: str = Field(min_length=1, max_length=64)
    lesson_markdown: str = Field(min_length=200, max_length=20000)
    count: int = Field(default=5, ge=1, le=10)


class GenerateResponse(BaseModel):
    topic_id: str
    model: str
    questions: list[GeneratedQuestion]
