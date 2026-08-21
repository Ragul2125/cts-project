from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.care_models import CarePlan, CarePlanAction, SafetyProtocol, DailyGoal, CarePlanProvider
from app.schemas.care_plan import CarePlanFullResponse, CarePlanResponse
from uuid import UUID

router = APIRouter(prefix="/care-plans", tags=["care_plans"])

@router.get("/patient/{patient_id}", response_model=list[CarePlanResponse])
def get_patient_care_plans(patient_id: UUID, db: Session = Depends(get_db)):
    plans = db.query(CarePlan).filter(CarePlan.patient_id == patient_id).order_by(CarePlan.created_at.desc()).all()
    return plans

@router.get("/{plan_id}", response_model=CarePlanFullResponse)
def get_care_plan_details(plan_id: UUID, db: Session = Depends(get_db)):
    plan = db.query(CarePlan).filter(CarePlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Care plan not found")
        
    actions = db.query(CarePlanAction).filter(CarePlanAction.care_plan_id == plan.id).order_by(CarePlanAction.sort_order).all()
    safety = db.query(SafetyProtocol).filter(SafetyProtocol.care_plan_id == plan.id).first()
    goals = db.query(DailyGoal).filter(DailyGoal.care_plan_id == plan.id).all()
    providers = db.query(CarePlanProvider).filter(CarePlanProvider.care_plan_id == plan.id).all()
    
    return {
        "plan": plan,
        "actions": actions,
        "safety_protocol": safety,
        "daily_goals": goals,
        "providers": providers
    }

from app.schemas.care_plan import CarePlanCreate
from app.models.patient_models import Patient
import datetime

@router.post("/patient/{patient_id}", response_model=CarePlanResponse)
def create_care_plan(patient_id: str, payload: CarePlanCreate, db: Session = Depends(get_db)):
    try:
        uid = UUID(patient_id)
        patient = db.query(Patient).filter(Patient.id == uid).first()
    except ValueError:
        patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
        
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    new_plan = CarePlan(
        patient_id=patient.id,
        title=payload.title,
        category=payload.category,
        subtitle=payload.subtitle,
        description=payload.description,
        status=payload.status,
        active=payload.active,
        created_at=datetime.datetime.utcnow(),
        start_date=datetime.date.today(),
        end_date=datetime.date.today() + datetime.timedelta(days=7)
    )
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)

    for action in payload.actions:
        new_action = CarePlanAction(
            care_plan_id=new_plan.id,
            title=action.title,
            description=action.description,
            action_type=action.action_type,
            frequency=action.frequency,
            status=action.status,
            sort_order=action.sort_order
        )
        db.add(new_action)
        
    for goal in payload.daily_goals:
        new_goal = DailyGoal(
            care_plan_id=new_plan.id,
            goal_text=goal.goal_text,
            frequency=goal.frequency,
            completed=goal.completed,
            goal_date=datetime.date.today()
        )
        db.add(new_goal)

    db.commit()
    return new_plan
