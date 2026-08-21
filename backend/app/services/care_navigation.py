from sqlalchemy.orm import Session
from app.models.care_models import Assessment, CareRecommendation, AssessmentSymptom, AssessmentMedicalContext
from app.models.patient_models import PatientDataRecord
from datetime import datetime

class CareNavigationEngine:
    """
    A prototype rules engine that simulates AI-driven care navigation.
    In a real-world scenario, this would call an LLM or use a complex ML model.
    """
    
    @staticmethod
    def generate_recommendation(db: Session, assessment: Assessment, patient_data: PatientDataRecord | None = None) -> CareRecommendation:
        # Defaults
        rec_type = "Primary Care"
        title = "Schedule a follow-up with your primary care provider"
        timeframe = "Within 3-5 days"
        priority_level = "Medium"
        emergency_flag = False
        reason = "Non-urgent symptoms reported."
        explanation = "Based on the assessment, your symptoms do not appear life-threatening, but should be evaluated."
        safety_advisory = "If you experience sudden worsening, go to the emergency room."
        
        # Analyze Severity
        if assessment.severity >= 8:
            priority_level = "High"
            rec_type = "Urgent Care"
            title = "Visit an Urgent Care Center"
            timeframe = "Within 24 hours"
            reason = "High severity symptoms reported."
            
        # Analyze Worsening
        if assessment.worsening.lower() == "yes" and assessment.severity >= 6:
            priority_level = "High"
            rec_type = "Urgent Care"
            title = "Visit an Urgent Care Center"
            timeframe = "Within 24 hours"
            reason = "Symptoms are worsening and moderately severe."
            
        # Emergency Triggers
        emergency_symptoms = ["chest pain", "shortness of breath", "difficulty breathing", "unconscious", "stroke"]
        
        # Check primary symptom
        if any(s in assessment.primary_symptom.lower() for s in emergency_symptoms):
            emergency_flag = True
            
        # Check additional symptoms
        symptoms = db.query(AssessmentSymptom).filter(AssessmentSymptom.assessment_id == assessment.id).all()
        for sym in symptoms:
            if any(s in sym.symptom.lower() for s in emergency_symptoms):
                emergency_flag = True
                break
                
        # Risk factors from medical context
        high_risk = False
        if patient_data:
            if patient_data.history_heart_disease or patient_data.history_stroke_or_tia or patient_data.history_copd:
                high_risk = True
                
        if high_risk and (assessment.severity >= 7 or assessment.worsening.lower() == "yes"):
            emergency_flag = True
            reason = "High-risk medical history combined with significant symptoms."
            
        if emergency_flag:
            rec_type = "Emergency"
            title = "Go to the nearest Emergency Room"
            timeframe = "Immediately"
            priority_level = "Critical"
            reason = "Symptoms suggest a potential medical emergency."
            explanation = "Your reported symptoms and history indicate you need immediate medical attention."
            safety_advisory = "Do NOT drive yourself. Call 911 if necessary."
            
        # Create recommendation
        recommendation = CareRecommendation(
            assessment_id=assessment.id,
            recommendation_type=rec_type,
            title=title,
            timeframe=timeframe,
            priority_level=priority_level,
            emergency_flag=emergency_flag,
            reason=reason,
            explanation=explanation,
            safety_advisory=safety_advisory,
            model_name="care-nav-rules-v1"
        )
        
        db.add(recommendation)
        db.commit()
        db.refresh(recommendation)
        return recommendation
