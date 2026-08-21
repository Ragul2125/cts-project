import os
import sys
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import uuid

# Add the backend root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.models.patient_models import Patient, PatientDataRecord
from app.models.clinical_models import HealthcareEncounter, LabResult, Claim, PatientProcedure
from app.models.provider_models import Hospital, Provider

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def map_boolean(val):
    if pd.isna(val):
        return False
    val_str = str(val).lower().strip()
    return val_str in ['1', 'true', 'yes', 't', 'y']

def map_date(val):
    if pd.isna(val) or str(val).strip() == '':
        return None
    return pd.to_datetime(val).date()

def map_numeric(val):
    if pd.isna(val) or str(val).strip() == '':
        return None
    return float(val)

def seed_data():
    db = SessionLocal()
    
    # 1. Clear existing transactional data (Keep users)
    print("Clearing existing mock data...")
    from sqlalchemy import text
    try:
        from app.models.clinical_models import Base
        
        # Get all table names in dependency order (reversed for deletion)
        tables = reversed(Base.metadata.sorted_tables)
        
        for table in tables:
            # We want to keep the users table
            if table.name not in ["users", "alembic_version"]:
                db.execute(table.delete())
                
        db.commit()
    except Exception as e:
        print(f"Error clearing data: {e}")
        db.rollback()

    base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    # Read CSVs
    patient_df = pd.read_csv(os.path.join(base_path, 'patient.csv'))
    hospital_df = pd.read_csv(os.path.join(base_path, 'hospital.csv'))
    cms_df = pd.read_csv(os.path.join(base_path, 'cms.csv'))

    # Dictionaries to keep track of UUIDs mapped to CSV IDs
    patient_uuid_map = {}
    encounter_uuid_map = {}
    hospital_uuid_map = {}
    provider_uuid_map = {}

    print(f"Seeding {len(patient_df)} patients...")
    for _, row in patient_df.iterrows():
        p_id = str(row['patient_id'])
        gender_str = "Male" if str(row['gender']) == "1" else "Female" if str(row['gender']) == "2" else "Other"
        
        if p_id not in patient_uuid_map:
            patient = Patient(
                patient_id=p_id,
                name=f"Patient {p_id}",
                age=int(row['age']),
                gender=gender_str,
                status="Active"
            )
            db.add(patient)
            db.flush()
            patient_uuid_map[p_id] = patient.id
        
        pat_uuid = patient_uuid_map[p_id]

        # Insert PatientDataRecord
        pdr = PatientDataRecord(
            patient_id=pat_uuid,
            source_record_key=f"PDR-{uuid.uuid4().hex[:8]}",
            source_patient_id=int(p_id),
            age=int(row['age']),
            gender=gender_str,
            history_diabetes=map_boolean(row['history_diabetes']),
            history_hypertension=map_boolean(row['history_hypertension']),
            history_heart_disease=map_boolean(row['history_heart_disease']),
            history_copd=map_boolean(row['history_copd']),
            history_asthma=map_boolean(row['history_asthma']),
            history_kidney_disease=map_boolean(row['history_kidney_disease']),
            history_stroke_or_tia=map_boolean(row['history_stroke_or_tia']),
            history_cancer=map_boolean(row['history_cancer']),
            facility_name=str(row['recent_facility_name']),
            hospital_visit_date=map_date(row['last_hospital_visit_date']),
            num_ed_visits_last_12m=int(row['num_ed_visits_last_12m']) if not pd.isna(row['num_ed_visits_last_12m']) else 0,
            days_since_last_discharge=int(row['days_since_last_discharge']) if not pd.isna(row['days_since_last_discharge']) else None,
            active_medication_count=int(row['active_medication_count']) if not pd.isna(row['active_medication_count']) else 0,
            on_immunosuppressants=map_boolean(row['on_immunosuppressants']),
            on_blood_thinners=map_boolean(row['on_blood_thinners']),
            on_cardiac_meds=map_boolean(row['on_cardiac_meds']),
            on_insulin=map_boolean(row['on_insulin']),
            on_metformin=map_boolean(row['on_metformin']),
            on_albuterol_inhaler=map_boolean(row['on_albuterol_inhaler']),
            on_opioids=map_boolean(row['on_opioids']),
            last_lab_date=map_date(row['last_lab_date']),
            fasting_glucose=map_numeric(row.get('last_lab_fasting_glucose')),
            hba1c=map_numeric(row.get('last_lab_hba1c')),
            systolic_bp=map_numeric(row.get('last_lab_systolic_bp')),
            cholesterol_ldl=map_numeric(row.get('last_lab_cholesterol_ldl')),
            bun=map_numeric(row.get('last_lab_bun')),
            creatinine=map_numeric(row.get('last_lab_creatinine'))
        )
        db.add(pdr)

    db.commit()

    print(f"Seeding {len(hospital_df)} hospital visits...")
    for _, row in hospital_df.iterrows():
        hosp_name = str(row['hospital_name'])
        if hosp_name not in hospital_uuid_map:
            hosp = Hospital(name=hosp_name, facility_type="General", status="Active")
            db.add(hosp)
            db.flush()
            hospital_uuid_map[hosp_name] = hosp.id

        prov_name = str(row['attending_provider'])
        if prov_name not in provider_uuid_map and not pd.isna(row['attending_provider']):
            prov = Provider(name=prov_name, provider_type="Attending", specialty="General Practice", facility_name=hosp_name, status="Active")
            db.add(prov)
            db.flush()
            provider_uuid_map[prov_name] = prov.id

        p_id = str(row['patient_id'])
        pat_uuid = patient_uuid_map.get(p_id)
        
        if not pat_uuid:
            continue

        visit_id = str(row['visit_id'])
        enc = HealthcareEncounter(
            patient_id=pat_uuid,
            provider_id=provider_uuid_map.get(prov_name),
            encounter_type=str(row['encounter_type']),
            facility_name=hosp_name,
            encounter_date=map_date(row['admission_date']),
            discharge_date=map_date(row['discharge_date']),
            status=str(row.get('discharge_status', 'Completed')),
            is_emergency=map_boolean(row['is_emergency_visit']),
            ed_visits_last_12m=int(row['ed_visits_last_12m']) if not pd.isna(row['ed_visits_last_12m']) else 0,
            days_since_last_discharge=int(row['days_since_last_discharge']) if not pd.isna(row['days_since_last_discharge']) else None,
            primary_diagnosis=str(row['primary_diagnosis']) if not pd.isna(row['primary_diagnosis']) else None,
            icd10_code=str(row['diagnosis_icd10']) if not pd.isna(row['diagnosis_icd10']) else None
        )
        db.add(enc)
        db.flush()
        encounter_uuid_map[visit_id] = enc.id

        # Insert Lab Result if present
        if not pd.isna(row['lab_date']):
            lab = LabResult(
                patient_id=pat_uuid,
                lab_date=map_date(row['lab_date']),
                fasting_glucose=map_numeric(row.get('fasting_glucose')),
                hba1c=map_numeric(row.get('hba1c')),
                systolic_bp=map_numeric(row.get('systolic_bp')),
                cholesterol_ldl=map_numeric(row.get('cholesterol_ldl')),
                bun=map_numeric(row.get('bun')),
                creatinine=map_numeric(row.get('creatinine'))
            )
            db.add(lab)
            
        # Insert Procedure if present
        if not pd.isna(row['procedure_performed']):
            proc = PatientProcedure(
                patient_id=pat_uuid,
                encounter_id=enc.id,
                procedure_name=str(row['procedure_performed']),
                cpt_code=str(row['procedure_cpt']) if not pd.isna(row['procedure_cpt']) else None,
                procedure_date=map_date(row['admission_date'])
            )
            db.add(proc)

    db.commit()

    print(f"Seeding {len(cms_df)} claims...")
    for _, row in cms_df.iterrows():
        p_id = str(row['patient_id'])
        pat_uuid = patient_uuid_map.get(p_id)
        if not pat_uuid:
            continue
            
        visit_id = str(row['visit_id'])
        enc_uuid = encounter_uuid_map.get(visit_id)
        
        claim = Claim(
            claim_id=str(row['claim_id']),
            patient_id=pat_uuid,
            encounter_id=enc_uuid,
            payer_name=str(row['payer_name']) if not pd.isna(row['payer_name']) else None,
            claim_type=str(row['claim_type']) if not pd.isna(row['claim_type']) else None,
            service_date=map_date(row['service_date']),
            claim_date=map_date(row['claim_date']),
            diagnosis_icd10=str(row['diagnosis_icd10']) if not pd.isna(row['diagnosis_icd10']) else None,
            procedure_cpt=str(row['procedure_cpt']) if not pd.isna(row['procedure_cpt']) else None,
            billed_amount=map_numeric(row['billed_amount']),
            allowed_amount=map_numeric(row['allowed_amount']),
            paid_amount=map_numeric(row['paid_amount']),
            patient_responsibility=map_numeric(row['patient_responsibility']),
            status=str(row['claim_status']) if not pd.isna(row['claim_status']) else 'Pending',
            prior_auth_required=map_boolean(row['prior_authorization_required']),
            coverage_type=str(row['coverage_type']) if not pd.isna(row['coverage_type']) else None
        )
        db.add(claim)

    db.commit()
    print("Seed complete!")

if __name__ == "__main__":
    from app.models.clinical_models import Base
    # Add missing columns to existing tables since create_all doesn't alter tables
    try:
        with engine.begin() as conn:
            from sqlalchemy import text
            conn.execute(text("ALTER TABLE healthcare_encounters ADD COLUMN IF NOT EXISTS discharge_date DATE;"))
            conn.execute(text("ALTER TABLE healthcare_encounters ADD COLUMN IF NOT EXISTS primary_diagnosis VARCHAR;"))
            conn.execute(text("ALTER TABLE healthcare_encounters ADD COLUMN IF NOT EXISTS icd10_code VARCHAR;"))
    except Exception as e:
        print(f"Schema alter ignored: {e}")
        
    # Create the newly added tables (like claims, patient_procedures)
    Base.metadata.create_all(bind=engine)
    seed_data()
