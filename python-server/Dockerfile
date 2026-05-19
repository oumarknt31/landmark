FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HOME=/app/.model_cache \
    SENTENCE_TRANSFORMERS_HOME=/app/.model_cache

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

# Pre-download the embedding model so cold-start doesn't pay the download.
RUN python -c "from sentence_transformers import SentenceTransformer; \
    SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"

COPY src ./src

# Lesson + quiz content. Populated by `scripts/prepare-python-deploy.sh`
# before `fly deploy` (the React app's src/content is outside this Docker
# build context, so we copy it into python-server/content/ first).
COPY content ./content
ENV CONTENT_DIR=./content

EXPOSE 8000
CMD ["sh", "-c", "uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
