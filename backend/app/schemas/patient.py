from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import date, datetime

class PatientBase(BaseModel):
    patient_id: str
    name: str
    date_of_birth: date | None = None
    age: int
    gender: str
    blood_group: str | None = None
    status: str
    phone: str | None = None
    email: str | None = None
    address: str | None = None

class PatientResponse(PatientBase):
    id: UUID
    user_id: UUID | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ConditionResponse(BaseModel):
    id: UUID
    condition: str
    status: str
    first_seen_date: date | None = None
    last_seen_date: date | None = None

    model_config = ConfigDict(from_attributes=True)

class AllergyResponse(BaseModel):
    id: UUID
    allergen: str
    reaction: str | None = None
    severity: str | None = None
    active: bool

    model_config = ConfigDict(from_attributes=True)

class MedicationResponse(BaseModel):
    id: UUID
    medication_name: str
    active: bool
    first_seen_date: date | None = None

    model_config = ConfigDict(from_attributes=True)

class PatientDashboardResponse(BaseModel):
    patient: dict
    health_summary: dict
    utilization: dict
    active_care_plan: dict | None = None
    medical_file_count: int
    recent_activity: list
