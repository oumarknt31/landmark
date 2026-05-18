from functools import lru_cache

from anthropic import Anthropic

from ..config import settings


@lru_cache(maxsize=1)
def get_anthropic() -> Anthropic:
    if not settings.anthropic_api_key:
        raise RuntimeError("ANTHROPIC_API_KEY missing")
    return Anthropic(api_key=settings.anthropic_api_key)
