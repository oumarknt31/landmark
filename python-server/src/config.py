from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", ".env.local"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    supabase_url: str = ""
    supabase_service_role_key: str = ""
    anthropic_api_key: str = ""
    admin_token: str = ""
    cors_origin: str = "http://localhost:5173,http://localhost:4173"
    port: int = 8000
    content_dir: str = "../src/content"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.cors_origin.split(",") if o.strip()]

    @property
    def content_path(self) -> Path:
        p = Path(self.content_dir)
        return p if p.is_absolute() else (Path(__file__).resolve().parents[1] / p).resolve()


settings = Settings()
