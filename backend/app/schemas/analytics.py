from pydantic import BaseModel
from typing import Optional, List


class OverviewMetrics(BaseModel):
    total_users: int
    total_users_delta: float
    new_users_today: int
    new_users_delta: float
    daily_active: int
    daily_active_delta: float
    profiles_created: int
    total_searches_today: int
    ai_requests_today: int
    api_requests_today: int
    avg_api_latency_ms: int
    error_rate: float
    health_status: str
    # project-pretzel specific
    active_projects: int = 0
    contracts_this_month: int = 0


class KnotMetrics(BaseModel):
    """PretzelKnot contractor directory aggregate metrics."""
    total_contractors: int
    verified_contractors: int
    active_listings: int
    avg_rating: float
    new_contractors_today: int
    synced_projects: int


# Stubs — expand as real DB queries are wired in
class UsersMetrics(BaseModel):
    pass


class UsageMetrics(BaseModel):
    pass


class AIMetrics(BaseModel):
    pass


class SearchMetrics(BaseModel):
    pass


class ApiMetrics(BaseModel):
    pass


class HealthMetrics(BaseModel):
    pass
