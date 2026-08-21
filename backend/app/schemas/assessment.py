from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

class AssessmentSymptomCreate(BaseModel):
    symptom: str
    symptom_code: str | None = None
    selected: bool = True

class AssessmentSafetyQuestionCreate(BaseModel):
    question_code: str
    question_text: str
    answer: bool

class AssessmentMedicalContextCreate(BaseModel):
    context_type: str
    context_key: str
    context_value: str
    confirmed: bool = True

class AssessmentCreate(BaseModel):
    primary_symptom: str
    duration: str
    severity: int
    worsening: str
    additional_notes: str | None = None
    medical_context_confirmed: bool = True
    
    additional_symptoms: list[AssessmentSymptomCreate] = []
    safety_questions: list[AssessmentSafetyQuestionCreate] = []
    medical_context: list[AssessmentMedicalContextCreate] = []

class AssessmentResponse(BaseModel):
    id: UUID
    status: str
    primary_symptom: str
    duration: str
    severity: int
    worsening: str
    started_at: datetime
    submitted_at: datetime | None = None
    completed_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)

class CareRecommendationResponse(BaseModel):
    id: UUID
    recommendation_type: str
    title: str
    timeframe: str
    priority_level: str
    emergency_flag: bool
    reason: str
    explanation: str
    safety_advisory: str
    generated_at: datetime

    model_config = ConfigDict(from_attributes=True)
