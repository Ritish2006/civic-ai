"""
Smart Bharat Backend – Settings & Configuration
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    # App
    app_name: str = "Smart Bharat API"
    version: str = "1.0.0"
    debug: bool = True

    # Gemini AI
    gemini_api_key: str = ""
    gemini_model: str = "gemini-1.5-flash"
    gemini_pro_model: str = "gemini-1.5-pro"

    # Database
    database_url: str = "postgresql+asyncpg://postgres:password@localhost:5432/smartbharat"
    database_url_sync: str = "postgresql://postgres:password@localhost:5432/smartbharat"

    # ChromaDB
    chroma_persist_dir: str = "./rag/chroma_db"
    chroma_collection: str = "govt_docs"

    # JWT
    secret_key: str = "changeme-super-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    # Firebase
    firebase_credentials_path: str = "./firebase-credentials.json"

    # CORS
    allowed_origins: str = "http://localhost:3000,http://localhost:8000,http://127.0.0.1:8000"

    # File uploads
    upload_dir: str = "./uploads"
    max_file_size_mb: int = 10

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
