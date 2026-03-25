from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import admin_analytics, marketing, sales

app = FastAPI(
    title="Project Pretzel Analytics API",
    description="Internal dashboard API for the Pretzel ecosystem — Analytics, Marketing, and Sales.\n\n"
                "Data sources:\n"
                "- **Pretzel.io** (Python/FastAPI + Supabase/PostgreSQL): users, projects, contracts, AI usage\n"
                "- **PretzelKnot** (.NET + PostgreSQL): contractor profiles, billing events, synced reviews",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In prod: restrict to dashboard URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_analytics.router, prefix="/api/admin/analytics", tags=["Analytics"])
app.include_router(marketing.router, prefix="/api/admin/marketing", tags=["Marketing"])
app.include_router(sales.router, prefix="/api/admin/sales", tags=["Sales"])


@app.get("/health")
def health_check():
    return {"status": "ok", "version": "2.0.0"}
