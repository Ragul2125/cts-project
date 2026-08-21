import os
import json
import datetime
import pandas as pd
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

from app.ai.care_center_recommender import recommend_care_centers
from app.ai.facility_data_demo import FACILITY_DIRECTORY, QUALITY_SCORES, CAHPS_SCORES
from app.core.database import get_db
from app.models.clinical_models import HealthcareEncounter
from app.models.patient_models import Patient

router = APIRouter()

# Request/Response models
class FacilityRecommendationRequest(BaseModel):
    triage_output: dict = Field(description="The complete triage recommendation JSON output (containing care_tier, symptoms_reported, and recent_patterns).")
    patient_zip: str = Field(description="Patient 5-digit ZIP code.")

class FacilityItem(BaseModel):
    facility_name: str
    specialty: str
    distance_miles: float
    quality_score: float
    why_best_match: str
    rank: int

class FacilityRecommendationResponse(BaseModel):
    top_facility: FacilityItem
    alternatives: List[FacilityItem]

class AppointmentBookingRequest(BaseModel):
    patient_id: str = Field(description="Patient display ID (e.g. '204') or UUID")
    facility_name: str
    specialty: str
    care_tier: str
    appointment_date: str = Field(description="ISO date string e.g. 2026-08-25")
    appointment_time: str = Field(description="e.g. 10:00 AM")
    notes: Optional[str] = None

class AppointmentBookingResponse(BaseModel):
    ok: bool
    encounter_id: str
    message: str


@router.post("/recommend", response_model=FacilityRecommendationResponse)
async def recommend_facility(req: FacilityRecommendationRequest):
    triage = req.triage_output
    care_tier = triage.get("care_tier")
    if not care_tier:
        raise HTTPException(status_code=400, detail="Missing 'care_tier' in triage_output.")
        
    symptoms = triage.get("symptoms_reported", [])
    recent_patterns = triage.get("recent_patterns", [])
    
    TIER_MAP = {
        "ED": "ED",
        "Urgent Care": "Urgent_Care",
        "PCP": "PCP_Appointment",
        "Telehealth": "Telehealth",
        "Care Management": "Care_Management"
    }
    mapped_tier = TIER_MAP.get(care_tier, "PCP_Appointment")
    
    try:
        candidates = recommend_care_centers(
            req.patient_zip,
            mapped_tier,
            FACILITY_DIRECTORY,
            QUALITY_SCORES,
            CAHPS_SCORES,
            top_n=10
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error looking up facilities: {str(e)}")
        
    if not candidates:
        raise HTTPException(
            status_code=404, 
            detail=f"No matching facilities found for care tier '{care_tier}' within the search radius of ZIP {req.patient_zip}."
        )
        
    try:
        api_key = os.getenv("GROQ_API_KEY", "dummy_key")
        llm = ChatGroq(model="openai/gpt-oss-120b", api_key=api_key, temperature=0)
        
        class FacilityRanking(BaseModel):
            ranked_facilities: List[FacilityItem] = Field(
                description="Top 3 facilities ranked from best to third-best match, each with a why_best_match explanation."
            )

        selector = llm.with_structured_output(FacilityRanking)
        
        prompt = f"""
        You are a clinical care navigator. Review the candidate facilities for the patient:
        
        Patient Triage Profile:
        - Presenting Symptoms: {json.dumps(symptoms, indent=2)}
        - Chronic Patterns / Vital Warning Signals: {json.dumps(recent_patterns, indent=2)}
        - Recommended Care Tier: {care_tier}
        - Patient ZIP Code: {req.patient_zip}
        
        Candidate Facilities (sorted by distance/quality):
        {json.dumps(candidates, indent=2)}
        
        Select the TOP 3 best facilities from the list that are clinically optimal for this patient.
        Rank them 1 (best) to 3 (third-best). For each, explain in 1-2 sentences why it is a good match.
        If fewer than 3 candidates exist, return however many are available.
        """
        
        result = selector.invoke(prompt)
        
        ranked = result.ranked_facilities
        for i, f in enumerate(ranked):
            f.rank = i + 1

        top = ranked[0]
        alternatives = ranked[1:] if len(ranked) > 1 else []

        return FacilityRecommendationResponse(top_facility=top, alternatives=alternatives)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM selection failed: {str(e)}")


@router.post("/book-appointment", response_model=AppointmentBookingResponse)
def book_appointment(req: AppointmentBookingRequest, db: Session = Depends(get_db)):
    """Book an appointment and persist it as a HealthcareEncounter in the DB."""
    try:
        from uuid import UUID
        try:
            uid = UUID(req.patient_id)
            patient = db.query(Patient).filter(Patient.id == uid).first()
        except ValueError:
            patient = db.query(Patient).filter(Patient.patient_id == req.patient_id).first()

        if not patient:
            # Fallback: use first patient in DB for demo
            patient = db.query(Patient).first()
        
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")

        try:
            appt_date = datetime.date.fromisoformat(req.appointment_date)
        except ValueError:
            appt_date = datetime.date.today()

        is_emergency = req.care_tier.upper() in ("ED", "EMERGENCY")

        encounter = HealthcareEncounter(
            patient_id=patient.id,
            encounter_date=appt_date,
            encounter_type=req.care_tier,
            facility_name=req.facility_name,
            notes=f"Appointment at {req.appointment_time}. {req.notes or ''}".strip(),
            primary_diagnosis=req.specialty,
            is_emergency=is_emergency,
            status="Scheduled"
        )
        db.add(encounter)
        db.commit()
        db.refresh(encounter)

        return AppointmentBookingResponse(
            ok=True,
            encounter_id=str(encounter.id),
            message=f"Appointment booked at {req.facility_name} on {req.appointment_date} at {req.appointment_time}."
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to book appointment: {str(e)}")
