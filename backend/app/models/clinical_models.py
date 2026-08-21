from sqlalchemy import Column, String, Boolean, DateTime, Date, Integer, ForeignKey, Text, DECIMAL
from sqlalchemy.dialects.postgresql import UUID
from app.models.auth_models import utcnow
from app.core.database import Base
import uuid

class HealthcareEncounter(Base):
    __tablename__ = "healthcare_encounters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), index=True, nullable=False)
    provider_id = Column(UUID(as_uuid=True), ForeignKey("providers.id"), nullable=True)
    source_record_id = Column(UUID(as_uuid=True), ForeignKey("patient_data_records.id"), nullable=True)
    
    encounter_type = Column(String, nullable=False)
    facility_name = Column(String, nullable=False)
    encounter_date = Column(Date, index=True, nullable=False)
    discharge_date = Column(Date, nullable=True)
    status = Column(String, nullable=False, default="Completed")
    is_emergency = Column(Boolean, default=False)
    
    ed_visits_last_12m = Column(Integer, default=0)
    days_since_last_discharge = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    primary_diagnosis = Column(String, nullable=True)
    icd10_code = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)


class LabResult(Base):
    __tablename__ = "lab_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), index=True, nullable=False)
    source_record_id = Column(UUID(as_uuid=True), ForeignKey("patient_data_records.id"), nullable=True)
    
    lab_date = Column(Date, index=True, nullable=False)
    
    fasting_glucose = Column(DECIMAL, nullable=True)
    hba1c = Column(DECIMAL, nullable=True)
    systolic_bp = Column(DECIMAL, nullable=True)
    cholesterol_ldl = Column(DECIMAL, nullable=True)
    bun = Column(DECIMAL, nullable=True)
    creatinine = Column(DECIMAL, nullable=True)
    
    created_at = Column(DateTime, default=utcnow)


class MedicalFile(Base):
    __tablename__ = "medical_files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), index=True, nullable=False)
    provider_id = Column(UUID(as_uuid=True), ForeignKey("providers.id"), nullable=True)
    
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=False)
    file_url = Column(String, nullable=True)
    file_type = Column(String, nullable=False)
    file_size = Column(String, nullable=False)
    icon_type = Column(String, nullable=True)
    status = Column(String, nullable=False, default="Active")
    document_date = Column(Date, nullable=True)
    
    uploaded_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)


class PatientProcedure(Base):
    __tablename__ = "patient_procedures"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), index=True, nullable=False)
    encounter_id = Column(UUID(as_uuid=True), ForeignKey("healthcare_encounters.id"), nullable=True)
    
    procedure_name = Column(String, nullable=False)
    cpt_code = Column(String, nullable=True)
    procedure_date = Column(Date, nullable=True)
    
    created_at = Column(DateTime, default=utcnow)


class Claim(Base):
    __tablename__ = "claims"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    claim_id = Column(String, unique=True, index=True, nullable=False)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), index=True, nullable=False)
    encounter_id = Column(UUID(as_uuid=True), ForeignKey("healthcare_encounters.id"), nullable=True)
    
    payer_name = Column(String, nullable=True)
    claim_type = Column(String, nullable=True)
    service_date = Column(Date, nullable=True)
    claim_date = Column(Date, nullable=True)
    diagnosis_icd10 = Column(String, nullable=True)
    procedure_cpt = Column(String, nullable=True)
    
    billed_amount = Column(DECIMAL, nullable=True)
    allowed_amount = Column(DECIMAL, nullable=True)
    paid_amount = Column(DECIMAL, nullable=True)
    patient_responsibility = Column(DECIMAL, nullable=True)
    
    status = Column(String, nullable=False, default="Pending")
    prior_auth_required = Column(Boolean, default=False)
    coverage_type = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)


class FileAISummary(Base):
    __tablename__ = "file_ai_summaries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    medical_file_id = Column(UUID(as_uuid=True), ForeignKey("medical_files.id"), unique=True, nullable=False)
    
    overview = Column(Text, nullable=False)
    key_findings = Column(Text, nullable=False)
    model_name = Column(String, nullable=False)
    status = Column(String, nullable=False, default="Generated")
    
    generated_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
