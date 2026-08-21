import csv
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.patient_models import (
    Patient, PatientDataRecord, PatientCondition, PatientMedication
)
from app.models.clinical_models import HealthcareEncounter, LabResult

def parse_date(date_str):
    if not date_str or date_str.lower() == 'null' or date_str == '':
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return None

def parse_float(val_str):
    if not val_str or val_str.lower() == 'null' or val_str == '':
        return None
    try:
        return float(val_str)
    except ValueError:
        return None

def parse_int(val_str, default=0):
    if not val_str or val_str.lower() == 'null' or val_str == '':
        return default
    try:
        return int(float(val_str))
    except ValueError:
        return default

def parse_bool(val_str):
    if not val_str or val_str.lower() == 'null' or val_str == '':
        return False
    return str(val_str).strip() == '1'

def import_csv_data(db: Session, csv_path: str):
    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        # Track imported patient IDs in this run to avoid duplicate synthetic profile creation later
        imported_patient_ids = set()
        
        for row in reader:
            source_patient_id = parse_int(row.get('patient_id', '0'))
            if not source_patient_id:
                continue
            
            patient_id_str = str(source_patient_id)
            
            # Upsert Patient
            patient = db.query(Patient).filter(Patient.patient_id == patient_id_str).first()
            if not patient:
                # Basic info first, synthetic info added by faker later
                patient = Patient(
                    patient_id=patient_id_str,
                    name=f"Patient {patient_id_str}", # Placeholder
                    age=parse_int(row.get('age')),
                    gender="Male" if parse_int(row.get('gender')) == 1 else "Female",
                    status="Active"
                )
                db.add(patient)
                db.flush()
            
            imported_patient_ids.add(patient.id)
            
            # Create Data Record Key to ensure idempotency
            encounter_date = parse_date(row.get('last_hospital_visit_date'))
            facility_name = row.get('recent_hospital_uuid', 'Unknown Facility')
            record_key = f"{patient_id_str}_{facility_name}_{encounter_date}"
            
            existing_record = db.query(PatientDataRecord).filter(PatientDataRecord.source_record_key == record_key).first()
            if existing_record:
                continue # Skip if already imported this exact row
            
            # Sentinel handling
            days_discharge = parse_int(row.get('days_since_last_discharge', '-1'), -1)
            if days_discharge in [999, 9999]:
                # Keep original numeric value in raw record if needed, but we map it explicitly when retrieving.
                pass
            
            data_record = PatientDataRecord(
                patient_id=patient.id,
                source_record_key=record_key,
                source_patient_id=source_patient_id,
                age=parse_int(row.get('age')),
                gender="Male" if parse_int(row.get('gender')) == 1 else "Female",
                
                history_diabetes=parse_bool(row.get('history_diabetes')),
                history_hypertension=parse_bool(row.get('history_hypertension')),
                history_heart_disease=parse_bool(row.get('history_heart_disease')),
                history_copd=parse_bool(row.get('history_copd')),
                history_asthma=parse_bool(row.get('history_asthma')),
                history_kidney_disease=parse_bool(row.get('history_kidney_disease')),
                history_stroke_or_tia=parse_bool(row.get('history_stroke_or_tia')),
                history_cancer=parse_bool(row.get('history_cancer')),
                
                facility_name=facility_name,
                hospital_visit_date=encounter_date,
                num_ed_visits_last_12m=parse_int(row.get('num_ed_visits_last_12m')),
                days_since_last_discharge=days_discharge,
                active_medication_count=parse_int(row.get('active_medication_count')),
                
                on_immunosuppressants=parse_bool(row.get('on_immunosuppressants')),
                on_blood_thinners=parse_bool(row.get('on_blood_thinners')),
                on_cardiac_meds=parse_bool(row.get('on_cardiac_meds')),
                on_insulin=parse_bool(row.get('on_insulin')),
                on_metformin=parse_bool(row.get('on_metformin')),
                on_albuterol_inhaler=parse_bool(row.get('on_albuterol_inhaler')),
                on_opioids=parse_bool(row.get('on_opioids')),
                
                last_lab_date=parse_date(row.get('last_lab_date')),
                fasting_glucose=parse_float(row.get('last_lab_fasting_glucose')),
                hba1c=parse_float(row.get('last_lab_hba1c')),
                systolic_bp=parse_float(row.get('last_lab_systolic_bp')),
                cholesterol_ldl=parse_float(row.get('last_lab_cholesterol_ldl')),
                bun=parse_float(row.get('last_lab_bun')),
                creatinine=parse_float(row.get('last_lab_creatinine'))
            )
            db.add(data_record)
            db.flush()

            # Create Conditions
            condition_map = {
                'history_diabetes': 'Diabetes',
                'history_hypertension': 'Hypertension',
                'history_heart_disease': 'Heart Disease',
                'history_copd': 'COPD',
                'history_asthma': 'Asthma',
                'history_kidney_disease': 'Kidney Disease',
                'history_stroke_or_tia': 'Stroke/TIA',
                'history_cancer': 'Cancer'
            }
            for col, name in condition_map.items():
                if parse_bool(row.get(col)):
                    exists = db.query(PatientCondition).filter_by(patient_id=patient.id, condition=name).first()
                    if not exists:
                        db.add(PatientCondition(patient_id=patient.id, condition=name, source_record_id=data_record.id))
            
            # Create Medications
            med_map = {
                'on_immunosuppressants': 'Immunosuppressants',
                'on_blood_thinners': 'Blood Thinners',
                'on_cardiac_meds': 'Cardiac Medication',
                'on_insulin': 'Insulin',
                'on_metformin': 'Metformin',
                'on_albuterol_inhaler': 'Albuterol Inhaler',
                'on_opioids': 'Opioids'
            }
            for col, name in med_map.items():
                if parse_bool(row.get(col)):
                    exists = db.query(PatientMedication).filter_by(patient_id=patient.id, medication_name=name).first()
                    if not exists:
                        db.add(PatientMedication(patient_id=patient.id, medication_name=name, source_record_id=data_record.id))
            
            # Create Encounter
            if encounter_date:
                is_emergency = "ER" in facility_name or "Emergency" in facility_name
                db.add(HealthcareEncounter(
                    patient_id=patient.id,
                    source_record_id=data_record.id,
                    encounter_type="Emergency" if is_emergency else "Clinic Visit",
                    facility_name=facility_name,
                    encounter_date=encounter_date,
                    is_emergency=is_emergency,
                    ed_visits_last_12m=parse_int(row.get('num_ed_visits_last_12m')),
                    days_since_last_discharge=days_discharge
                ))
            
            # Create Lab Result
            lab_date = parse_date(row.get('last_lab_date'))
            if lab_date:
                db.add(LabResult(
                    patient_id=patient.id,
                    source_record_id=data_record.id,
                    lab_date=lab_date,
                    fasting_glucose=parse_float(row.get('last_lab_fasting_glucose')),
                    hba1c=parse_float(row.get('last_lab_hba1c')),
                    systolic_bp=parse_float(row.get('last_lab_systolic_bp')),
                    cholesterol_ldl=parse_float(row.get('last_lab_cholesterol_ldl')),
                    bun=parse_float(row.get('last_lab_bun')),
                    creatinine=parse_float(row.get('last_lab_creatinine'))
                ))
                
        db.commit()
        return list(imported_patient_ids)
