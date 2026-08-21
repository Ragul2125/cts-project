from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import date, datetime

class EncounterResponse(BaseModel):
    id: UUID
    encounter_type: str
    facility_name: str
    encounter_date: date
    status: str
    is_emergency: bool
    ed_visits_last_12m: int
    days_since_last_discharge: int | None = None

    model_config = ConfigDict(from_attributes=True)

class LabResultResponse(BaseModel):
    id: UUID
    lab_date: date
    fasting_glucose: float | None = None
    hba1c: float | None = None
    systolic_bp: float | None = None
    cholesterol_ldl: float | None = None
    bun: float | None = None
    creatinine: float | None = None

    model_config = ConfigDict(from_attributes=True)

class PatientActivityLogResponse(BaseModel):
    id: UUID
    activity_type: str
    title: str
    description: str | None = None
    activity_date: datetime

    model_config = ConfigDict(from_attributes=True)

class PaginatedResponse(BaseModel):
    items: list
    page: int
    limit: int
    total: int
    has_next: bool
