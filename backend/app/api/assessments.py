from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.care_models import Assessment, AssessmentSymptom, AssessmentMedicalContext, AssessmentSafetyQuestion, CareRecommendation
from app.schemas.assessment import AssessmentCreate, AssessmentResponse, CareRecommendationResponse
from app.services.care_navigation import CareNavigationEngine
from uuid import UUID

router = APIRouter(prefix="/assessments", tags=["assessments"])

@router.post("/{patient_id}", response_model=AssessmentResponse)
def submit_assessment(patient_id: UUID, assessment_in: AssessmentCreate, db: Session = Depends(get_db)):
    
    # 1. Create Assessment
    assessment = Assessment(
        patient_id=patient_id,
        status="Submitted",
        primary_symptom=assessment_in.primary_symptom,
        duration=assessment_in.duration,
        severity=assessment_in.severity,
        worsening=assessment_in.worsening,
        additional_notes=assessment_in.additional_notes,
        medical_context_confirmed=assessment_in.medical_context_confirmed
    )
    db.add(assessment)
    db.flush()
    
    # 2. Add Symptoms
    for sym in assessment_in.additional_symptoms:
        db.add(AssessmentSymptom(
            assessment_id=assessment.id,
            symptom=sym.symptom,
            symptom_code=sym.symptom_code,
            selected=sym.selected
        ))
        
    # 3. Add Safety Questions
    for sq in assessment_in.safety_questions:
        db.add(AssessmentSafetyQuestion(
            assessment_id=assessment.id,
            question_code=sq.question_code,
            question_text=sq.question_text,
            answer=sq.answer
        ))
        
    # 4. Add Medical Context
    for mc in assessment_in.medical_context:
        db.add(AssessmentMedicalContext(
            assessment_id=assessment.id,
            context_type=mc.context_type,
            context_key=mc.context_key,
            context_value=mc.context_value,
            confirmed=mc.confirmed
        ))
        
    db.commit()
    db.refresh(assessment)
    
    # 5. Run Rules Engine to Generate Recommendation (Sync for now)
    # Ideally this would be an async background task or event queue
    try:
        from app.models.patient_models import PatientDataRecord
        # Get latest patient data record for context
        patient_data = db.query(PatientDataRecord).filter(PatientDataRecord.patient_id == patient_id).order_by(PatientDataRecord.hospital_visit_date.desc()).first()
        CareNavigationEngine.generate_recommendation(db, assessment, patient_data)
        
        assessment.status = "Completed"
        db.commit()
    except Exception as e:
        print(f"Error generating recommendation: {e}")
        # Keep status as Submitted
        
    return assessment

@router.get("/{assessment_id}/recommendation", response_model=CareRecommendationResponse)
def get_recommendation(assessment_id: UUID, db: Session = Depends(get_db)):
    rec = db.query(CareRecommendation).filter(CareRecommendation.assessment_id == assessment_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found or pending")
    return rec
