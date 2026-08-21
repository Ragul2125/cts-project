from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import date, datetime
from typing import List, Optional

class CarePlanActionResponse(BaseModel):
    id: UUID
    title: str
    description: str | None = None
    action_type: str
    frequency: str | None = None
    status: str
    due_date: date | None = None
    sort_order: int
    completed_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)

class SafetyProtocolResponse(BaseModel):
    id: UUID
    title: str
    description: str
    severity: str
    emergency_action: str

    model_config = ConfigDict(from_attributes=True)

class DailyGoalResponse(BaseModel):
    id: UUID
    goal_text: str
    frequency: str
    completed: bool
    goal_date: date

    model_config = ConfigDict(from_attributes=True)

class CarePlanProviderResponse(BaseModel):
    id: UUID
    provider_id: UUID
    role: str
    recommended: bool

    model_config = ConfigDict(from_attributes=True)

class CarePlanResponse(BaseModel):
    id: UUID
    title: str
    category: str
    subtitle: str | None = None
    description: str
    status: str
    active: bool
    start_date: date | None = None
    end_date: date | None = None

    model_config = ConfigDict(from_attributes=True)

class CarePlanFullResponse(BaseModel):
    plan: CarePlanResponse
    actions: List[CarePlanActionResponse]
    safety_protocol: Optional[SafetyProtocolResponse] = None
    daily_goals: List[DailyGoalResponse]
    providers: List[CarePlanProviderResponse]

class CarePlanActionCreate(BaseModel):
    title: str
    description: str | None = None
    action_type: str = "custom"
    frequency: str | None = None
    status: str = "Pending"
    sort_order: int = 1

class DailyGoalCreate(BaseModel):
    goal_text: str
    frequency: str = "Daily"
    completed: bool = False

class CarePlanCreate(BaseModel):
    title: str
    category: str
    subtitle: str | None = None
    description: str | None = None
    status: str = "Active"
    active: bool = True
    actions: List[CarePlanActionCreate] = []
    daily_goals: List[DailyGoalCreate] = []
