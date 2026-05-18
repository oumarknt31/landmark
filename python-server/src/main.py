import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import analytics, generate, health, search
from .services.search_index import SearchIndex

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
log = logging.getLogger("landmark")


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Building search index from %s", settings.content_path)
    app.state.search_index = SearchIndex.build(settings.content_path)
    log.info("Indexed %d documents", len(app.state.search_index))
    yield


app = FastAPI(
    title="Landmark Python API",
    description="Semantic search, analytics, and AI question generation for Landmark.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=600,
)


@app.middleware("http")
async def security_headers(request, call_next):
    """Defense-in-depth headers on every Python response. The browser
    normally talks to this service only through the Hono gateway, but if
    it ever sees one of these responses directly, these still help."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

app.include_router(health.router)
app.include_router(search.router, prefix="/search", tags=["search"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
app.include_router(generate.router, prefix="/generate", tags=["generate"])
