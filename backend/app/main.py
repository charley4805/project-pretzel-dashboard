from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import admin_analytics, marketing, sales, traffic, gmail_inbox, crm, social, agents

app = FastAPI(
    title="Project Pretzel Analytics API",
    description=(
        "Internal dashboard API for the Pretzel ecosystem.\n\n"
        "Data sources:\n"
        "- **Pretzel.io** (FastAPI + Supabase/PostgreSQL): users, projects, contracts, analytics events\n"
        "- **PretzelKnot** (.NET + PostgreSQL): contractor profiles, billing, reviews\n"
        "- **Gmail** (Google Workspace `admin@projectpretzel.org`): support & sales inbox\n"
        "- **Twitter/X** API v2: posts from @projectpretzel\n"
        "- **LinkedIn** API: posts from Project Pretzel company page"
    ),
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_analytics.router, prefix="/api/admin/analytics", tags=["Analytics"])
app.include_router(marketing.router,       prefix="/api/admin/marketing",  tags=["Marketing"])
app.include_router(sales.router,           prefix="/api/admin/sales",       tags=["Sales"])
app.include_router(traffic.router,         prefix="/api/admin/traffic",     tags=["Traffic"])
app.include_router(gmail_inbox.router,     prefix="/api/admin/inbox",       tags=["Inbox"])
app.include_router(crm.router,             prefix="/api/admin/crm",         tags=["CRM"])
app.include_router(social.router,          prefix="/api/admin/social",      tags=["Social"])
app.include_router(agents.router,           prefix="/api/admin/agents",      tags=["Agents"])


@app.get("/health")
def health_check():
    return {"status": "ok", "version": "3.0.0"}
