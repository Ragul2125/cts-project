from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.models.patient_models import Patient, PatientCondition, PatientMedication, PatientAllergy, PatientDataRecord, PatientPreference, EmergencyContact
from app.models.clinical_models import MedicalFile, FileAISummary
from app.models.care_models import CarePlan, PatientActivityLog, Assessment, CareRecommendation
from app.schemas.patient import PatientResponse, PatientDashboardResponse

router = APIRouter(prefix="/patients", tags=["patients"])

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: str, db: Session = Depends(get_db)):
    try:
        uid = UUID(patient_id)
        patient = db.query(Patient).filter(Patient.id == uid).first()
    except ValueError:
        patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
        
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.get("/{patient_id}/dashboard", response_model=PatientDashboardResponse)
def get_patient_dashboard(patient_id: str, db: Session = Depends(get_db)):
    patient = get_patient(patient_id, db)
    
    conditions = db.query(PatientCondition).filter(PatientCondition.patient_id == patient.id).all()
    medications = db.query(PatientMedication).filter(PatientMedication.patient_id == patient.id, PatientMedication.active == True).all()
    allergies = db.query(PatientAllergy).filter(PatientAllergy.patient_id == patient.id, PatientAllergy.active == True).all()
    
    files_count = db.query(MedicalFile).filter(MedicalFile.patient_id == patient.id).count()
    active_plan = db.query(CarePlan).filter(CarePlan.patient_id == patient.id, CarePlan.active == True).first()

    latest_data_record = db.query(PatientDataRecord).filter(PatientDataRecord.patient_id == patient.id).order_by(PatientDataRecord.hospital_visit_date.desc()).first()

    ed_visits = latest_data_record.num_ed_visits_last_12m if latest_data_record else 1
    days_discharge = latest_data_record.days_since_last_discharge if (latest_data_record and latest_data_record.days_since_last_discharge is not None) else 14

    activity_logs = db.query(PatientActivityLog).filter(PatientActivityLog.patient_id == patient.id).order_by(PatientActivityLog.activity_date.desc()).limit(5).all()

    recent_activity_items = [
        {
            "id": str(log.id),
            "title": log.title,
            "description": log.description or "Patient activity recorded",
            "time": log.activity_date.strftime("%d %b %H:%M") if log.activity_date else "Recently",
            "type": log.activity_type
        } for log in activity_logs
    ]

    if not recent_activity_items:
        # Pull from latest assessment or care plan if log table empty
        latest_assessment = db.query(Assessment).filter(Assessment.patient_id == patient.id).order_by(Assessment.created_at.desc()).first()
        if latest_assessment:
            recent_activity_items.append({
                "id": str(latest_assessment.id),
                "title": f"{latest_assessment.primary_symptom} Assessment Submitted",
                "description": f"Status: {latest_assessment.status} | Severity {latest_assessment.severity}/10",
                "time": latest_assessment.created_at.strftime("%d %b") if latest_assessment.created_at else "Recently",
                "type": "assessment"
            })

    return {
        "patient": {
            "id": str(patient.id),
            "patient_id": patient.patient_id,
            "name": patient.name,
            "age": patient.age,
            "gender": patient.gender,
            "blood_group": patient.blood_group,
            "phone": patient.phone,
            "email": patient.email,
            "address": patient.address
        },
        "health_summary": {
            "conditions": [c.condition for c in conditions],
            "medications": [m.medication_name for m in medications],
            "allergies": [a.allergen for a in allergies]
        },
        "utilization": {
            "ed_visits_last_12m": ed_visits,
            "days_since_discharge": days_discharge
        },
        "active_care_plan": {
            "id": str(active_plan.id),
            "title": active_plan.title,
            "category": active_plan.category
        } if active_plan else None,
        "medical_file_count": files_count,
        "recent_activity": recent_activity_items
    }

@router.get("/{patient_id}/files")
def get_patient_medical_files(patient_id: str, db: Session = Depends(get_db)):
    patient = get_patient(patient_id, db)
    files = db.query(MedicalFile).filter(MedicalFile.patient_id == patient.id).order_by(MedicalFile.uploaded_at.desc()).all()
    
    result = []
    for f in files:
        summary = db.query(FileAISummary).filter(FileAISummary.medical_file_id == f.id).first()
        result.append({
            "id": str(f.id),
            "name": f.name,
            "category": f.category,
            "file_type": f.file_type,
            "file_size": f.file_size,
            "document_date": f.document_date.isoformat() if f.document_date else None,
            "uploaded_at": f.uploaded_at.isoformat() if f.uploaded_at else None,
            "summary": {
                "overview": summary.overview,
                "key_findings": summary.key_findings,
                "model_name": summary.model_name
            } if summary else None
        })
    return result

@router.get("/{patient_id}/history")
def get_patient_history(patient_id: str, db: Session = Depends(get_db)):
    patient = get_patient(patient_id, db)
    
    history_items = []

    # 1. Patient Data Records (Encounters / Facility Visits)
    data_records = db.query(PatientDataRecord).filter(PatientDataRecord.patient_id == patient.id).order_by(PatientDataRecord.hospital_visit_date.desc()).all()
    for rec in data_records:
        history_items.append({
            "id": str(rec.id),
            "type": "Encounter",
            "title": f"Hospital Visit - {rec.facility_name}",
            "providerOrLocation": rec.facility_name,
            "date": rec.hospital_visit_date.strftime("%d %b %Y") if rec.hospital_visit_date else "Recorded",
            "symptoms": [f"ED Visits Last 12m: {rec.num_ed_visits_last_12m}"],
            "recommendation": f"Discharge followup (Days since last discharge: {rec.days_since_last_discharge or 'N/A'})",
            "status": "Completed",
            "notes": f"Vitals on visit: BP {rec.systolic_bp or '120'}/80 mmHg, Glucose {rec.fasting_glucose or '100'} mg/dL, HbA1c {rec.hba1c or '5.7'}"
        })

    # 2. Assessments
    assessments = db.query(Assessment).filter(Assessment.patient_id == patient.id).order_by(Assessment.created_at.desc()).all()
    for asm in assessments:
        rec = db.query(CareRecommendation).filter(CareRecommendation.assessment_id == asm.id).first()
        history_items.append({
            "id": str(asm.id),
            "type": "Assessment",
            "title": f"{asm.primary_symptom} Assessment",
            "providerOrLocation": "CarePath AI Triage",
            "date": asm.created_at.strftime("%d %b %Y") if asm.created_at else "Recently",
            "symptoms": [f"Primary: {asm.primary_symptom}", f"Duration: {asm.duration}", f"Severity: {asm.severity}/10"],
            "recommendation": rec.title if rec else "Primary Care Follow-up",
            "status": asm.status,
            "notes": rec.explanation if rec else (asm.additional_notes or "Triage completed")
        })

    return history_items

@router.get("/{patient_id}/full-profile")
def get_patient_full_profile(patient_id: str, db: Session = Depends(get_db)):
    patient = get_patient(patient_id, db)
    
    conditions = db.query(PatientCondition).filter(PatientCondition.patient_id == patient.id).all()
    medications = db.query(PatientMedication).filter(PatientMedication.patient_id == patient.id).all()
    allergies = db.query(PatientAllergy).filter(PatientAllergy.patient_id == patient.id).all()
    contacts = db.query(EmergencyContact).filter(EmergencyContact.patient_id == patient.id).all()
    preferences = db.query(PatientPreference).filter(PatientPreference.patient_id == patient.id).first()
    latest_rec = db.query(PatientDataRecord).filter(PatientDataRecord.patient_id == patient.id).order_by(PatientDataRecord.hospital_visit_date.desc()).first()

    return {
        "id": str(patient.id),
        "patient_id": patient.patient_id,
        "name": patient.name,
        "date_of_birth": patient.date_of_birth.isoformat() if patient.date_of_birth else None,
        "age": patient.age,
        "gender": patient.gender,
        "blood_group": patient.blood_group,
        "phone": patient.phone,
        "email": patient.email,
        "address": patient.address,
        "vitals": {
            "systolic_bp": str(latest_rec.systolic_bp) if (latest_rec and latest_rec.systolic_bp) else "120",
            "glucose": str(latest_rec.fasting_glucose) if (latest_rec and latest_rec.fasting_glucose) else "98",
            "hba1c": str(latest_rec.hba1c) if (latest_rec and latest_rec.hba1c) else "5.6",
            "ldl": str(latest_rec.cholesterol_ldl) if (latest_rec and latest_rec.cholesterol_ldl) else "110"
        },
        "conditions": [{
            "id": str(c.id),
            "name": c.condition,
            "status": c.status,
            "first_seen_date": c.first_seen_date.isoformat() if c.first_seen_date else None
        } for c in conditions],
        "medications": [{
            "id": str(m.id),
            "name": m.medication_name,
            "active": m.active
        } for m in medications],
        "allergies": [{
            "id": str(a.id),
            "name": a.allergen,
            "reaction": a.reaction,
            "severity": a.severity,
            "active": a.active
        } for a in allergies],
        "emergency_contacts": [{
            "id": str(ec.id),
            "name": ec.name,
            "relationship": ec.relationship,
            "phone": ec.phone
        } for ec in contacts],
        "preferences": {
            "ai_data_analysis": preferences.ai_data_analysis if preferences else True,
            "share_with_specialists": preferences.share_with_specialists if preferences else False,
            "communication_preference": preferences.communication_preference if preferences else "Email"
        }
    }
