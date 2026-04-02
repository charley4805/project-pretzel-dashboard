import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/pretzel")

# Strip sslmode from URL (psycopg2 param, not valid for asyncpg) and pass ssl separately
_url = DATABASE_URL.replace("?sslmode=require", "").replace("&sslmode=require", "")
_ssl = "supabase.com" in DATABASE_URL  # enable SSL for Supabase connections

engine = create_async_engine(_url, echo=False, connect_args={"ssl": _ssl} if _ssl else {})
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
