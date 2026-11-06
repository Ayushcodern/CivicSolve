"""
CivicSolve AI Microservice — Domain Classification Test Suite

Tests:
  - Verification that "Handpump broken in school" returns "Water Supply"
  - Multi-domain validation (Rural Infrastructure, Sanitation, Agriculture, Public Health)
  - Keyword extraction validation (top 5, filtered stopwords)
  - Validation error handling (empty payload)
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="module")
def client():
    """Module-scoped test client that runs the FastAPI lifespan once."""
    with TestClient(app) as test_client:
        yield test_client


def test_classify_handpump_broken_in_school_returns_water_supply(client: TestClient):
    """
    Primary requirement:
    Verify that a challenge with title "Handpump broken in school" returns "Water Supply".
    """
    payload = {
        "title": "Handpump broken in school",
        "description": "The community handpump in the primary school has stopped working, leaving children without water.",
    }
    response = client.post("/api/v1/ai/classify", json=payload)

    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()

    # Domain assertion
    assert data["domain"] == "Water Supply", f"Expected 'Water Supply', got '{data['domain']}'"

    # Sub-domain assertion
    assert data["sub_domain"] in [
        "Handpump & Borewell Maintenance",
        "Groundwater Quality",
        "Drinking Water Distribution",
        "Water Storage",
    ]

    # Confidence score assertion
    assert 0.0 <= data["confidence"] <= 1.0, f"Confidence {data['confidence']} out of bounds"
    assert data["confidence"] > 0.4, "Confidence should be reasonably high for a clear water challenge"

    # Keywords assertion
    assert isinstance(data["keywords"], list)
    assert 1 <= len(data["keywords"]) <= 5
    # Should extract key nouns like 'handpump', 'school', or 'water'
    keywords_lower = [k.lower() for k in data["keywords"]]
    assert any(k in keywords_lower for k in ["handpump", "water", "school", "broken"])


@pytest.mark.parametrize(
    "title,description,expected_domain",
    [
        (
            "Road washed out after heavy rains",
            "The unpaved approach road connecting our village to the main highway is impassable.",
            "Rural Infrastructure",
        ),
        (
            "Open garbage dump near railway station",
            "Massive unsegregated municipal solid waste pile rotting with terrible stench and flies.",
            "Sanitation",
        ),
        (
            "Soybean pest infestation destroying crops",
            "Caterpillars and whitefly attacking hundreds of acres of soybean fields.",
            "Agriculture",
        ),
        (
            "Vaccines spoiling due to PHC power failure",
            "The primary health centre has no backup generator for the cold-chain vaccine refrigerator.",
            "Public Health",
        ),
    ],
)
def test_classify_all_five_domains(client: TestClient, title: str, description: str, expected_domain: str):
    """Verify that all 5 target domains are accurately classified."""
    response = client.post(
        "/api/v1/ai/classify",
        json={"title": title, "description": description},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["domain"] == expected_domain
    assert 0.0 <= data["confidence"] <= 1.0
    assert len(data["keywords"]) <= 5


def test_classify_empty_payload_rejected(client: TestClient):
    """Verify that empty inputs are rejected with 422 or 400."""
    response = client.post(
        "/api/v1/ai/classify",
        json={"title": "", "description": ""},
    )
    # FastAPI min_length=1 triggers 422 Unprocessable Entity
    assert response.status_code in [400, 422]


def test_classify_health_check_shows_classifier_ready(client: TestClient):
    """Verify /health endpoint reports model_loaded and classifier_ready."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert data["classifier_ready"] is True
