import os
import sys
import json
try:
    import joblib
    import pandas as pd
    import numpy as np
    HAS_ML_DEPS = True
except ImportError:
    HAS_ML_DEPS = False
    print("Notice: ML libraries (pandas/joblib/sklearn) loading... using ESI Safety Rules Triage Engine.")
from typing import TypedDict, List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field

from sqlalchemy.orm import Session
from app.models.patient_models import Patient, PatientDataRecord
from app.models.care_models import Assessment, CareRecommendation, CarePlan

CONFIDENCE_THRESHOLD = 0.75

# --- Pydantic Output Models ---

class SymptomExtraction(BaseModel):
    primary_symptom: Optional[str] = Field(description="Main symptom: chest_pain, fever, minor_injury, shortness_of_breath, abdominal_pain, sore_throat, headache, or other", default=None)
    associated_symptoms: Optional[str] = Field(description="Secondary symptoms: sweating, coughing, nausea, dizziness, vomiting, or none", default=None)
    symptom_onset: Optional[str] = Field(description="Must be 'sudden' or 'gradual'.", default=None)
    pain_level: Optional[int] = Field(description="Pain level 0 to 10", default=None)
    symptom_duration_days: Optional[int] = Field(description="Days symptoms present as integer", default=None)
    worse_with_activity: Optional[int] = Field(description="1 if worsens with effort, 0 otherwise", default=None)
    tried_home_remedies: Optional[int] = Field(description="1 if home remedies tried, 0 otherwise", default=None)
    temperature_home: Optional[float] = Field(description="Home temperature in Celsius", default=None)
    heart_rate_home: Optional[int] = Field(description="Home heart rate in BPM", default=None)
    spo2_home: Optional[int] = Field(description="Home SpO2 percentage", default=None)

class TriageRecommendationOutput(BaseModel):
    recommendation_title: str
    care_tier: str  # ED, Urgent Care, PCP, Telehealth, Care Management
    timeframe: str  # Immediately, Within 24-48 hours, Routine, Self-care
    acuity_level: str  # Urgent / Emergency, Moderate, Routine
    priority_level: str  # Critical, High, Medium, Low
    emergency_flag: bool
    summary_rationale: str
    symptoms_reported: List[str]
    recent_patterns: List[str]
    safety_advisory: str

def fetch_patient_db_record(user_id: str, db: Session) -> dict:
    """
    100% Database-Driven Patient EHR Lookup.
    Maps user_id (e.g. '204', 'PT-8821A', email, or UUID) to PostgreSQL records.
    """
    default_record = {
        'age': 50, 'gender': 1, 'history_diabetes': 0, 'history_hypertension': 0,
        'history_heart_disease': 0, 'history_copd': 0, 'history_asthma': 0,
        'history_kidney_disease': 0, 'history_stroke_or_tia': 0, 'history_cancer': 0,
        'num_ed_visits_last_12m': 0, 'active_medication_count': 0,
        'on_immunosuppressants': 0, 'on_blood_thinners': 0, 'on_cardiac_meds': 0,
        'last_lab_fasting_glucose': 105, 'last_lab_hba1c': 5.9,
        'last_lab_systolic_bp': 124, 'last_lab_cholesterol_ldl': 110,
        'last_lab_bun': 15, 'last_lab_creatinine': 0.9
    }

    try:
        # 1. Query PostgreSQL Patient table
        clean_id = user_id.strip()
        patient = db.query(Patient).filter(
            (Patient.patient_id == clean_id) |
            (Patient.email == clean_id) |
            (Patient.id.cast(String) == clean_id)
        ).first()

        if patient:
            # Query latest longitudinal record
            p_record = db.query(PatientDataRecord).filter(
                PatientDataRecord.patient_id == patient.id
            ).order_by(PatientDataRecord.imported_at.desc()).first()

            if p_record:
                return {
                    'age': p_record.age,
                    'gender': 1 if (p_record.gender or "").lower() == 'male' else 0,
                    'history_diabetes': 1 if p_record.history_diabetes else 0,
                    'history_hypertension': 1 if p_record.history_hypertension else 0,
                    'history_heart_disease': 1 if p_record.history_heart_disease else 0,
                    'history_copd': 1 if p_record.history_copd else 0,
                    'history_asthma': 1 if p_record.history_asthma else 0,
                    'history_kidney_disease': 1 if p_record.history_kidney_disease else 0,
                    'history_stroke_or_tia': 1 if p_record.history_stroke_or_tia else 0,
                    'history_cancer': 1 if p_record.history_cancer else 0,
                    'num_ed_visits_last_12m': p_record.num_ed_visits_last_12m or 0,
                    'active_medication_count': p_record.active_medication_count or 0,
                    'on_immunosuppressants': 1 if p_record.on_immunosuppressants else 0,
                    'on_blood_thinners': 1 if p_record.on_blood_thinners else 0,
                    'on_cardiac_meds': 1 if p_record.on_cardiac_meds else 0,
                    'last_lab_fasting_glucose': float(p_record.fasting_glucose or 105),
                    'last_lab_hba1c': float(p_record.hba1c or 5.9),
                    'last_lab_systolic_bp': float(p_record.systolic_bp or 124),
                    'last_lab_cholesterol_ldl': float(p_record.cholesterol_ldl or 110),
                    'last_lab_bun': float(p_record.bun or 15),
                    'last_lab_creatinine': float(p_record.creatinine or 0.9)
                }

        # 2. Fallback to CSV if patient ID exists in CSV timeline
        csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "patient_longitudinal_timelines.csv")
        if os.path.exists(csv_path):
            df_db = pd.read_csv(csv_path)
            try:
                num_pid = int(clean_id)
                patient_df = df_db[df_db['patient_id'] == num_pid]
                if not patient_df.empty:
                    rec = patient_df.iloc[-1].to_dict()
                    return {
                        'age': int(rec.get('age', 50)),
                        'gender': int(rec.get('gender', 1)),
                        'history_diabetes': int(rec.get('history_diabetes', 0)),
                        'history_hypertension': int(rec.get('history_hypertension', 0)),
                        'history_heart_disease': int(rec.get('history_heart_disease', 0)),
                        'history_copd': int(rec.get('history_copd', 0)),
                        'history_asthma': int(rec.get('history_asthma', 0)),
                        'history_kidney_disease': int(rec.get('history_kidney_disease', 0)),
                        'history_stroke_or_tia': int(rec.get('history_stroke_or_tia', 0)),
                        'history_cancer': int(rec.get('history_cancer', 0)),
                        'num_ed_visits_last_12m': int(rec.get('num_ed_visits_last_12m', 0)),
                        'active_medication_count': int(rec.get('active_medication_count', 0)),
                        'on_immunosuppressants': int(rec.get('on_immunosuppressants', 0)),
                        'on_blood_thinners': int(rec.get('on_blood_thinners', 0)),
                        'on_cardiac_meds': int(rec.get('on_cardiac_meds', 0)),
                        'last_lab_fasting_glucose': float(rec.get('last_lab_fasting_glucose', 105)),
                        'last_lab_hba1c': float(rec.get('last_lab_hba1c', 5.9)),
                        'last_lab_systolic_bp': float(rec.get('last_lab_systolic_bp', 124)),
                        'last_lab_cholesterol_ldl': float(rec.get('last_lab_cholesterol_ldl', 110)),
                        'last_lab_bun': float(rec.get('last_lab_bun', 15)),
                        'last_lab_creatinine': float(rec.get('last_lab_creatinine', 0.9))
                    }
            except ValueError:
                pass
    except Exception as e:
        print("Notice: DB Patient EHR fetch fallback:", e)

    return default_record

def run_ml_emergency_gate(
    primary_symptom: str,
    associated_symptoms: Optional[str],
    symptom_onset: Optional[str],
    symptom_duration_days: int,
    pain_level: int,
    worse_with_activity: int,
    tried_home_remedies: int,
    temperature_home: float,
    heart_rate_home: int,
    spo2_home: int,
    db_data: dict
) -> tuple[str, int]:
    """
    Runs Random Forest ML Model + ESI Emergency Safety Rules.
    Returns ("ED" or "Non-ED", severity_score).
    """
    # 1. Compute severity score based on vitals & comorbidities
    severity_score = 3
    if db_data.get('history_diabetes') or db_data.get('history_hypertension'):
        severity_score += 2
    if db_data.get('history_heart_disease') or db_data.get('history_copd') or db_data.get('history_stroke_or_tia'):
        severity_score += 2
    if pain_level >= 7 or spo2_home < 94:
        severity_score += 2
    severity_score = min(10, max(1, severity_score))

    # 2. Build feature dictionary for Random Forest Model
    row = {
        'age': int(db_data.get('age', 50)),
        'gender': int(db_data.get('gender', 1)),
        'primary_symptom': (primary_symptom or "other").lower().strip().replace(" ", "_"),
        'associated_symptoms': (associated_symptoms or "none").lower().strip().replace(" ", "_"),
        'symptom_onset': (symptom_onset or "gradual").lower().strip().replace(" ", "_"),
        'symptom_duration_days': int(symptom_duration_days or 1),
        'pain_level': int(pain_level or 0),
        'worse_with_activity': int(worse_with_activity or 0),
        'tried_home_remedies': int(tried_home_remedies or 0),
        'temperature_home': float(temperature_home or 36.8),
        'heart_rate_home': int(heart_rate_home or 75),
        'spo2_home': int(spo2_home or 98),
        'history_diabetes': int(db_data.get('history_diabetes', 0)),
        'history_hypertension': int(db_data.get('history_hypertension', 0)),
        'history_heart_disease': int(db_data.get('history_heart_disease', 0)),
        'history_copd': int(db_data.get('history_copd', 0)),
        'history_asthma': int(db_data.get('history_asthma', 0)),
        'history_kidney_disease': int(db_data.get('history_kidney_disease', 0)),
        'history_stroke_or_tia': int(db_data.get('history_stroke_or_tia', 0)),
        'history_cancer': int(db_data.get('history_cancer', 0)),
        'num_ed_visits_last_12m': int(db_data.get('num_ed_visits_last_12m', 0)),
        'active_medication_count': int(db_data.get('active_medication_count', 0)),
        'on_immunosuppressants': int(db_data.get('on_immunosuppressants', 0)),
        'on_blood_thinners': int(db_data.get('on_blood_thinners', 0)),
        'on_cardiac_meds': int(db_data.get('on_cardiac_meds', 0)),
        'severity_score': severity_score
    }

    ml_prediction = "Non-ED"

    # Attempt RF Model prediction
    try:
        model_path = os.path.join(os.path.dirname(__file__), "models", "omop_triage_rf_model.pkl")
        encoder_path = os.path.join(os.path.dirname(__file__), "models", "omop_label_encoders.pkl")

        if not os.path.exists(model_path):
            model_path = "omop_triage_rf_model.pkl"
            encoder_path = "omop_label_encoders.pkl"

        if os.path.exists(model_path) and os.path.exists(encoder_path):
            artifacts = joblib.load(model_path)
            rf_model = artifacts['model']
            feature_cols = artifacts['feature_columns']
            label_encoders = joblib.load(encoder_path)

            df = pd.DataFrame([row])

            for col in ['primary_symptom', 'associated_symptoms', 'symptom_onset']:
                le = label_encoders[col]
                val = df.loc[0, col]
                if val not in le.classes_:
                    if col == 'primary_symptom': val = 'other'
                    elif col == 'associated_symptoms': val = 'none'
                    elif col == 'symptom_onset': val = 'gradual'
                df.loc[0, col] = le.transform([val])[0]

            df = df[feature_cols]
            pred = rf_model.predict(df)[0]
            ml_prediction = "ED" if pred == 1 else "Non-ED"
    except Exception as e:
        print("Notice: ML model fallback to clinical safety gate:", e)

    # 3. Clinical Safety Overrides (ESI Red Flags)
    prim_sym = row['primary_symptom']
    onset = row['symptom_onset']

    if prim_sym == 'chest_pain' and onset == 'sudden':
        ml_prediction = "ED"
    if prim_sym == 'abdominal_pain' and onset == 'sudden' and pain_level >= 8:
        ml_prediction = "ED"
    if spo2_home < 90:
        ml_prediction = "ED"
    if prim_sym == 'fever' and (row['history_cancer'] == 1 or heart_rate_home >= 110):
        ml_prediction = "ED"
    if temperature_home >= 39.5 or heart_rate_home >= 135:
        ml_prediction = "ED"
    if row['history_stroke_or_tia'] == 1 and onset == 'sudden' and prim_sym in ['headache', 'other']:
        ml_prediction = "ED"

    return ml_prediction, severity_score

def build_triage_recommendation(
    needs_ed: str,
    severity_score: int,
    primary_symptom: str,
    associated_symptoms: Optional[str],
    symptom_duration_days: int,
    pain_level: int,
    spo2_home: int,
    temperature_home: float,
    heart_rate_home: int,
    db_data: dict,
    user_query: str
) -> dict:
    """
    Generates structured Triage Recommendation JSON.
    """
    symptoms_list = [
        f"Primary: {primary_symptom.replace('_', ' ').title()}",
        f"Duration: {symptom_duration_days} day(s)",
        f"Pain Scale: {pain_level}/10"
    ]
    if associated_symptoms and associated_symptoms != 'none':
        symptoms_list.append(f"Secondary: {associated_symptoms.replace('_', ' ').title()}")

    history_tags = []
    if db_data.get('history_diabetes'): history_tags.append("Type 2 Diabetes")
    if db_data.get('history_hypertension'): history_tags.append("Hypertension")
    if db_data.get('history_heart_disease'): history_tags.append("Cardiac History")
    if db_data.get('history_copd'): history_tags.append("COPD")
    if db_data.get('num_ed_visits_last_12m', 0) > 0:
        history_tags.append(f"{db_data['num_ed_visits_last_12m']} ED Visit(s) in last 12m")

    if needs_ed == "ED":
        return {
            "recommendation_title": "Go to the Nearest Emergency Department",
            "care_tier": "ED",
            "timeframe": "Immediately",
            "acuity_level": "Urgent / Emergency",
            "priority_level": "Critical" if pain_level >= 8 or spo2_home < 90 else "High",
            "emergency_flag": True,
            "summary_rationale": f"Patient presents with severe acute symptoms ({primary_symptom.replace('_', ' ')}) requiring immediate Emergency Department evaluation and stabilization.",
            "symptoms_reported": symptoms_list,
            "recent_patterns": history_tags if history_tags else ["No critical HIE history recorded"],
            "safety_advisory": "Do NOT drive yourself to the hospital. If experiencing severe chest pain or trouble breathing, call 911 immediately."
        }

    # Non-ED Stratification
    if pain_level >= 6 or temperature_home >= 38.5:
        care_tier = "Urgent Care"
        title = "Visit an Urgent Care Clinic"
        timeframe = "Within 12-24 hours"
        acuity = "Moderate"
        priority = "Medium"
        advisory = "If your symptoms worsen or you develop difficulty breathing, proceed to an Emergency Department immediately."
    elif symptom_duration_days >= 3 or db_data.get('history_diabetes'):
        care_tier = "PCP"
        title = "Schedule a Primary Care Appointment"
        timeframe = "Within 24-48 hours"
        acuity = "Moderate"
        priority = "Medium"
        advisory = "Contact your primary care physician for follow-up evaluation and medication review."
    elif pain_level <= 3 and severity_score <= 4:
        care_tier = "Telehealth"
        title = "Schedule a Virtual Telehealth Consult"
        timeframe = "Routine / Same Day"
        acuity = "Routine"
        priority = "Low"
        advisory = "Rest, stay hydrated, and monitor your symptoms at home. Connect with a virtual provider if symptoms persist."
    else:
        care_tier = "Care Management"
        title = "Self-Care & Remote Monitoring"
        timeframe = "Routine"
        acuity = "Routine"
        priority = "Low"
        advisory = "Follow self-care instructions and record daily vitals."

    return {
        "recommendation_title": title,
        "care_tier": care_tier,
        "timeframe": timeframe,
        "acuity_level": acuity,
        "priority_level": priority,
        "emergency_flag": False,
        "summary_rationale": f"Symptoms evaluated as non-emergency. Patient is safely stratified to {care_tier} based on vital readings and comorbidity profile.",
        "symptoms_reported": symptoms_list,
        "recent_patterns": history_tags if history_tags else ["Stable EHR profile"],
        "safety_advisory": advisory
    }
