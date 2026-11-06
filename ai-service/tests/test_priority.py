"""
CivicSolve AI Microservice — Priority Scoring Test Suite

Tests:
  - Exact formula implementation and score bounding [0, 100]
  - Clear human-readable explanation generation
  - Component breakdown correctness and weight contributions
  - Boundary conditions (max possible inputs, zero inputs)
  - API endpoint integration via TestClient
"""

import pytest
from fastapi.testclient import TestClient

from app.api.priority import calculate_priority_score
from app.main import app


@pytest.fixture(scope="module")
def client():
    """Module-scoped test client that runs the FastAPI lifespan."""
    with TestClient(app) as test_client:
        yield test_client


def test_priority_formula_calculation():
    """
    Verify the mathematical priority formula:
      Priority = min(100, 100 * (0.35 * Severity + 0.25 * log10(Pop + 1)/4 + 0.20 * Recurrence + 0.20 * HealthHazard))
    """
    res = calculate_priority_score(
        severity=0.90,
        population=1200,
        recurrence_count=14,
        health_hazard=True,
    )

    # Expected:
    # 0.35 * 0.90 = 0.315 -> 31.5 pts
    # log10(1201)/4 = 3.0795/4 = 0.7699 -> 0.25 * 0.7699 = 0.1925 -> 19.25 pts
    # recurrence 14 / 10 capped at 1.0 -> 0.20 * 1.0 = 0.20 -> 20.0 pts
    # health_hazard True -> 0.20 * 1.0 = 0.20 -> 20.0 pts
    # Total = 31.5 + 19.25 + 20.0 + 20.0 = 90.75 pts
    assert 0.0 <= res.priority_score <= 100.0
    assert 90.0 <= res.priority_score <= 91.5
    assert res.tier == "CRITICAL"
    assert "CRITICAL priority" in res.explanation
    assert "Severity: 0.90" in res.explanation
    assert "health hazard confirmed" in res.explanation
    assert res.breakdown.health_hazard_contribution == 20.0


def test_priority_score_strictly_bounded_0_to_100():
    """Verify that score cannot exceed 100 or fall below 0 under any extreme values."""
    # Extreme high
    max_res = calculate_priority_score(
        severity=1.0,
        population=10_000_000,
        recurrence_count=1000,
        health_hazard=True,
    )
    assert max_res.priority_score <= 100.0
    assert max_res.priority_score == 100.0

    # Extreme low
    min_res = calculate_priority_score(
        severity=0.0,
        population=0,
        recurrence_count=0,
        health_hazard=False,
    )
    assert min_res.priority_score >= 0.0
    assert min_res.priority_score == 0.0
    assert min_res.tier == "LOW"


def test_priority_api_endpoint(client: TestClient):
    """Verify POST /api/v1/ai/priority endpoint returns expected JSON structure."""
    payload = {
        "severity": 0.75,
        "population": 3400,
        "recurrence_count": 9,
        "health_hazard": False,
        "text": "Village approach road washes out every July",
    }
    response = client.post("/api/v1/ai/priority", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    data = response.json()
    assert "priority_score" in data
    assert 0.0 <= data["priority_score"] <= 100.0
    assert "explanation" in data
    assert len(data["explanation"]) > 20
    assert "breakdown" in data
    assert data["breakdown"]["population_count"] == 3400
    assert data["breakdown"]["health_hazard_active"] is False


def test_priority_explanation_is_readable():
    """Verify explanation string clarity and human-friendly format."""
    res = calculate_priority_score(
        severity=0.60,
        population=500,
        recurrence_count=3,
        health_hazard=False,
    )
    assert isinstance(res.explanation, str)
    assert res.tier in ["HIGH", "MODERATE"]
    assert "pts" in res.explanation
    assert "Severity:" in res.explanation
