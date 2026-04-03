import os
from pathlib import Path
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker

# Load .env from the project root (two levels up from this file)
try:
    from dotenv import load_dotenv
    _env_path = Path(__file__).resolve().parents[4] / ".env"
    load_dotenv(_env_path)
except ImportError:
    pass  # python-dotenv not installed; rely on env vars being set in the shell

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/pretzel")

# Normalize URL: enforce asyncpg driver and strip sslmode (psycopg2-only param)
_url = DATABASE_URL
for prefix in ("postgresql://", "postgres://"):
    if _url.startswith(prefix):
        _url = "postgresql+asyncpg://" + _url[len(prefix):]
        break
_url = _url.replace("?sslmode=require", "").replace("&sslmode=require", "")

_is_supabase = "supabase.com" in DATABASE_URL

# asyncpg connect_args for Supabase:
#   ssl="require"         — string form required (bool doesn't work reliably)
#   statement_cache_size=0 — required for pgBouncer / Supabase session pooler
_connect_args = {"ssl": "require", "statement_cache_size": 0} if _is_supabase else {}

engine = create_async_engine(
    _url,
    echo=False,
    connect_args=_connect_args,
    pool_pre_ping=True,    # drop stale connections before use
    pool_recycle=300,      # recycle connections every 5 min
)

AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
