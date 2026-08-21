from fastapi import APIRouter
from app.api import auth, patients, assessments, care_plans, hos, cms, triage, facility

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(patients.router)
api_router.include_router(assessments.router)
api_router.include_router(care_plans.router)
api_router.include_router(triage.router, prefix="/triage", tags=["triage"])
api_router.include_router(hos.router, prefix="/hos", tags=["hospital"])
api_router.include_router(cms.router, prefix="/cms", tags=["cms"])
api_router.include_router(facility.router, prefix="/facility", tags=["facility"])

# Placeholder for route inclusions
# from app.api.routes import auth, patients
# api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
# api_router.include_router(patients.router, prefix="/patients", tags=["patients"])
