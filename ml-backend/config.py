"""
Configuration settings for the application
"""

from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/course_allocation_ml"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # ML Configuration
    ML_MODEL_PATH: str = "./models"
    TRAINING_DATA_PATH: str = "./data/training"
    TEST_SIZE: float = 0.2
    RANDOM_STATE: int = 42
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"

settings = Settings()
