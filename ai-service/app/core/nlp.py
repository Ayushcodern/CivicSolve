"""
CivicSolve AI Microservice — Sentence Embedding Service

Thread-safe singleton that loads the sentence-transformers model once
and provides embedding generation + cosine similarity computation.

Model: all-MiniLM-L6-v2 (384-dimensional vectors)
"""

import logging
import threading
from typing import List

import numpy as np
from sentence_transformers import SentenceTransformer

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    """
    Thread-safe singleton for sentence embedding operations.

    Usage:
        service = EmbeddingService.get_instance()
        vec = service.get_embedding("some text")
        sim = service.compute_similarity(vec1, vec2)
    """

    _instance: "EmbeddingService | None" = None
    _lock: threading.Lock = threading.Lock()

    def __init__(self) -> None:
        raise RuntimeError("Use EmbeddingService.get_instance() instead of direct construction.")

    @classmethod
    def get_instance(cls) -> "EmbeddingService":
        """Return the singleton instance, creating it on first call (double-checked locking)."""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    instance = object.__new__(cls)
                    instance._model = None
                    instance._model_name = settings.embedding_model
                    cls._instance = instance
        return cls._instance

    def load_model(self) -> None:
        """
        Load the sentence-transformer model into memory.
        Called once during FastAPI lifespan startup.
        """
        logger.info("Loading embedding model: %s ...", self._model_name)
        self._model = SentenceTransformer(self._model_name)
        # Warm up with a dummy encode to ensure weights are fully loaded
        self._model.encode(["warmup"], show_progress_bar=False)
        logger.info("Embedding model loaded successfully. Vector dimension: %d", self._model.get_sentence_embedding_dimension())

    @property
    def is_loaded(self) -> bool:
        """Check whether the model is ready to serve requests."""
        return self._model is not None

    def get_embedding(self, text: str) -> List[float]:
        """
        Convert a text string into a 384-dimensional float vector.

        Args:
            text: Input text (challenge title + description, etc.)

        Returns:
            List of 384 floats representing the semantic embedding.

        Raises:
            RuntimeError: If the model has not been loaded yet.
        """
        if not self.is_loaded:
            raise RuntimeError("Embedding model is not loaded. Call load_model() first.")

        embedding = self._model.encode(text, show_progress_bar=False)
        return embedding.tolist()

    def get_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Batch-encode multiple texts for efficiency.

        Args:
            texts: List of input strings.

        Returns:
            List of 384-dimensional float vectors.
        """
        if not self.is_loaded:
            raise RuntimeError("Embedding model is not loaded. Call load_model() first.")

        embeddings = self._model.encode(
            texts,
            batch_size=settings.max_batch_size,
            show_progress_bar=False,
        )
        return embeddings.tolist()

    @staticmethod
    def compute_similarity(vec1: List[float], vec2: List[float]) -> float:
        """
        Compute cosine similarity between two embedding vectors.

        Args:
            vec1: First embedding vector (384 floats).
            vec2: Second embedding vector (384 floats).

        Returns:
            Cosine similarity score between -1.0 and 1.0.
            Values closer to 1.0 indicate higher semantic similarity.
        """
        a = np.array(vec1, dtype=np.float32)
        b = np.array(vec2, dtype=np.float32)

        dot_product = np.dot(a, b)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)

        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0

        return float(dot_product / (norm_a * norm_b))
