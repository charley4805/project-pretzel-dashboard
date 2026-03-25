from pydantic import BaseModel
from typing import Optional

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

# Add remaining models for the routes as needed.
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
