"""
CivicSolve AI Microservice — University Capability Matcher API

Recommends the best university departments and industry mentors for civic challenges
using multi-criteria capability matching:
  Score = 0.55 * Similarity(domain, expertise) + 0.20 * Capacity + 0.25 * (1 / (1 + DistanceKm / 50))

Returns:
  - Ranked institutions sorted by match percentage
  - Geodesic distance in km
  - Human-readable explainable match reasons
"""

import logging
from typing import Any, Dict, List, Optional, Union

import numpy as np
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.api.duplicate import haversine_distance
from app.core.nlp import EmbeddingService

logger = logging.getLogger(__name__)

router = APIRouter()


# ── Request / Response Schemas ────────────────────────────────

class CapabilityInput(BaseModel):
    id: Optional[Union[int, str]] = Field(default=None, description="Capability identifier")
    domain: str = Field(..., description="Capability domain, e.g. Water Supply", examples=["Water Supply"])
    expertise: str = Field(..., description="Departmental expertise details", examples=["IoT telemetry, groundwater turbidity monitoring"])
    capacity: int = Field(default=3, ge=0, description="Available project supervision capacity", examples=[4])


class InstitutionInput(BaseModel):
    id: Optional[Union[int, str]] = Field(default=None, description="Institution identifier")
    name: str = Field(..., description="Institution name", examples=["Acropolis Institute of Technology & Research (AITR)"])
    type: str = Field(default="UNIVERSITY", description="UNIVERSITY, RESEARCH_LAB, or INDUSTRY", examples=["UNIVERSITY"])
    district: Optional[str] = Field(default=None, description="District name", examples=["Indore"])
    lat: float = Field(..., description="Latitude coordinate", examples=[22.8214])
    lon: float = Field(..., description="Longitude coordinate", examples=[75.8956])
    capabilities: List[CapabilityInput] = Field(
        default_factory=list,
        description="List of departmental capabilities and expertise areas",
    )


class MatchRequest(BaseModel):
    domain: str = Field(
        ...,
        min_length=1,
        description="Target challenge domain, e.g. Water Supply",
        examples=["Water Supply"],
    )
    lat: float = Field(..., description="Challenge location latitude", examples=[22.8214])
    lon: float = Field(..., description="Challenge location longitude", examples=[75.8956])
    institutions: List[InstitutionInput] = Field(
        ...,
        description="List of candidate institutions with their capabilities",
    )
    challenge_description: Optional[str] = Field(
        default="",
        description="Optional detailed challenge text for fine-grained semantic matching",
        examples=["Community handpump dispenses turbid mud water after rainfall."],
    )


class MatchedCapability(BaseModel):
    domain: str = Field(..., description="Matched capability domain")
    expertise: str = Field(..., description="Specific expertise matched")
    capacity: int = Field(..., description="Available capacity")
    similarity_score: float = Field(..., description="Semantic similarity score between 0.0 and 1.0")


class InstitutionMatch(BaseModel):
    institution_id: Optional[Union[int, str]] = Field(default=None, description="Institution ID")
    name: str = Field(..., description="Institution name")
    type: str = Field(..., description="Institution type")
    district: Optional[str] = Field(default=None, description="District")
    score: float = Field(..., description="Overall composite match score (0.0 to 1.0)")
    match_percentage: float = Field(..., description="Match percentage (0.0 to 100.0%)")
    distance_km: float = Field(..., description="Distance in kilometers from challenge")
    matched_capability: MatchedCapability = Field(..., description="Best matching departmental capability")
    match_reasons: List[str] = Field(..., description="Explainable reasons for recommendation")


class MatchResponse(BaseModel):
    matches: List[InstitutionMatch] = Field(..., description="Ranked list of matching institutions")
    total_matches: int = Field(..., description="Total count of candidate institutions evaluated")
    target_domain: str = Field(..., description="Target challenge domain requested")


# ── Matching Calculation Engine ───────────────────────────────

def rank_institutions(
    domain: str,
    lat: float,
    lon: float,
    institutions: List[InstitutionInput],
    challenge_description: str = "",
) -> List[InstitutionMatch]:
    """
    Implements multi-criteria capability ranking:
      Score = 0.55 * Similarity(domain, expertise) + 0.20 * Capacity + 0.25 * (1 / (1 + DistanceKm / 50))
    """
    embedding_service = EmbeddingService.get_instance()
    if not embedding_service.is_loaded:
        embedding_service.load_model()

    # Query text for semantic comparison
    clean_domain = domain.strip()
    if challenge_description.strip():
        query_text = f"{clean_domain}: {challenge_description.strip()}"
    else:
        query_text = f"Domain: {clean_domain}. Expertise in {clean_domain} solutions and technologies."

    query_vec = embedding_service.get_embedding(query_text)

    matches: List[InstitutionMatch] = []

    for inst in institutions:
        dist_km = haversine_distance(lat, lon, inst.lat, inst.lon)
        # Proximity factor: 1 / (1 + dist_km / 50)
        proximity_factor = 1.0 / (1.0 + (dist_km / 50.0))

        # If institution has no capabilities listed, use a default fallback
        caps = inst.capabilities
        if not caps:
            caps = [CapabilityInput(domain=clean_domain, expertise="General technical advisory", capacity=1)]

        best_cap_score = -1.0
        best_cap_match: Optional[MatchedCapability] = None
        best_sim_score = 0.0
        best_reasons: List[str] = []

        for cap in caps:
            cap_text = f"{cap.domain}: {cap.expertise}"
            cap_vec = embedding_service.get_embedding(cap_text)
            raw_sim = embedding_service.compute_similarity(query_vec, cap_vec)

            # Boost exact domain matches
            domain_exact = clean_domain.lower() in cap.domain.lower() or cap.domain.lower() in clean_domain.lower()
            if domain_exact and raw_sim < 0.6:
                raw_sim = 0.6 + (raw_sim * 0.4)

            sim_bounded = round(max(0.0, min(1.0, raw_sim)), 4)

            # Capacity normalized [0.0, 1.0] (10 is max capacity)
            cap_norm = min(1.0, max(0.0, float(cap.capacity) / 10.0))

            # Composite formula: 0.55 * Sim + 0.20 * Cap + 0.25 * Proximity
            comp_score = (0.55 * sim_bounded) + (0.20 * cap_norm) + (0.25 * proximity_factor)

            if comp_score > best_cap_score:
                best_cap_score = comp_score
                best_sim_score = sim_bounded
                best_cap_match = MatchedCapability(
                    domain=cap.domain,
                    expertise=cap.expertise,
                    capacity=cap.capacity,
                    similarity_score=sim_bounded,
                )

                # Generate explainable match reasons
                reasons = []
                sim_pct = round(sim_bounded * 100.0, 1)
                reasons.append(f"Strong capability match ({sim_pct}%) in {cap.domain}: {cap.expertise}.")

                if cap.capacity >= 5:
                    reasons.append(f"High project capacity: {cap.capacity} concurrent project slots available.")
                elif cap.capacity >= 2:
                    reasons.append(f"Available departmental capacity: {cap.capacity} active slots.")
                else:
                    reasons.append(f"Limited capacity: {cap.capacity} slot.")

                if dist_km <= 15.0:
                    reasons.append(f"Immediate proximity: only {dist_km:.1f} km from challenge site.")
                elif dist_km <= 50.0:
                    reasons.append(f"Within regional access radius: {dist_km:.1f} km away.")
                else:
                    reasons.append(f"Regional partner located {dist_km:.1f} km away.")

                best_reasons = reasons

        final_score = round(max(0.0, min(1.0, best_cap_score)), 4)
        pct = round(final_score * 100.0, 2)

        matches.append(
            InstitutionMatch(
                institution_id=inst.id,
                name=inst.name,
                type=inst.type,
                district=inst.district,
                score=final_score,
                match_percentage=pct,
                distance_km=dist_km,
                matched_capability=best_cap_match,  # type: ignore
                match_reasons=best_reasons,
            )
        )

    # Rank by composite score descending
    matches.sort(key=lambda m: m.score, reverse=True)
    return matches


# ── Router Endpoints ──────────────────────────────────────────

@router.post(
    "/match",
    response_model=MatchResponse,
    summary="Recommend and rank universities/institutions by capability match",
    description="Implements: Score = 0.55 * Similarity + 0.20 * Capacity + 0.25 * (1 / (1 + DistanceKm / 50)). Returns ranked list with match reasons.",
)
@router.post(
    "/match/",
    response_model=MatchResponse,
    include_in_schema=False,
)
async def match_institutions(payload: MatchRequest) -> MatchResponse:
    if not payload.institutions:
        return MatchResponse(
            matches=[],
            total_matches=0,
            target_domain=payload.domain,
        )

    try:
        ranked = rank_institutions(
            domain=payload.domain,
            lat=payload.lat,
            lon=payload.lon,
            institutions=payload.institutions,
            challenge_description=payload.challenge_description or "",
        )
        return MatchResponse(
            matches=ranked,
            total_matches=len(ranked),
            target_domain=payload.domain,
        )
    except Exception as exc:
        logger.exception("Error during institution matching: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Institution matching failed: {str(exc)}",
        ) from exc
