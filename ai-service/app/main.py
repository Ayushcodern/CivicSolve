"""
CivicSolve AI Microservice — FastAPI Application Entry Point

Provides:
  - Lifespan: loads sentence-transformer model and initializes centroids on startup
  - CORS middleware (all origins in dev)
  - GET /health  → service health check (includes model and classifier readiness)
  - POST /api/v1/ai/classify → Domain classification & keyword extraction
  - POST /api/v1/ai/duplicates → Nearby duplicate challenge detection
  - POST /api/v1/ai/priority → Priority score calculation with explanation
  - POST /api/v1/ai/match → University & mentor capability matching
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.classify import classifier
from app.api.classify import router as classify_router
from app.api.chat import router as chat_router
from app.api.duplicate import router as duplicate_router
from app.api.matching import router as matching_router
from app.api.priority import router as priority_router
from app.core.config import settings
from app.core.nlp import EmbeddingService

logger = logging.getLogger(__name__)

# ── Lifespan: model loading & centroid init on startup ───────


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan handler.
    - Startup: load the sentence-transformer model and precompute domain centroids.
    - Shutdown: cleanup (Python GC handles model memory).
    """
    logger.info("Starting CivicSolve AI service...")
    embedding_service = EmbeddingService.get_instance()
    embedding_service.load_model()

    logger.info("Initializing domain classifier centroids...")
    classifier.initialize()

    logger.info("CivicSolve AI service ready.")
    yield
    logger.info("Shutting down CivicSolve AI service.")


# ── FastAPI instance ─────────────────────────────────────────

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI/NLP microservice for CivicSolve — challenge analysis, duplicate detection, and priority scoring.",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS Middleware ──────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────

app.include_router(classify_router, prefix="/api/v1/ai", tags=["AI Classification"])
app.include_router(chat_router, prefix="/api/v1/ai", tags=["AI Chatbot"])
app.include_router(duplicate_router, prefix="/api/v1/ai", tags=["AI Duplicate Detection"])
app.include_router(priority_router, prefix="/api/v1/ai", tags=["AI Priority Scoring"])
app.include_router(matching_router, prefix="/api/v1/ai", tags=["AI Capability Matching"])

# ── Health Check ─────────────────────────────────────────────


@app.get("/health", tags=["System"])
async def health_check():
    """
    Service health check endpoint.
    Used by Docker HEALTHCHECK and docker-compose depends_on.
    Reports model and classifier readiness status.
    """
    embedding_service = EmbeddingService.get_instance()
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
        "model_loaded": embedding_service.is_loaded,
        "model_name": settings.embedding_model,
        "classifier_ready": classifier.is_initialized,
    }
