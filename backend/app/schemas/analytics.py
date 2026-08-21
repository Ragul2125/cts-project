from pydantic import BaseModel, ConfigDict

class HospitalDashboardResponse(BaseModel):
    care_request_count: int
    high_priority_count: int
    ed_requests: int
    pending_care_actions: int
    recent_requests: list

class CmsOverviewResponse(BaseModel):
    total_ed_visits: int
    repeat_ed_utilizers: int
    potential_care_navigation_opportunities: int
    post_discharge_ed_visits: int

class UtilizationTrendResponse(BaseModel):
    month: str
    ed_visits: int
    clinic_visits: int
