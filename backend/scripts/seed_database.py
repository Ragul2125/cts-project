import os
import sys
import uuid
import random
from datetime import datetime, timedelta, date

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from faker import Faker
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.auth_models import User
from app.models.patient_models import Patient, PatientAllergy, PatientPreference
from app.models.clinical_models import MedicalFile, FileAISummary
from app.models.care_models import Assessment, CareRecommendation, CarePlan, CarePlanAction, DailyGoal, SafetyProtocol
from scripts.import_csv import import_csv_data

# Use a fixed seed for deterministic generation
fake = Faker()
Faker.seed(42)
random.seed(42)

def create_demo_users(db: Session):
    print("Creating Demo Users...")
    users_to_create = [
        ("patient204@example.com", "PATIENT"),
        ("hospital@example.com", "HOSPITAL_STAFF"),
        ("cms@example.com", "CMS_ANALYST"),
        ("admin@example.com", "ADMIN")
    ]
    for email, role in users_to_create:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                email=email,
                password_hash=get_password_hash("password123"),
                role=role
            )
            db.add(user)
    db.commit()

def generate_synthetic_patient_data(db: Session, patient_ids: list):
    print("Generating Synthetic Profile Data...")
    for pid in patient_ids:
        patient = db.query(Patient).filter(Patient.id == pid).first()
        if not patient:
            continue
            
        # Deterministic generation for this patient
        fake.seed_instance(int(patient.patient_id))
        random.seed(int(patient.patient_id))
        
        # Profile Data
        patient.name = fake.name_male() if patient.gender == "Male" else fake.name_female()
        dob = fake.date_of_birth(minimum_age=patient.age, maximum_age=patient.age)
        patient.date_of_birth = dob
        patient.blood_group = random.choice(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"])
        patient.phone = fake.phone_number()
        patient.email = f"patient{patient.patient_id}@example.com"
        patient.address = fake.address()
        
        # Link user if it's the demo patient 204
        if str(patient.patient_id) == "204":
            demo_user = db.query(User).filter(User.email == "patient204@example.com").first()
            if demo_user:
                patient.user_id = demo_user.id
                
        # Preferences
        pref = db.query(PatientPreference).filter(PatientPreference.patient_id == patient.id).first()
        if not pref:
            db.add(PatientPreference(patient_id=patient.id))

        # Allergies
        if random.random() > 0.5:
            allergy_names = ["Penicillin", "Latex", "NSAIDs", "Peanuts", "Dust Mites", "Pollen"]
            selected = random.sample(allergy_names, random.randint(1, 3))
            for a in selected:
                exists = db.query(PatientAllergy).filter_by(patient_id=patient.id, allergen=a).first()
                if not exists:
                    db.add(PatientAllergy(
                        patient_id=patient.id,
                        allergen=a,
                        reaction=random.choice(["Hives", "Rash", "Shortness of breath"]),
                        severity=random.choice(["Mild", "Moderate", "Severe"])
                    ))
                    
        # Mock Medical Files
        file_categories = ["Lab Report", "Imaging", "Prescription", "Discharge Summary"]
        for _ in range(random.randint(2, 5)):
            mf = MedicalFile(
                patient_id=patient.id,
                name=f"{random.choice(file_categories)} - {fake.date_this_year()}",
                category=random.choice(file_categories),
                file_type="PDF",
                file_size=f"{random.randint(1, 5)} MB",
                document_date=fake.date_this_year()
            )
            db.add(mf)
            db.flush()
            
            # AI Summary for file
            summary = FileAISummary(
                medical_file_id=mf.id,
                overview=fake.paragraph(nb_sentences=3),
                key_findings=fake.paragraph(nb_sentences=2),
                model_name="carepath-med-llm-v1"
            )
            db.add(summary)

    db.commit()

def generate_synthetic_assessments_and_plans(db: Session, patient_ids: list):
    print("Generating Mock Assessments and Care Plans...")
    for pid in patient_ids:
        # Generate 1 active care plan for a few patients
        if random.random() > 0.8 or str(pid) == "204":  # Ensure 204 gets one
            assessment = Assessment(
                patient_id=pid,
                status="Completed",
                primary_symptom=random.choice(["Fatigue", "Shortness of breath", "Chest pain", "Joint pain"]),
                duration="3 days",
                severity=random.randint(3, 8),
                worsening="Yes",
                medical_context_confirmed=True,
                submitted_at=datetime.utcnow() - timedelta(days=5),
                completed_at=datetime.utcnow() - timedelta(days=5)
            )
            db.add(assessment)
            db.flush()
            
            recommendation = CareRecommendation(
                assessment_id=assessment.id,
                recommendation_type="Primary Care",
                title="Primary Care Follow-up",
                timeframe="Within 1-3 days",
                priority_level="Medium",
                emergency_flag=False,
                reason="Ongoing symptoms requiring evaluation.",
                explanation="Based on your recent history, follow up is needed.",
                safety_advisory="If symptoms worsen rapidly, seek emergency care.",
                model_name="care-nav-rules-v1"
            )
            db.add(recommendation)
            db.flush()
            
            plan = CarePlan(
                patient_id=pid,
                assessment_id=assessment.id,
                recommendation_id=recommendation.id,
                title="Symptom Management Plan",
                category="Follow-up",
                description="Monitor symptoms and follow up with primary care.",
                status="Active",
                active=True,
                start_date=date.today(),
                end_date=date.today() + timedelta(days=30)
            )
            db.add(plan)
            db.flush()
            
            db.add(CarePlanAction(
                care_plan_id=plan.id,
                title="Schedule PCP Appointment",
                action_type="Appointment",
                status="Pending",
                due_date=date.today() + timedelta(days=3),
                sort_order=1
            ))
            
            db.add(SafetyProtocol(
                care_plan_id=plan.id,
                title="Emergency Warning Signs",
                description="Watch for severe worsening of symptoms.",
                severity="High",
                emergency_action="Go to the nearest ED or call 911."
            ))
            
            db.add(DailyGoal(
                care_plan_id=plan.id,
                goal_text="Log daily symptoms",
                frequency="Daily",
                goal_date=date.today()
            ))

    db.commit()

def run_seed():
    db = SessionLocal()
    try:
        create_demo_users(db)
        
        csv_path = r"C:\Users\HP\Desktop\working project\rohan-cts\patient_longitudinal_timelines.csv"
        print(f"Importing CSV data from {csv_path}...")
        imported_ids = import_csv_data(db, csv_path)
        
        if imported_ids:
            generate_synthetic_patient_data(db, imported_ids)
            generate_synthetic_assessments_and_plans(db, imported_ids)
            
        print("Database seeding completed successfully.")
        
        # Summary
        from app.models.patient_models import Patient, PatientDataRecord
        from app.models.clinical_models import MedicalFile
        from app.models.care_models import CarePlan
        
        print("\n--- Summary ---")
        print(f"Patients: {db.query(Patient).count()}")
        print(f"Source Records: {db.query(PatientDataRecord).count()}")
        print(f"Medical Files: {db.query(MedicalFile).count()}")
        print(f"Care Plans: {db.query(CarePlan).count()}")
        print(f"Users: {db.query(User).count()}")

    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
