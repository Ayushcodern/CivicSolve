"""
CivicSolve AI Microservice — Application Settings

Loads configuration from environment variables with sensible defaults
for local development. In production, values come from .env or Docker env.
"""

from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Central configuration loaded from environment variables."""

    # ── Application ──────────────────────────────────────────
    app_name: str = "CivicSolve-AI"
    app_version: str = "0.1.0"
    debug: bool = True

    # ── Database ─────────────────────────────────────────────
    postgres_db: str = Field(default="civicsolve", alias="POSTGRES_DB")
    postgres_user: str = Field(default="postgres", alias="POSTGRES_USER")
    postgres_password: str = Field(default="postgres", alias="POSTGRES_PASSWORD")
    postgres_host: str = Field(default="localhost", alias="POSTGRES_HOST")
    postgres_port: int = Field(default=5432, alias="POSTGRES_PORT")

    # ── AI / ML ──────────────────────────────────────────────
    embedding_model: str = "all-MiniLM-L6-v2"
    similarity_threshold: float = 0.82
    max_batch_size: int = 32

    # ── CORS ─────────────────────────────────────────────────
    cors_origins: list[str] = ["*"]

    @property
    def database_url(self) -> str:
        """Construct the async-compatible PostgreSQL connection string."""
        return (
            f"postgresql://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "populate_by_name": True,
    }


# Singleton settings instance
settings = Settings()
