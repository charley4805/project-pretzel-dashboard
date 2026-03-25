from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import admin_analytics

app = FastAPI(
    title="Project Pretzel Analytics API",
    description="Internal dashboard for Analytics and App Health",
    version="1.0.0",
)

# Optional: Disable CORS for strict admin security or set specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In prod, restrict to internal dashboard URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_analytics.router, prefix="/api/admin/analytics", tags=["Admin Analytics"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
