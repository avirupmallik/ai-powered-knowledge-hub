"""
Configuration settings for the RAG-enabled AI Research Knowledge Hub.
Loads environment variables and provides centralized configuration.
"""

from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # OpenAI API Configuration
    openai_api_key: str
    openai_model: str = "gpt-4-turbo-preview"
    openai_embedding_model: str = "text-embedding-3-large"
    openai_max_tokens: int = 4096
    openai_temperature: float = 0.7
    
    # Qdrant Vector Database Configuration
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: str = ""
    qdrant_collection_name: str = "ai_research_knowledge"
    qdrant_vector_size: int = 3072
    
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_reload: bool = True
    
    # RAG Configuration
    retrieval_top_k: int = 5
    chunk_size: int = 1000
    chunk_overlap: int = 200
    
    # Logging
    log_level: str = "INFO"
    log_file: str = "./logs/app.log"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()

# Ensure required directories exist
Path("./logs").mkdir(parents=True, exist_ok=True)
Path("./data/uploaded_documents").mkdir(parents=True, exist_ok=True)
