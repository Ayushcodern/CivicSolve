"""
CivicSolve AI Microservice — University Capability Matching Test Suite

Tests:
  - Multi-criteria matching algorithm: Score = 0.55*Sim + 0.20*Cap + 0.25*Proximity
  - Ranking order verification (highest match percentage first)
  - Distance computation in kilometers
  - Human-readable explainable match reasons
  - Empty institutions edge case
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="module")
def client():
    """Module-scoped test client that runs the FastAPI lifespan."""
    with TestClient(app) as test_client:
        yield test_client


def test_university_matching_ranks_water_institutions_first(client: TestClient):
    """
    Primary requirement:
    Verify that candidate institutions are ranked by composite capability match,
    distance in km is returned, and explainable match reasons are included.
    """
    payload = {
        "domain": "Water Supply",
        "lat": 22.8214,
        "lon": 75.8956,
        "challenge_description": "Community handpump yielding muddy water due to high groundwater turbidity.",
        "institutions": [
            {
                "id": 1,
                "name": "Acropolis Institute of Technology & Research (AITR)",
                "type": "UNIVERSITY",
                "district": "Indore",
                "lat": 22.8214,
                "lon": 75.8956,
                "capabilities": [
                    {
                        "domain": "Water Supply",
                        "expertise": "IoT telemetry, groundwater turbidity monitoring",
                        "capacity": 4,
                    },
                    {
                        "domain": "Rural Infrastructure",
                        "expertise": "Low-cost road stability analysis",
                        "capacity": 3,
                    },
                ],
            },
            {
                "id": 2,
                "name": "Shri Govindram Seksaria Institute of Technology and Science (SGSITS)",
                "type": "UNIVERSITY",
                "district": "Indore",
                "lat": 22.7244,
                "lon": 75.8754,
                "capabilities": [
                    {
                        "domain": "Water Supply",
                        "expertise": "Environmental engineering, chemical water filtration",
                        "capacity": 5,
                    },
                ],
            },
            {
                "id": 3,
                "name": "Indian Institute of Technology Indore (IIT Indore)",
                "type": "RESEARCH_LAB",
                "district": "Indore",
                "lat": 22.5204,
                "lon": 75.9207,
                "capabilities": [
                    {
                        "domain": "Agriculture",
                        "expertise": "Machine learning for pest prediction, satellite imagery",
                        "capacity": 6,
                    },
                ],
            },
        ],
    }

    response = client.post("/api/v1/ai/match", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    data = response.json()
    assert data["total_matches"] == 3
    assert data["target_domain"] == "Water Supply"
    matches = data["matches"]

    # Ranking order: scores must be monotonically descending
    for i in range(len(matches) - 1):
        assert matches[i]["score"] >= matches[i + 1]["score"]
        assert matches[i]["match_percentage"] >= matches[i + 1]["match_percentage"]

    # AITR should be #1 (exact co-location dist=0 km + exact turbidity match)
    top_match = matches[0]
    assert top_match["institution_id"] == 1
    assert top_match["distance_km"] == 0.0
    assert top_match["match_percentage"] >= 70.0
    assert len(top_match["match_reasons"]) >= 2
    assert "Water Supply" in top_match["matched_capability"]["domain"]

    # SGSITS should rank above IIT Indore (domain match vs agriculture)
    sgsits = next(m for m in matches if m["institution_id"] == 2)
    iit = next(m for m in matches if m["institution_id"] == 3)
    assert sgsits["score"] > iit["score"]
    assert sgsits["distance_km"] > 0.0


def test_university_matching_empty_institutions(client: TestClient):
    """Verify empty institutions list returns 200 with 0 matches."""
    payload = {
        "domain": "Sanitation",
        "lat": 22.7000,
        "lon": 75.8000,
        "institutions": [],
    }
    response = client.post("/api/v1/ai/match", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["matches"] == []
    assert data["total_matches"] == 0
