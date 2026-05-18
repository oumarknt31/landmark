"""Builds an in-memory vector index over lessons + quiz prompts.

Uses sentence-transformers/all-MiniLM-L6-v2 (80MB, fast) for embeddings.
Cosine similarity via numpy dot product on L2-normalized vectors.
"""

import logging
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

import numpy as np

from ..lib.content_loader import load_content

log = logging.getLogger(__name__)

EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

DocKind = Literal["lesson", "question"]


@dataclass(frozen=True)
class Doc:
    id: str
    kind: DocKind
    topic_id: str
    topic_name: str
    title: str
    snippet: str


@dataclass(frozen=True)
class SearchHit:
    doc: Doc
    score: float


def _chunk_markdown(body: str, max_chars: int = 800) -> list[str]:
    """Split a lesson body into paragraph-sized chunks for retrieval."""
    chunks: list[str] = []
    buf: list[str] = []
    size = 0
    for para in re.split(r"\n{2,}", body.strip()):
        para = para.strip()
        if not para:
            continue
        if size + len(para) > max_chars and buf:
            chunks.append("\n\n".join(buf))
            buf = [para]
            size = len(para)
        else:
            buf.append(para)
            size += len(para)
    if buf:
        chunks.append("\n\n".join(buf))
    return chunks


class SearchIndex:
    def __init__(self, docs: list[Doc], embeddings: np.ndarray, model_name: str):
        self.docs = docs
        self.embeddings = embeddings  # shape (N, dim), L2-normalized
        self.model_name = model_name
        self._model = None

    def __len__(self) -> int:
        return len(self.docs)

    @classmethod
    def build(cls, content_dir: Path) -> "SearchIndex":
        content = load_content(content_dir)
        docs: list[Doc] = []

        for topic in content.topics:
            if topic.lesson_body:
                for i, chunk in enumerate(_chunk_markdown(topic.lesson_body)):
                    snippet = chunk[:300]
                    docs.append(
                        Doc(
                            id=f"lesson:{topic.id}:{i}",
                            kind="lesson",
                            topic_id=topic.id,
                            topic_name=topic.name,
                            title=topic.name,
                            snippet=snippet,
                        )
                    )

        for q in content.questions:
            docs.append(
                Doc(
                    id=f"question:{q.id}",
                    kind="question",
                    topic_id=q.topic_id,
                    topic_name=q.topic_name,
                    title=q.prompt,
                    snippet=q.prompt,
                )
            )

        # Lazy import — keeps service bootable even if torch is unavailable.
        try:
            from sentence_transformers import SentenceTransformer

            model = SentenceTransformer(EMBEDDING_MODEL)
            corpus = [f"{d.title}\n{d.snippet}" for d in docs]
            embeddings = model.encode(
                corpus,
                normalize_embeddings=True,
                convert_to_numpy=True,
                show_progress_bar=False,
            )
            embeddings = np.ascontiguousarray(embeddings, dtype=np.float32)
            log.info("Embedded %d docs with %s", len(docs), EMBEDDING_MODEL)
            idx = cls(docs, embeddings, EMBEDDING_MODEL)
            idx._model = model
            return idx
        except Exception as e:
            log.warning("Failed to load embedding model (%s); /search will 503", e)
            return cls(docs, np.zeros((len(docs), 1), dtype=np.float32), "unavailable")

    def search(self, query: str, top_k: int = 8) -> list[SearchHit]:
        if self.model_name == "unavailable" or self._model is None:
            raise RuntimeError("embedding model not loaded")
        q_vec = self._model.encode(
            [query],
            normalize_embeddings=True,
            convert_to_numpy=True,
            show_progress_bar=False,
        )[0]
        q_vec = np.ascontiguousarray(q_vec, dtype=np.float32)
        scores = np.dot(self.embeddings, q_vec)  # cosine sim on normalized vectors
        order = np.argsort(-scores)[:top_k]
        return [SearchHit(doc=self.docs[i], score=float(scores[i])) for i in order]
