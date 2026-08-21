from sqlalchemy import Column, String, Boolean, DateTime, Date, Integer, ForeignKey, Text, DECIMAL
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.models.auth_models import utcnow
from app.core.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    date_of_birth = Column(Date, nullable=True)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    blood_group = Column(String, nullable=True)
    status = Column(String, nullable=False, default="Active")
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

class PatientDataRecord(Base):
    __tablename__ = "patient_data_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), index=True, nullable=False)
    source_record_key = Column(String, unique=True, index=True, nullable=False)
    source_patient_id = Column(Integer, nullable=False)
    
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)

    history_diabetes = Column(Boolean, default=False)
    history_hypertension = Column(Boolean, default=False)
    history_heart_disease = Column(Boolean, default=False)
    history_copd = Column(Boolean, default=False)
    history_asthma = Column(Boolean, default=False)
    history_kidney_disease = Column(Boolean, default=False)
    history_stroke_or_tia = Column(Boolean, default=False)
    history_cancer = Column(Boolean, default=False)

    facility_name = Column(String, nullable=False)
    hospital_visit_date = Column(Date, nullable=False)
    num_ed_visits_last_12m = Column(Integer, default=0)
    days_since_last_discharge = Column(Integer, nullable=True)
    active_medication_count = Column(Integer, default=0)

    on_immunosuppressants = Column(Boolean, default=False)
    on_blood_thinners = Column(Boolean, default=False)
    on_cardiac_meds = Column(Boolean, default=False)
    on_insulin = Column(Boolean, default=False)
    on_metformin = Column(Boolean, default=False)
    on_albuterol_inhaler = Column(Boolean, default=False)
    on_opioids = Column(Boolean, default=False)

    last_lab_date = Column(Date, nullable=True)
    fasting_glucose = Column(DECIMAL, nullable=True)
    hba1c = Column(DECIMAL, nullable=True)
    systolic_bp = Column(DECIMAL, nullable=True)
    cholesterol_ldl = Column(DECIMAL, nullable=True)
    bun = Column(DECIMAL, nullable=True)
    creatinine = Column(DECIMAL, nullable=True)

    imported_at = Column(DateTime, default=utcnow)

class PatientCondition(Base):
    __tablename__ = "patient_conditions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    condition = Column(String, nullable=False)
    status = Column(String, nullable=False, default="Active")
    first_seen_date = Column(Date, nullable=True)
    last_seen_date = Column(Date, nullable=True)
    source_record_id = Column(UUID(as_uuid=True), ForeignKey("patient_data_records.id"), nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

class PatientAllergy(Base):
    __tablename__ = "patient_allergies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    allergen = Column(String, nullable=False)
    reaction = Column(String, nullable=True)
    severity = Column(String, nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

class PatientMedication(Base):
    __tablename__ = "patient_medications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    medication_name = Column(String, nullable=False)
    medication_code = Column(String, nullable=True)
    active = Column(Boolean, default=True)
    first_seen_date = Column(Date, nullable=True)
    last_seen_date = Column(Date, nullable=True)
    source_record_id = Column(UUID(as_uuid=True), ForeignKey("patient_data_records.id"), nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

class PatientPreference(Base):
    __tablename__ = "patient_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), unique=True, nullable=False)
    ai_data_analysis = Column(Boolean, default=True)
    share_with_specialists = Column(Boolean, default=False)
    communication_preference = Column(String, default="Email")
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    name = Column(String, nullable=False)
    relationship = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=True)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
