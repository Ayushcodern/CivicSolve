"""
CivicSolve AI Microservice — Domain Classification API

Predicts civic challenge domains and sub-domains using semantic centroid comparison
over 384-dimensional sentence embeddings, and extracts top 5 relevant keywords.

Domains supported:
  1. Water Supply
  2. Rural Infrastructure
  3. Sanitation
  4. Agriculture
  5. Public Health
"""

import logging
import re
from typing import Dict, List, Tuple

import numpy as np
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.core.nlp import EmbeddingService

logger = logging.getLogger(__name__)

router = APIRouter()

# ── Domain & Sub-Domain Exemplars (Centroid Anchors) ─────────

DOMAIN_EXEMPLARS: Dict[str, List[str]] = {
    "Water Supply": [
        "community handpump broken drinking water failure groundwater well dry",
        "water pipeline leakage contamination yellow muddy tap water supply",
        "overhead water tank leaking repair borewell submersible pump failure",
        "drinking water shortage arsenic fluoride salinity purification filter",
        "village water supply disruption tube well repair water tanker needed",
        "clean drinking water access water reservoir chlorination pipeline burst",
        "handpump not working school drinking water source broken water crisis",
    ],
    "Rural Infrastructure": [
        "unpaved village road washed out pothole damaged road connectivity monsoon",
        "broken bridge culvert collapse transport cut off approach road repair",
        "electricity power line transformer blown rural electrification street light broken",
        "village bus transit connectivity road impassable heavy rain mud road",
        "damaged causeway village accessibility highway link road construction asphalt",
    ],
    "Sanitation": [
        "open garbage dump municipal solid waste stench plastic waste collection",
        "blocked drain sewage overflow open sewer drain dirty stagnant wastewater",
        "community toilet broken dirty lack of water open defecation hygiene",
        "waste segregation composting market haat trash pile uncollected garbage",
        "mosquito breeding open drain foul smell sanitation worker cleanliness",
    ],
    "Agriculture": [
        "crop loss pest infestation soybean cotton insects blight fungus damage",
        "farm irrigation canal dry drip irrigation tube well water for crops",
        "soil health degradation fertilizer shortage crop yield loss seeds",
        "harvest storage warehouse grain rotting mandi market storage cold storage vegetables",
        "farmer distress crop damage drought unseasonal rain pest attack",
    ],
    "Public Health": [
        "primary health centre PHC doctor medicine vaccine cold storage refrigerator",
        "disease outbreak dengue malaria fever diarrhea gastrointestinal epidemic illness",
        "maternal child health ambulance healthcare clinic emergency medical equipment",
        "hospital power outage vaccine spoiled medical supplies health worker clinic",
        "community healthcare immunization facility rural dispensary doctor shortage patient",
    ],
}

SUB_DOMAIN_EXEMPLARS: Dict[str, Dict[str, List[str]]] = {
    "Water Supply": {
        "Groundwater Quality": [
            "muddy water yellow turbid water from handpump groundwater contamination arsenic fluoride salinity",
            "water test failed high dissolved solids bacteria in well water smelly contaminated water",
        ],
        "Water Storage": [
            "overhead tank leaking cracked water reservoir sump storage tank overflow valve broken",
            "water storage tank damage missing cover rainwater harvesting tank broken",
        ],
        "Drinking Water Distribution": [
            "drinking water pipeline distribution broken no water supply in taps water tanker required",
            "village pipe network dry low pressure water distribution pipeline leak",
        ],
        "Handpump & Borewell Maintenance": [
            "handpump handle broken borewell motor burnt submersible pump repair needed tube well failure",
            "handpump not drawing water mechanical failure spare parts required for village handpump in school",
        ],
    },
    "Rural Infrastructure": {
        "Road Connectivity": [
            "village road potholes asphalt damage unpaved approach road mud washed out connectivity",
            "village road impassable heavy rain vehicles unable to reach",
        ],
        "Bridge & Culvert Maintenance": [
            "culvert collapsed small bridge damaged stream crossing impassable bridge crack",
            "causeway submerged broken bridge pillar structure danger",
        ],
        "Rural Electrification": [
            "power outage street lights broken electricity pole tilted transformer burnt wire down",
            "frequent load shedding voltage fluctuation rural electrical line snapped",
        ],
        "Public Transportation Access": [
            "bus stop dilapidated no transport access bus connectivity road cut off isolated village",
        ],
    },
    "Sanitation": {
        "Solid Waste Management": [
            "garbage dump unsegregated waste trash open lot plastic accumulation uncollected waste haat",
            "waste heap dumping ground municipal waste disposal stench",
        ],
        "Sewage & Drainage": [
            "blocked sewage drain overflow dirty foul water drainage channel clogged monsoon drain",
            "stagnant wastewater open gutter breeding mosquitoes sewer line blocked",
        ],
        "Community Toilets": [
            "public toilet flush broken door damaged dirty community latrine sanitation",
            "school toilets unusable lack of water broken latrine seat",
        ],
        "Hygiene & Waste Treatment": [
            "open defecation prevention hygiene sanitation awareness waste treatment composting",
        ],
    },
    "Agriculture": {
        "Pest Management": [
            "pest infestation caterpillar whitefly crop disease leaf curl fungus insect attack soybean",
            "locust attack crop blight insecticide spraying failure pest destruction",
        ],
        "Crop Irrigation": [
            "field canal dry farm irrigation tube well drip system water shortage for crops",
            "lift irrigation failure dried up canal agricultural water supply",
        ],
        "Soil Health & Fertility": [
            "soil fertility degradation saline soil fertilizer requirement soil testing nutrients",
            "soil erosion alkaline soil deficient micronutrients poor crop yield",
        ],
        "Post-Harvest Storage": [
            "grain storage mandi warehouse moisture crop rot cold storage for harvest produce",
        ],
    },
    "Public Health": {
        "Cold Chain Infrastructure": [
            "vaccine refrigerator cold storage temperature failure power outage PHC vaccine spoiled",
            "solar cold chain refrigeration failure vaccine preservation broken",
        ],
        "Primary Health Centre Facilities": [
            "PHC building damaged lack of medicines clinic equipment rural dispensary basic supplies",
        ],
        "Disease Surveillance & Outbreak": [
            "dengue malaria fever outbreak cholera waterborne disease infection hospital emergency",
            "gastrointestinal illness cases rising viral outbreak seasonal epidemic",
        ],
        "Maternal & Child Health": [
            "maternity ward infant care ambulance service emergency prenatal delivery care",
        ],
    },
}

STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "arent", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both",
    "but", "by", "can", "cannot", "could", "did", "do", "does", "doing", "down", "during", "each",
    "few", "for", "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers",
    "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is", "isnt", "it", "its",
    "itself", "just", "me", "more", "most", "my", "myself", "no", "nor", "not", "now", "of", "off",
    "on", "once", "only", "or", "other", "our", "ours", "ourselves", "out", "over", "own", "same",
    "she", "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them",
    "themselves", "then", "there", "these", "they", "this", "those", "through", "to", "too", "under",
    "until", "up", "very", "was", "wasnt", "we", "were", "werent", "what", "when", "where", "which",
    "while", "who", "whom", "why", "with", "would", "you", "your", "yours", "yourself", "yourselves",
    "due", "per", "also", "many", "much", "well", "near", "since",
}


# ── Domain Classifier & Centroid Engine ───────────────────────

class DomainClassifier:
    """
    Computes and caches centroid vectors for domains and sub-domains.
    Performs fast cosine-similarity classification and KeyBERT-style keyword extraction.
    """

    def __init__(self) -> None:
        self._domain_centroids: Dict[str, np.ndarray] = {}
        self._subdomain_centroids: Dict[str, Dict[str, np.ndarray]] = {}
        self._initialized = False

    def initialize(self) -> None:
        """Compute and cache normalized centroids using the EmbeddingService."""
        embedding_service = EmbeddingService.get_instance()
        if not embedding_service.is_loaded:
            embedding_service.load_model()

        logger.info("Computing domain centroids...")

        # Domain centroids
        for domain, texts in DOMAIN_EXEMPLARS.items():
            embeddings = embedding_service.get_embeddings_batch(texts)
            arr = np.array(embeddings, dtype=np.float32)
            centroid = np.mean(arr, axis=0)
            norm = np.linalg.norm(centroid)
            if norm > 0:
                centroid = centroid / norm
            self._domain_centroids[domain] = centroid

        # Sub-domain centroids
        for domain, sub_dict in SUB_DOMAIN_EXEMPLARS.items():
            self._subdomain_centroids[domain] = {}
            for sub_name, texts in sub_dict.items():
                embeddings = embedding_service.get_embeddings_batch(texts)
                arr = np.array(embeddings, dtype=np.float32)
                centroid = np.mean(arr, axis=0)
                norm = np.linalg.norm(centroid)
                if norm > 0:
                    centroid = centroid / norm
                self._subdomain_centroids[domain][sub_name] = centroid

        self._initialized = True
        logger.info("Domain centroids initialized for %d domains.", len(self._domain_centroids))

    @property
    def is_initialized(self) -> bool:
        return self._initialized

    def predict(self, title: str, description: str) -> Tuple[str, str, float]:
        """
        Predict domain and sub-domain using semantic centroid comparison.

        Returns:
            Tuple of (domain, sub_domain, confidence_score)
        """
        if not self._initialized:
            self.initialize()

        embedding_service = EmbeddingService.get_instance()
        full_text = f"{title.strip()}. {description.strip()}".strip()
        if not full_text:
            raise ValueError("Input title and description cannot both be empty.")

        doc_vector = np.array(embedding_service.get_embedding(full_text), dtype=np.float32)
        doc_norm = np.linalg.norm(doc_vector)
        if doc_norm > 0:
            doc_vector = doc_vector / doc_norm

        # 1. Compare against domain centroids
        domain_similarities: Dict[str, float] = {}
        for domain, centroid in self._domain_centroids.items():
            sim = float(np.dot(doc_vector, centroid))
            domain_similarities[domain] = sim

        best_domain = max(domain_similarities, key=domain_similarities.get)  # type: ignore

        # 2. Softmax confidence with temperature scaling
        temperature = 0.15
        sim_values = np.array(list(domain_similarities.values()), dtype=np.float32)
        exp_sims = np.exp((sim_values - np.max(sim_values)) / temperature)
        softmax_probs = exp_sims / np.sum(exp_sims)
        domain_keys = list(domain_similarities.keys())
        best_domain_idx = domain_keys.index(best_domain)
        confidence = float(softmax_probs[best_domain_idx])
        confidence = round(max(0.0, min(1.0, confidence)), 4)

        # 3. Compare against sub-domain centroids within winning domain
        sub_dict = self._subdomain_centroids.get(best_domain, {})
        if sub_dict:
            sub_similarities = {
                sub_name: float(np.dot(doc_vector, centroid))
                for sub_name, centroid in sub_dict.items()
            }
            best_sub_domain = max(sub_similarities, key=sub_similarities.get)  # type: ignore
        else:
            best_sub_domain = "General"

        return best_domain, best_sub_domain, confidence

    def extract_keywords(self, title: str, description: str, top_k: int = 5) -> List[str]:
        """
        Extract top-k relevant keywords using semantic similarity between candidate
        terms and the full text embedding (KeyBERT approach).
        """
        embedding_service = EmbeddingService.get_instance()
        full_text = f"{title.strip()} {description.strip()}".strip()

        # Tokenize and filter candidate words (min 3 chars, letters only, no stopwords)
        tokens = re.findall(r"\b[a-zA-Z]{3,}\b", full_text.lower())
        candidates = []
        seen = set()
        for tok in tokens:
            if tok not in STOPWORDS and tok not in seen:
                seen.add(tok)
                candidates.append(tok)

        if not candidates:
            return []

        # If candidates <= top_k, return all
        if len(candidates) <= top_k:
            return candidates

        # Score candidate words via semantic similarity with the full text embedding
        doc_vector = np.array(embedding_service.get_embedding(full_text), dtype=np.float32)
        doc_norm = np.linalg.norm(doc_vector)
        if doc_norm > 0:
            doc_vector = doc_vector / doc_norm

        candidate_embeddings = embedding_service.get_embeddings_batch(candidates)
        candidate_matrix = np.array(candidate_embeddings, dtype=np.float32)
        # Normalize rows
        norms = np.linalg.norm(candidate_matrix, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        candidate_matrix = candidate_matrix / norms

        similarities = np.dot(candidate_matrix, doc_vector)
        top_indices = np.argsort(similarities)[::-1][:top_k]

        return [candidates[i] for i in top_indices]


# Singleton instance
classifier = DomainClassifier()


# ── Request / Response Schemas ────────────────────────────────

class ClassifyRequest(BaseModel):
    title: str = Field(
        ...,
        min_length=1,
        description="Title of the challenge or civic issue",
        examples=["Handpump broken in school"],
    )
    description: str = Field(
        default="",
        description="Detailed description of the civic problem",
        examples=["Community handpump in primary school is not working, leaving children without water."],
    )


class ClassifyResponse(BaseModel):
    domain: str = Field(..., description="Predicted civic domain", examples=["Water Supply"])
    sub_domain: str = Field(..., description="Predicted sub-domain", examples=["Handpump & Borewell Maintenance"])
    confidence: float = Field(..., description="Classification confidence score between 0.0 and 1.0", examples=[0.9421])
    keywords: List[str] = Field(..., description="Top relevant keywords extracted from title and description", examples=[["handpump", "school", "water", "children", "broken"]])


# ── Router Endpoints ──────────────────────────────────────────

@router.post(
    "/classify",
    response_model=ClassifyResponse,
    summary="Classify civic challenge into domain and sub-domain",
    description="Uses semantic centroid comparison over all-MiniLM-L6-v2 embeddings to predict domain and sub-domain with confidence, plus extracts top 5 keywords.",
)
@router.post(
    "/classify/",
    response_model=ClassifyResponse,
    include_in_schema=False,
)
async def classify_challenge(payload: ClassifyRequest) -> ClassifyResponse:
    title = payload.title.strip()
    description = payload.description.strip()

    if not title and not description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either title or description must contain text.",
        )

    try:
        domain, sub_domain, confidence = classifier.predict(title, description)
        keywords = classifier.extract_keywords(title, description, top_k=5)

        return ClassifyResponse(
            domain=domain,
            sub_domain=sub_domain,
            confidence=confidence,
            keywords=keywords,
        )
    except Exception as exc:
        logger.exception("Error during challenge classification: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Classification failed: {str(exc)}",
        ) from exc
