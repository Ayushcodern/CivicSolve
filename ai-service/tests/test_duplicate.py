"""
CivicSolve AI Microservice — Duplicate Detection Test Suite

Tests:
  - Exact/semantic duplicate detection with similarity >= 0.75
  - Distance computation accuracy (Haversine formula in km)
  - Ranking order (highest similarity first)
  - Non-duplicate filtering (unrelated issues excluded)
  - Edge cases (empty candidate list, identical coordinates)
"""

import pytest
from fastapi.testclient import TestClient

from app.api.duplicate import haversine_distance
from app.main import app


@pytest.fixture(scope="module")
def client():
    """Module-scoped test client that initializes the FastAPI lifespan."""
    with TestClient(app) as test_client:
        yield test_client


def test_haversine_distance_computation():
    """Verify the Haversine distance helper function."""
    # Same point should have 0 distance
    assert haversine_distance(22.8214, 75.8956, 22.8214, 75.8956) == 0.0

    # AITR Indore (22.8214, 75.8956) to SGSITS Indore (22.7244, 75.8754) is ~11 km
    dist = haversine_distance(22.8214, 75.8956, 22.7244, 75.8754)
    assert 10.0 <= dist <= 13.0, f"Expected ~11 km, got {dist}"


def test_duplicate_detection_matches_similar_nearby_challenge(client: TestClient):
    """
    Primary requirement:
    Verify that a report semantically identical to a nearby existing challenge is flagged
    with similarity >= 0.75 and correct distance in km.
    """
    payload = {
        "new_challenge": {
            "id": 999,
            "title": "Community handpump broken in primary school",
            "description": "Drinking water handpump is completely broken. School children have no access to clean drinking water.",
            "lat": 22.8214,
            "lon": 75.8956,
        },
        "candidates": [
            {
                "id": 2611,
                "title": "School handpump not working, no drinking water",
                "description": "Village primary school handpump damaged and dry. Children suffering from water shortage.",
                "lat": 22.8230,
                "lon": 75.8970,
            },
            {
                "id": 2598,
                "title": "Deep potholes on village road",
                "description": "The asphalt road has large potholes making vehicular movement dangerous during rains.",
                "lat": 22.8215,
                "lon": 75.8958,
            },
        ],
        "threshold": 0.75,
    }

    response = client.post("/api/v1/ai/duplicates", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    data = response.json()
    assert data["total_matches"] >= 1
    assert data["threshold_used"] == 0.75

    # Candidate 2611 should be flagged as a duplicate
    match_ids = [m["id"] for m in data["matches"]]
    assert 2611 in match_ids

    # Candidate 2598 (unrelated road potholes) should NOT be flagged as duplicate
    assert 2598 not in match_ids

    # Verify match attributes
    matched = next(m for m in data["matches"] if m["id"] == 2611)
    assert matched["similarity"] >= 0.75
    assert matched["similarity_percentage"] >= 75.0
    assert matched["is_duplicate"] is True
    assert 0.0 < matched["distance_km"] < 1.0  # Should be ~0.2 km


def test_duplicate_ranking_highest_similarity_first(client: TestClient):
    """Verify that multiple matching candidates are sorted highest to lowest similarity."""
    payload = {
        "new_challenge": {
            "id": 100,
            "title": "Severe water leak in main pipeline",
            "description": "Water leaking from underground pipeline flooding the street.",
            "lat": 22.7244,
            "lon": 75.8754,
        },
        "candidates": [
            {
                "id": 1,
                "title": "Minor water seepage on pavement",
                "description": "Small amount of water oozing out near curb.",
                "lat": 22.7240,
                "lon": 75.8750,
            },
            {
                "id": 2,
                "title": "Main water pipeline bursting and leaking heavily",
                "description": "Major pipeline leak causing water flood in the entire street.",
                "lat": 22.7245,
                "lon": 75.8755,
            },
        ],
        "threshold": 0.50,  # Lower threshold to capture both for rank test
    }

    response = client.post("/api/v1/ai/duplicates", json=payload)
    assert response.status_code == 200
    data = response.json()

    if len(data["matches"]) >= 2:
        assert data["matches"][0]["similarity"] >= data["matches"][1]["similarity"]
        # Candidate 2 is a closer semantic match than Candidate 1
        assert data["matches"][0]["id"] == 2


def test_duplicate_empty_candidates_returns_empty_list(client: TestClient):
    """Verify that empty candidates list returns 200 with 0 matches."""
    payload = {
        "new_challenge": {
            "id": 101,
            "title": "Street light not glowing",
            "description": "Pole 4 light broken.",
            "lat": 22.7000,
            "lon": 75.8000,
        },
        "candidates": [],
    }
    response = client.post("/api/v1/ai/duplicates", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["matches"] == []
    assert data["total_matches"] == 0
