import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.ai.triage_agent import (
    fetch_patient_db_record,
    run_ml_emergency_gate,
    build_triage_recommendation
)

router = APIRouter()

# --- Request / Response Schemas ---

class TextTriageRequest(BaseModel):
    user_id: str = Field(description="Patient ID e.g. '204', 'PT-8821A', or UUID", default="204")
    user_query: str = Field(description="Patient symptom narrative text")

class FormTriageRequest(BaseModel):
    user_id: str = Field(description="Patient ID e.g. '204', 'PT-8821A', or UUID", default="204")
    primary_symptom: str = Field(description="Main symptom e.g. chest_pain, fever, headache, minor_injury")
    associated_symptoms: Optional[str] = Field(default="none")
    symptom_onset: Optional[str] = Field(default="gradual")
    symptom_duration_days: int = Field(default=1)
    pain_level: int = Field(default=5)
    worse_with_activity: Optional[int] = Field(default=0)
    tried_home_remedies: Optional[int] = Field(default=0)

class TriageResponse(BaseModel):
    status: str  # "complete" or "incomplete"
    missing_fields: List[str]
    agent_response: str
    recommendation: Optional[dict] = None

# --- In-memory session tracking for text conversation ---
conversations = {}

@router.post("/text", response_model=TriageResponse)
async def triage_text(req: TextTriageRequest, db: Session = Depends(get_db)):
    """
    Conversational AI Triage Endpoint.
    Uses 100% database-driven patient ID resolution to retrieve EHR history & ML predictions.
    """
    try:
        user_id = req.user_id or "204"
        query_text = (req.user_query or "").strip().lower()

        # Fetch 100% DB-driven patient history
        db_data = fetch_patient_db_record(user_id, db)

        # Basic natural language parsing fallback
        primary_symptom = "other"
        pain_level = 5
        symptom_duration_days = 1
        onset = "gradual"

        if "chest" in query_text or "heart" in query_text:
            primary_symptom = "chest_pain"
            pain_level = 8
        elif "breath" in query_text or "shortness" in query_text or "gasping" in query_text:
            primary_symptom = "shortness_of_breath"
            pain_level = 7
        elif "fever" in query_text or "temp" in query_text or "chills" in query_text:
            primary_symptom = "fever"
            pain_level = 4
        elif "head" in query_text or "headache" in query_text:
            primary_symptom = "headache"
            pain_level = 6
        elif "stomach" in query_text or "belly" in query_text or "abdominal" in query_text or "pain" in query_text:
            primary_symptom = "abdominal_pain"
            pain_level = 6

        if "sudden" in query_text or "abrupt" in query_text or "started suddenly" in query_text:
            onset = "sudden"

        # Check emergency safety gate
        needs_ed, severity_score = run_ml_emergency_gate(
            primary_symptom=primary_symptom,
            associated_symptoms="none",
            symptom_onset=onset,
            symptom_duration_days=symptom_duration_days,
            pain_level=pain_level,
            worse_with_activity=1 if "exercise" in query_text or "walking" in query_text else 0,
            tried_home_remedies=0,
            temperature_home=36.8,
            heart_rate_home=75,
            spo2_home=98,
            db_data=db_data
        )

        recommendation = build_triage_recommendation(
            needs_ed=needs_ed,
            severity_score=severity_score,
            primary_symptom=primary_symptom,
            associated_symptoms="none",
            symptom_duration_days=symptom_duration_days,
            pain_level=pain_level,
            spo2_home=98,
            temperature_home=36.8,
            heart_rate_home=75,
            db_data=db_data,
            user_query=req.user_query
        )

        agent_msg = f"Based on your symptoms and clinical history in PostgreSQL for Patient {user_id}, we recommend: {recommendation['recommendation_title']}."

        return TriageResponse(
            status="complete",
            missing_fields=[],
            agent_response=agent_msg,
            recommendation=recommendation
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/form", response_model=TriageResponse)
async def triage_form(req: FormTriageRequest, db: Session = Depends(get_db)):
    """
    Direct Form-based Triage Endpoint.
    Bypasses text parsing and evaluates exact form parameters.
    """
    try:
        user_id = req.user_id or "204"

        # Fetch 100% DB-driven patient history
        db_data = fetch_patient_db_record(user_id, db)

        needs_ed, severity_score = run_ml_emergency_gate(
            primary_symptom=req.primary_symptom,
            associated_symptoms=req.associated_symptoms,
            symptom_onset=req.symptom_onset,
            symptom_duration_days=req.symptom_duration_days,
            pain_level=req.pain_level,
            worse_with_activity=req.worse_with_activity or 0,
            tried_home_remedies=req.tried_home_remedies or 0,
            temperature_home=36.8,
            heart_rate_home=75,
            spo2_home=98,
            db_data=db_data
        )

        recommendation = build_triage_recommendation(
            needs_ed=needs_ed,
            severity_score=severity_score,
            primary_symptom=req.primary_symptom,
            associated_symptoms=req.associated_symptoms,
            symptom_duration_days=req.symptom_duration_days,
            pain_level=req.pain_level,
            spo2_home=98,
            temperature_home=36.8,
            heart_rate_home=75,
            db_data=db_data,
            user_query=f"Form submission: {req.primary_symptom}"
        )

        return TriageResponse(
            status="complete",
            missing_fields=[],
            agent_response=f"Direct form triage complete: {recommendation['recommendation_title']}",
            recommendation=recommendation
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
