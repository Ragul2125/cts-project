from sqlalchemy import Column, String, Boolean, DateTime, Date, Integer, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from app.models.auth_models import utcnow
from app.core.database import Base
import uuid

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), index=True, nullable=False)
    status = Column(String, nullable=False)
    primary_symptom = Column(String, nullable=False)
    duration = Column(String, nullable=False)
    severity = Column(Integer, nullable=False)
    worsening = Column(String, nullable=False)
    additional_notes = Column(Text, nullable=True)
    medical_context_confirmed = Column(Boolean, default=False)
    
    started_at = Column(DateTime, default=utcnow)
    submitted_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utcnow, index=True)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

class AssessmentSymptom(Base):
    __tablename__ = "assessment_symptoms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.id"), nullable=False)
    symptom = Column(String, nullable=False)
    symptom_code = Column(String, nullable=True)
    selected = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

class AssessmentSafetyQuestion(Base):
    __tablename__ = "assessment_safety_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.id"), nullable=False)
    question_code = Column(String, nullable=False)
    question_text = Column(Text, nullable=False)
    answer = Column(Boolean, nullable=False)
    created_at = Column(DateTime, default=utcnow)

class AssessmentMedicalContext(Base):
    __tablename__ = "assessment_medical_context"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.id"), nullable=False)
    context_type = Column(String, nullable=False)
    context_key = Column(String, nullable=False)
    context_value = Column(Text, nullable=False)
    confirmed = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

class CareRecommendation(Base):
    __tablename__ = "care_recommendations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.id"), nullable=False)
    recommendation_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    timeframe = Column(String, nullable=False)
    priority_level = Column(String, nullable=False)
    emergency_flag = Column(Boolean, default=False)
    reason = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)
    safety_advisory = Column(Text, nullable=False)
    model_name = Column(String, nullable=False)
    status = Column(String, nullable=False, default="Generated")
    
    generated_at = Column(DateTime, default=utcnow)
    created_at = Column(DateTime, default=utcnow)

class EmergencyRequest(Base):
    __tablename__ = "emergency_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), index=True, nullable=False)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.id"), nullable=False)
    recommendation_id = Column(UUID(as_uuid=True), ForeignKey("care_recommendations.id"), nullable=True)
    
    priority = Column(String, nullable=False)
    status = Column(String, nullable=False)
    request_type = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

class CarePlan(Base):
    __tablename__ = "care_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), index=True, nullable=False)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.id"), nullable=False)
    recommendation_id = Column(UUID(as_uuid=True), ForeignKey("care_recommendations.id"), nullable=False)
    
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    subtitle = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    status = Column(String, nullable=False)
    active = Column(Boolean, default=True, index=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

class CarePlanAction(Base):
    __tablename__ = "care_plan_actions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    care_plan_id = Column(UUID(as_uuid=True), ForeignKey("care_plans.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    action_type = Column(String, nullable=False)
    frequency = Column(String, nullable=True)
    status = Column(String, nullable=False, default="Pending")
    due_date = Column(Date, nullable=True)
    sort_order = Column(Integer, default=0)
    
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

class SafetyProtocol(Base):
    __tablename__ = "safety_protocols"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    care_plan_id = Column(UUID(as_uuid=True), ForeignKey("care_plans.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String, nullable=False)
    emergency_action = Column(Text, nullable=False)
    
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

class DailyGoal(Base):
    __tablename__ = "daily_goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    care_plan_id = Column(UUID(as_uuid=True), ForeignKey("care_plans.id"), nullable=False)
    goal_text = Column(String, nullable=False)
    frequency = Column(String, nullable=False)
    completed = Column(Boolean, default=False)
    goal_date = Column(Date, nullable=False)
    
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

class CarePlanProvider(Base):
    __tablename__ = "care_plan_providers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    care_plan_id = Column(UUID(as_uuid=True), ForeignKey("care_plans.id"), nullable=False)
    provider_id = Column(UUID(as_uuid=True), ForeignKey("providers.id"), nullable=False)
    role = Column(String, nullable=False)
    recommended = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=utcnow)

class PatientActivityLog(Base):
    __tablename__ = "patient_activity_log"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), index=True, nullable=False)
    activity_type = Column(String, nullable=False)
    reference_type = Column(String, nullable=True)
    reference_id = Column(UUID(as_uuid=True), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    activity_date = Column(DateTime, default=utcnow)
    
    created_at = Column(DateTime, default=utcnow)
