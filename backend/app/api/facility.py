import os
import json
import pandas as pd
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from langchain_groq import ChatGroq

from app.ai.care_center_recommender import recommend_care_centers
from app.ai.facility_data_demo import FACILITY_DIRECTORY, QUALITY_SCORES, CAHPS_SCORES

router = APIRouter()

# Request/Response models
class FacilityRecommendationRequest(BaseModel):
    triage_output: dict = Field(description="The complete triage recommendation JSON output (containing care_tier, symptoms_reported, and recent_patterns).")
    patient_zip: str = Field(description="Patient 5-digit ZIP code.")

class FacilityRecommendationResponse(BaseModel):
    facility_name: str = Field(description="Name of the recommended facility.")
    specialty: str = Field(description="Medical specialty.")
    distance_miles: float = Field(description="Distance in miles.")
    quality_score: float = Field(description="Quality rating score (0 to 100).")
    why_best_match: str = Field(description="Clinical reason why this facility is the best match.")

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
        llm = ChatGroq(model="openai/gpt-oss-120b", api_key=os.getenv("GROQ_API_KEY", "dummy-key"), temperature=0)
        
        class FacilitySelection(BaseModel):
            facility_name: str = Field(description="The exact name of the selected facility.")
            specialty: str = Field(description="The specialty of the selected facility.")
            distance_miles: float = Field(description="The distance in miles from the patient.")
            quality_score: float = Field(description="The quality score of the selected facility.")
            why_best_match: str = Field(description="A concise clinical reasoning explaining why this facility is the best match.")

        selector = llm.with_structured_output(FacilitySelection)
        
        prompt = f"""
        You are a clinical care navigator. Review the candidate facilities for the patient:
        
        Patient Triage Profile:
        - Presenting Symptoms: {json.dumps(symptoms, indent=2)}
        - Chronic Patterns / Vital Warning Signals: {json.dumps(recent_patterns, indent=2)}
        - Recommended Care Tier: {care_tier}
        - Patient ZIP Code: {req.patient_zip}
        
        Candidate Facilities (sorted by distance/quality):
        {json.dumps(candidates, indent=2)}
        
        Select the single best facility from the list that is clinically optimal for this patient's history and symptoms. 
        Explain why it is the best match (e.g. matching primary care for diabetes/hypertension, or urgent care closest to their location).
        """
        
        result = selector.invoke(prompt)
        return FacilityRecommendationResponse(
            facility_name=result.facility_name,
            specialty=result.specialty,
            distance_miles=result.distance_miles,
            quality_score=result.quality_score,
            why_best_match=result.why_best_match
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM selection failed: {str(e)}")
