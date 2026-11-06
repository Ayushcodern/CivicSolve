"""
CivicSolve AI Microservice — Priority Scoring Calculator

Calculates an explainable 0–100 priority score using the civic weighting formula:
  Priority = min(100, 100 * (0.35 * Severity + 0.25 * log10(Pop + 1)/4 + 0.20 * Recurrence + 0.20 * HealthHazard))

Returns:
  - priority_score: float bounded between 0.0 and 100.0
  - explanation: human-readable, auditable rationale string
  - breakdown: detailed component contributions
"""

import logging
import math
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter()


# ── Request / Response Schemas ────────────────────────────────

class PriorityRequest(BaseModel):
    severity: float = Field(
        ...,
        ge=0.0,
        description="Severity index (0.0 to 1.0, or 1-100 scale)",
        examples=[0.90],
    )
    population: int = Field(
        ...,
        ge=0,
        description="Estimated affected population count",
        examples=[1200],
    )
    recurrence_count: int = Field(
        default=1,
        ge=0,
        description="Number of recurring reports or community confirmations",
        examples=[14],
    )
    health_hazard: bool = Field(
        default=False,
        description="True if problem creates immediate contamination or disease risk",
        examples=[True],
    )
    text: Optional[str] = Field(
        default="",
        description="Challenge title or description for context in the explanation",
        examples=["Handpump dispenses yellowish mud water after rainfall"],
    )


class ComponentBreakdown(BaseModel):
    severity_weight: float = Field(default=0.35, description="Weight assigned to severity")
    severity_normalized: float = Field(..., description="Normalized severity factor (0.0 to 1.0)")
    severity_contribution: float = Field(..., description="Points contributed by severity (max 35.0)")

    population_weight: float = Field(default=0.25, description="Weight assigned to population")
    population_count: int = Field(..., description="Raw population count")
    population_term: float = Field(..., description="log10(Pop + 1)/4 term (0.0 to 1.0)")
    population_contribution: float = Field(..., description="Points contributed by population (max 25.0)")

    recurrence_weight: float = Field(default=0.20, description="Weight assigned to recurrence")
    recurrence_count: int = Field(..., description="Raw count of recurring reports")
    recurrence_factor: float = Field(..., description="Normalized recurrence factor (0.0 to 1.0)")
    recurrence_contribution: float = Field(..., description="Points contributed by recurrence (max 20.0)")

    health_hazard_weight: float = Field(default=0.20, description="Weight assigned to health hazard")
    health_hazard_active: bool = Field(..., description="Whether health hazard flag is active")
    health_hazard_contribution: float = Field(..., description="Points contributed by health hazard (0 or 20.0)")


class PriorityResponse(BaseModel):
    priority_score: float = Field(..., ge=0.0, le=100.0, description="Priority score bounded between 0.0 and 100.0")
    tier: str = Field(..., description="Severity tier: CRITICAL, HIGH, MODERATE, or LOW")
    explanation: str = Field(..., description="Auditable human-readable explanation of the score")
    breakdown: ComponentBreakdown = Field(..., description="Granular breakdown of component contributions")


# ── Priority Calculation Engine ───────────────────────────────

def calculate_priority_score(
    severity: float,
    population: int,
    recurrence_count: int,
    health_hazard: bool,
    text: str = "",
) -> PriorityResponse:
    """
    Implements the mathematical priority formula:
      Priority = min(100, 100 * (0.35 * Severity + 0.25 * log10(Pop + 1)/4 + 0.20 * Recurrence + 0.20 * HealthHazard))
    """
    # 1. Normalize severity to [0.0, 1.0]
    if severity > 1.0:
        if severity <= 10.0:
            norm_severity = severity / 10.0
        else:
            norm_severity = min(1.0, severity / 100.0)
    else:
        norm_severity = max(0.0, min(1.0, severity))

    # 2. Population term: log10(Pop + 1) / 4.0 (capped at 1.0 for Pop >= 10,000)
    pop_clamped = max(0, population)
    pop_term = min(1.0, max(0.0, math.log10(pop_clamped + 1) / 4.0))

    # 3. Recurrence factor: normalized to [0.0, 1.0] (10+ reports = 1.0)
    rec_clamped = max(0, recurrence_count)
    rec_factor = min(1.0, max(0.0, rec_clamped / 10.0))

    # 4. Health hazard: binary 1.0 or 0.0
    hh_factor = 1.0 if health_hazard else 0.0

    # 5. Component point contributions (scale out of 100)
    sev_points = round(100.0 * 0.35 * norm_severity, 2)
    pop_points = round(100.0 * 0.25 * pop_term, 2)
    rec_points = round(100.0 * 0.20 * rec_factor, 2)
    hh_points = round(100.0 * 0.20 * hh_factor, 2)

    total_score = round(min(100.0, max(0.0, sev_points + pop_points + rec_points + hh_points)), 2)

    # 6. Priority Tier
    if total_score >= 80.0:
        tier = "CRITICAL"
    elif total_score >= 60.0:
        tier = "HIGH"
    elif total_score >= 40.0:
        tier = "MODERATE"
    else:
        tier = "LOW"

    # 7. Human-readable explanation string
    clauses = [f"Severity: {norm_severity:.2f} (+{sev_points} pts)"]

    if pop_clamped > 0:
        clauses.append(f"Population affected: ~{pop_clamped:,} (+{pop_points} pts)")
    else:
        clauses.append("Population: unstated (0 pts)")

    if health_hazard:
        clauses.append(f"Active health hazard confirmed (+{hh_points} pts)")
    else:
        clauses.append("No immediate health hazard (0 pts)")

    if rec_clamped > 1:
        clauses.append(f"{rec_clamped} recurring reports (+{rec_points} pts)")
    elif rec_clamped == 1:
        clauses.append(f"Single report (+{rec_points} pts)")
    else:
        clauses.append("0 reports (0 pts)")

    explanation = f"{tier} priority ({total_score}/100) — " + ", ".join(clauses) + "."

    breakdown = ComponentBreakdown(
        severity_weight=0.35,
        severity_normalized=round(norm_severity, 4),
        severity_contribution=sev_points,
        population_weight=0.25,
        population_count=pop_clamped,
        population_term=round(pop_term, 4),
        population_contribution=pop_points,
        recurrence_weight=0.20,
        recurrence_count=rec_clamped,
        recurrence_factor=round(rec_factor, 4),
        recurrence_contribution=rec_points,
        health_hazard_weight=0.20,
        health_hazard_active=health_hazard,
        health_hazard_contribution=hh_points,
    )

    return PriorityResponse(
        priority_score=total_score,
        tier=tier,
        explanation=explanation,
        breakdown=breakdown,
    )


# ── Router Endpoints ──────────────────────────────────────────

@router.post(
    "/priority",
    response_model=PriorityResponse,
    summary="Calculate civic challenge priority score",
    description="Implements weighted priority formula: Priority = min(100, 100 * (0.35*Sev + 0.25*log10(Pop+1)/4 + 0.20*Rec + 0.20*HH)) with human-readable rationale.",
)
@router.post(
    "/priority/",
    response_model=PriorityResponse,
    include_in_schema=False,
)
async def calculate_priority(payload: PriorityRequest) -> PriorityResponse:
    try:
        return calculate_priority_score(
            severity=payload.severity,
            population=payload.population,
            recurrence_count=payload.recurrence_count,
            health_hazard=payload.health_hazard,
            text=payload.text or "",
        )
    except Exception as exc:
        logger.exception("Error calculating priority score: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Priority calculation failed: {str(exc)}",
        ) from exc
