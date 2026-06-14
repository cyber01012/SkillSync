"""Application configuration using pydantic-settings."""
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from urllib.parse import quote_plus
import os


class Settings(BaseSettings):
    # SQL Server
    sql_server_driver: str = "ODBC+Driver+18+for+SQL+Server"
    sql_server_host: str = "localhost"
    sql_server_port: int = 1433
    sql_server_db: str = "skillsync"
    
    # SQL Server Auth — OPTIONAL for Windows Auth
    sql_server_user: str = ""
    sql_server_password: str = ""
    
    # MongoDB
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db: str = "skillsync"
    
    # JWT
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    refresh_token_expire_days: int = 7
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # AI APIs
    gemini_api_key_1: str = ""
    gemini_api_key_2: str = ""
    
    @property
    def sql_server_auth_mode(self) -> str:
        if self.sql_server_user and self.sql_server_password:
            return "sql"
        return "windows"

    @property
    def sql_server_connection_string(self) -> str:
        # Windows Authentication (Trusted_Connection=yes)
        if self.sql_server_auth_mode == "windows":
            return (
                f"mssql+pyodbc://@{self.sql_server_host}:{self.sql_server_port}"
                f"/{self.sql_server_db}?"
                f"driver={self.sql_server_driver}"
                f"&Trusted_Connection=yes"
                f"&TrustServerCertificate=yes"
            )
        
        # SQL Server Authentication (user/password)
        encoded_password = quote_plus(self.sql_server_password)
        return (
            f"mssql+pyodbc://{self.sql_server_user}:{encoded_password}"
            f"@{self.sql_server_host}:{self.sql_server_port}"
            f"/{self.sql_server_db}?"
            f"driver={self.sql_server_driver}"
            f"&TrustServerCertificate=yes"
        )
    
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()