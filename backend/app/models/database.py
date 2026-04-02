import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/pretzel")

# Strip sslmode query param — not valid for asyncpg, handled via connect_args below
_url = DATABASE_URL.replace("?sslmode=require", "").replace("&sslmode=require", "")

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
