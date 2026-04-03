import os
from pathlib import Path
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker

# Load .env from the project root
try:
    from dotenv import load_dotenv
    _env_path = Path(__file__).resolve().parents[3] / ".env"
    load_dotenv(_env_path)
except ImportError:
    pass

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set")

# 🔥 FORCE async driver
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgresql://",
        "postgresql+asyncpg://",
        1
    )

# Strip sslmode from URL because asyncpg handles SSL via connect_args
_url = DATABASE_URL.replace("?sslmode=require", "").replace("&sslmode=require", "")

_is_supabase = "supabase.co" in DATABASE_URL

# Supabase / pgBouncer-safe settings
_connect_args = {"ssl": "require", "statement_cache_size": 0} if _is_supabase else {}

print("FINAL DATABASE URL:", DATABASE_URL)
print("ENV PATH:", _env_path)
print("RAW DATABASE_URL FROM ENV:", os.getenv("DATABASE_URL"))

engine = create_async_engine(
    _url,
    echo=False,
    connect_args=_connect_args,
    pool_pre_ping=True,
    pool_recycle=300,
)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session