import os
import logging
from pathlib import Path
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker

logger = logging.getLogger(__name__)

# Load .env — database.py -> models/ -> app/ -> backend/ -> project-pretzel-dashboard/
_env_path = Path(__file__).resolve().parents[3] / ".env"

try:
    from dotenv import load_dotenv
    loaded = load_dotenv(_env_path)
    if loaded:
        logger.info(f"Loaded .env from {_env_path}")
    else:
        logger.warning(f".env not found at {_env_path} — falling back to shell environment")
except ImportError:
    logger.warning("python-dotenv not installed; relying on shell environment variables")

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError(f"DATABASE_URL is not set. Looked for .env at: {_env_path}")

# Enforce asyncpg driver regardless of what format is in .env
for _prefix in ("postgresql://", "postgres://"):
    if DATABASE_URL.startswith(_prefix):
        DATABASE_URL = "postgresql+asyncpg://" + DATABASE_URL[len(_prefix):]
        break

# Strip sslmode — psycopg2-only param, handled via connect_args below
_url = DATABASE_URL.replace("?sslmode=require", "").replace("&sslmode=require", "")

_is_supabase = "supabase.co" in DATABASE_URL

# Log host without password
try:
    from urllib.parse import urlparse
    _p = urlparse(_url)
    logger.info(f"DB host: {_p.hostname}:{_p.port}{_p.path}")
except Exception:
    pass

# asyncpg connect_args for Supabase:
#   ssl="require"          — string form required (bool doesn't work reliably)
#   statement_cache_size=0 — required for pgBouncer / Supabase session pooler
_connect_args = {"ssl": "require", "statement_cache_size": 0} if _is_supabase else {}

engine = create_async_engine(
    _url,
    echo=False,
    connect_args=_connect_args,
    pool_pre_ping=True,
    pool_recycle=300,
)

AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False,
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
