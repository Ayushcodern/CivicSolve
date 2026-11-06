"""
CivicSolve AI Microservice — Duplicate Detection API

Calculates semantic cosine similarity and geographic Haversine distance
between a newly reported civic issue and candidate nearby issues to flag
duplicates (similarity >= 0.75).
"""

import logging
import math
from typing import Any, List, Optional, Union

import numpy as np
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.core.config import settings
from app.core.nlp import EmbeddingService

logger = logging.getLogger(__name__)

router = APIRouter()


# ── Geographic Distance (Haversine Formula) ──────────────────

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two points on Earth in kilometers.

    Args:
        lat1, lon1: First point GPS coordinates in decimal degrees.
        lat2, lon2: Second point GPS coordinates in decimal degrees.

    Returns:
        Distance in kilometers rounded to 3 decimal places.
    """
    R = 6371.0  # Earth's mean radius in kilometers
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 3)


# ── Request / Response Schemas ────────────────────────────────

class ChallengeInput(BaseModel):
    id: Optional[Union[int, str]] = Field(default=None, description="Challenge identifier")
    title: str = Field(..., min_length=1, description="Challenge title", examples=["Handpump broken in school"])
    description: str = Field(default="", description="Challenge description", examples=["No drinking water available."])
    lat: float = Field(..., description="Latitude coordinate", examples=[22.8214])
    lon: float = Field(..., description="Longitude coordinate", examples=[75.8956])


class DuplicateCheckRequest(BaseModel):
    new_challenge: ChallengeInput = Field(..., description="Newly submitted challenge to check against candidates")
    candidates: List[ChallengeInput] = Field(
        default_factory=list,
        description="List of nearby candidate challenges (typically queried via PostGIS ST_DWithin)",
    )
    threshold: Optional[float] = Field(
        default=0.75,
        ge=0.0,
        le=1.0,
        description="Minimum cosine similarity threshold to qualify as duplicate (default 0.75)",
    )


class DuplicateMatch(BaseModel):
    id: Optional[Union[int, str]] = Field(default=None, description="Candidate challenge ID")
    title: str = Field(..., description="Candidate challenge title")
    similarity: float = Field(..., description="Cosine similarity score between -1.0 and 1.0")
    similarity_percentage: float = Field(..., description="Similarity expressed as percentage (0-100%)")
    distance_km: float = Field(..., description="Geographic distance from new challenge in kilometers")
    is_duplicate: bool = Field(default=True, description="True if similarity >= threshold")


class DuplicateCheckResponse(BaseModel):
    matches: List[DuplicateMatch] = Field(
        ...,
        description="Duplicate matches ranked from highest to lowest similarity",
    )
    total_matches: int = Field(..., description="Count of candidate matches meeting or exceeding threshold")
    threshold_used: float = Field(..., description="Similarity threshold applied for filtering")


# ── Router Endpoints ──────────────────────────────────────────

@router.post(
    "/duplicates",
    response_model=DuplicateCheckResponse,
    summary="Detect duplicate challenges nearby",
    description="Calculates semantic cosine similarity and Haversine distance, returning candidates with similarity >= 0.75 ranked highest to lowest.",
)
@router.post(
    "/duplicates/",
    response_model=DuplicateCheckResponse,
    include_in_schema=False,
)
async def check_duplicates(payload: DuplicateCheckRequest) -> DuplicateCheckResponse:
    new_ch = payload.new_challenge
    candidates = payload.candidates
    threshold = payload.threshold if payload.threshold is not None else 0.75

    # Early exit if no candidates
    if not candidates:
        return DuplicateCheckResponse(
            matches=[],
            total_matches=0,
            threshold_used=threshold,
        )

    try:
        embedding_service = EmbeddingService.get_instance()
        if not embedding_service.is_loaded:
            embedding_service.load_model()

        # Build text representations
        new_text = f"{new_ch.title.strip()}. {new_ch.description.strip()}".strip()
        candidate_texts = [
            f"{c.title.strip()}. {c.description.strip()}".strip()
            for c in candidates
        ]

        # Generate embeddings: new challenge + all candidates
        all_texts = [new_text] + candidate_texts
        all_embeddings = embedding_service.get_embeddings_batch(all_texts)

        new_vec = np.array(all_embeddings[0], dtype=np.float32)
        new_norm = np.linalg.norm(new_vec)
        if new_norm > 0:
            new_vec = new_vec / new_norm

        candidate_matrix = np.array(all_embeddings[1:], dtype=np.float32)
        norms = np.linalg.norm(candidate_matrix, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        candidate_matrix = candidate_matrix / norms

        # Vectorized cosine similarity
        similarities = np.dot(candidate_matrix, new_vec)

        matches: List[DuplicateMatch] = []
        for idx, candidate in enumerate(candidates):
            sim = float(similarities[idx])
            sim_rounded = round(sim, 4)

            if sim_rounded >= threshold:
                dist = haversine_distance(new_ch.lat, new_ch.lon, candidate.lat, candidate.lon)
                pct = round(max(0.0, sim_rounded) * 100.0, 2)
                matches.append(
                    DuplicateMatch(
                        id=candidate.id,
                        title=candidate.title,
                        similarity=sim_rounded,
                        similarity_percentage=pct,
                        distance_km=dist,
                        is_duplicate=True,
                    )
                )

        # Rank matches from highest similarity to lowest
        matches.sort(key=lambda m: m.similarity, reverse=True)

        return DuplicateCheckResponse(
            matches=matches,
            total_matches=len(matches),
            threshold_used=threshold,
        )

    except Exception as exc:
        logger.exception("Error during duplicate check: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Duplicate check failed: {str(exc)}",
        ) from exc
