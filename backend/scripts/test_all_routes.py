import httpx
import uuid
import sys
import psycopg

BASE_URL = "http://127.0.0.1:8000"

def log_result(route_name, method, url, status_code, success, response_data=None):
    symbol = "[PASS]" if success else "[FAIL]"
    print(f"{symbol} [{method}] {route_name} -> URL: {url} | Status: {status_code}")
    if not success and response_data:
        print(f"   Error detail: {response_data}")

def test_all():
    print("\n===========================================")
    print("   RUNNING CAREPATH AI EXTENDED ROUTE TESTS  ")
    print("===========================================\n")
    
    passed_tests = 0
    total_tests = 0

    # 1. GET /health
    total_tests += 1
    try:
        r = httpx.get(f"{BASE_URL}/health")
        if r.status_code == 200 and r.json().get("status") == "ok":
            log_result("Health Check", "GET", "/health", r.status_code, True)
            passed_tests += 1
        else:
            log_result("Health Check", "GET", "/health", r.status_code, False, r.text)
    except Exception as e:
        log_result("Health Check", "GET", "/health", 0, False, str(e))

    # Connect to DB to fetch valid UUIDs for dynamic route testing
    conn = psycopg.connect("postgresql://postgres:r1a2g3u4l@localhost:5432/carepath")
    patient_uuid = None
    patient_id_str = None
    care_plan_uuid = None
    assessment_uuid = None
    with conn.cursor() as cur:
        cur.execute("SELECT id, patient_id FROM patients LIMIT 1")
        row = cur.fetchone()
        if row:
            patient_uuid = str(row[0])
            patient_id_str = str(row[1])

        cur.execute("SELECT id FROM care_plans LIMIT 1")
        cp_row = cur.fetchone()
        if cp_row:
            care_plan_uuid = str(cp_row[0])

        cur.execute("SELECT id FROM assessments LIMIT 1")
        asm_row = cur.fetchone()
        if asm_row:
            assessment_uuid = str(asm_row[0])

    print(f"\n[Info] Fetched Test Identifiers from Database:")
    print(f"  Patient UUID: {patient_uuid}")
    print(f"  Patient ID Str: {patient_id_str}")
    print(f"  Care Plan UUID: {care_plan_uuid}")
    print(f"  Assessment UUID: {assessment_uuid}\n")

    # 2. POST /api/v1/auth/register
    total_tests += 1
    random_email = f"test_{uuid.uuid4().hex[:6]}@example.com"
    reg_payload = {"email": random_email, "password": "TestPassword123!", "role": "PATIENT"}
    try:
        r = httpx.post(f"{BASE_URL}/api/v1/auth/register", json=reg_payload)
        if r.status_code == 200:
            log_result("Auth Register", "POST", "/api/v1/auth/register", r.status_code, True)
            passed_tests += 1
        else:
            log_result("Auth Register", "POST", "/api/v1/auth/register", r.status_code, False, r.text)
    except Exception as e:
        log_result("Auth Register", "POST", "/api/v1/auth/register", 0, False, str(e))

    # 3. POST /api/v1/auth/login
    total_tests += 1
    token = None
    login_payload = {"email": "patient204@example.com", "password": "password123"}
    try:
        r = httpx.post(f"{BASE_URL}/api/v1/auth/login", json=login_payload)
        if r.status_code == 200:
            token = r.json().get("access_token")
            log_result("Auth Login", "POST", "/api/v1/auth/login", r.status_code, True)
            passed_tests += 1
        else:
            log_result("Auth Login", "POST", "/api/v1/auth/login", r.status_code, False, r.text)
    except Exception as e:
        log_result("Auth Login", "POST", "/api/v1/auth/login", 0, False, str(e))

    headers = {"Authorization": f"Bearer {token}"} if token else {}

    # 4. GET /api/v1/patients/{patient_id}
    total_tests += 1
    if patient_uuid:
        try:
            r = httpx.get(f"{BASE_URL}/api/v1/patients/{patient_uuid}", headers=headers)
            if r.status_code == 200:
                log_result("Get Patient Profile", "GET", f"/api/v1/patients/{patient_uuid}", r.status_code, True)
                passed_tests += 1
            else:
                log_result("Get Patient Profile", "GET", f"/api/v1/patients/{patient_uuid}", r.status_code, False, r.text)
        except Exception as e:
            log_result("Get Patient Profile", "GET", f"/api/v1/patients/{patient_uuid}", 0, False, str(e))
    else:
        log_result("Get Patient Profile", "GET", "/api/v1/patients/{patient_id}", 0, False, "No patient found in DB")

    # 5. GET /api/v1/patients/{patient_id}/dashboard
    total_tests += 1
    if patient_uuid:
        try:
            r = httpx.get(f"{BASE_URL}/api/v1/patients/{patient_uuid}/dashboard", headers=headers)
            if r.status_code == 200:
                log_result("Get Patient Dashboard", "GET", f"/api/v1/patients/{patient_uuid}/dashboard", r.status_code, True)
                passed_tests += 1
            else:
                log_result("Get Patient Dashboard", "GET", f"/api/v1/patients/{patient_uuid}/dashboard", r.status_code, False, r.text)
        except Exception as e:
            log_result("Get Patient Dashboard", "GET", f"/api/v1/patients/{patient_uuid}/dashboard", 0, False, str(e))
    else:
        log_result("Get Patient Dashboard", "GET", "/api/v1/patients/{patient_id}/dashboard", 0, False, "No patient found in DB")

    # 6. GET /api/v1/patients/{patient_id}/files
    total_tests += 1
    if patient_uuid:
        try:
            r = httpx.get(f"{BASE_URL}/api/v1/patients/{patient_uuid}/files", headers=headers)
            if r.status_code == 200:
                log_result("Get Patient Medical Files", "GET", f"/api/v1/patients/{patient_uuid}/files", r.status_code, True)
                passed_tests += 1
            else:
                log_result("Get Patient Medical Files", "GET", f"/api/v1/patients/{patient_uuid}/files", r.status_code, False, r.text)
        except Exception as e:
            log_result("Get Patient Medical Files", "GET", f"/api/v1/patients/{patient_uuid}/files", 0, False, str(e))

    # 7. GET /api/v1/patients/{patient_id}/history
    total_tests += 1
    if patient_uuid:
        try:
            r = httpx.get(f"{BASE_URL}/api/v1/patients/{patient_uuid}/history", headers=headers)
            if r.status_code == 200:
                log_result("Get Patient Timeline History", "GET", f"/api/v1/patients/{patient_uuid}/history", r.status_code, True)
                passed_tests += 1
            else:
                log_result("Get Patient Timeline History", "GET", f"/api/v1/patients/{patient_uuid}/history", r.status_code, False, r.text)
        except Exception as e:
            log_result("Get Patient Timeline History", "GET", f"/api/v1/patients/{patient_uuid}/history", 0, False, str(e))

    # 8. GET /api/v1/patients/{patient_id}/full-profile
    total_tests += 1
    if patient_uuid:
        try:
            r = httpx.get(f"{BASE_URL}/api/v1/patients/{patient_uuid}/full-profile", headers=headers)
            if r.status_code == 200:
                log_result("Get Full Patient Profile", "GET", f"/api/v1/patients/{patient_uuid}/full-profile", r.status_code, True)
                passed_tests += 1
            else:
                log_result("Get Full Patient Profile", "GET", f"/api/v1/patients/{patient_uuid}/full-profile", r.status_code, False, r.text)
        except Exception as e:
            log_result("Get Full Patient Profile", "GET", f"/api/v1/patients/{patient_uuid}/full-profile", 0, False, str(e))

    # 9. POST /api/v1/assessments/{patient_id}
    total_tests += 1
    created_assessment_id = None
    if patient_uuid:
        assessment_payload = {
            "primary_symptom": "Chest discomfort",
            "duration": "2 days",
            "severity": 6,
            "worsening": "Yes",
            "additional_notes": "Occurs mostly after physical exertion.",
            "medical_context_confirmed": True,
            "additional_symptoms": [
                {"symptom": "Shortness of breath", "symptom_code": "SOB_01", "selected": True}
            ],
            "safety_questions": [
                {"question_code": "CHEST_PAIN", "question_text": "Is chest pain radiating to left arm?", "answer": False}
            ],
            "medical_context": [
                {"context_type": "History", "context_key": "Hypertension", "context_value": "Confirmed", "confirmed": True}
            ]
        }
        try:
            r = httpx.post(f"{BASE_URL}/api/v1/assessments/{patient_uuid}", json=assessment_payload, headers=headers)
            if r.status_code == 200:
                created_assessment_id = r.json().get("id")
                log_result("Submit Assessment", "POST", f"/api/v1/assessments/{patient_uuid}", r.status_code, True)
                passed_tests += 1
            else:
                log_result("Submit Assessment", "POST", f"/api/v1/assessments/{patient_uuid}", r.status_code, False, r.text)
        except Exception as e:
            log_result("Submit Assessment", "POST", f"/api/v1/assessments/{patient_uuid}", 0, False, str(e))

    # 10. GET /api/v1/assessments/{assessment_id}/recommendation
    total_tests += 1
    target_assessment_id = created_assessment_id or assessment_uuid
    if target_assessment_id:
        try:
            r = httpx.get(f"{BASE_URL}/api/v1/assessments/{target_assessment_id}/recommendation", headers=headers)
            if r.status_code == 200:
                log_result("Get Care Recommendation", "GET", f"/api/v1/assessments/{target_assessment_id}/recommendation", r.status_code, True)
                passed_tests += 1
            else:
                log_result("Get Care Recommendation", "GET", f"/api/v1/assessments/{target_assessment_id}/recommendation", r.status_code, False, r.text)
        except Exception as e:
            log_result("Get Care Recommendation", "GET", f"/api/v1/assessments/{target_assessment_id}/recommendation", 0, False, str(e))

    # 11. GET /api/v1/care-plans/patient/{patient_id}
    total_tests += 1
    if patient_uuid:
        try:
            r = httpx.get(f"{BASE_URL}/api/v1/care-plans/patient/{patient_uuid}", headers=headers)
            if r.status_code == 200:
                log_result("Get Patient Care Plans", "GET", f"/api/v1/care-plans/patient/{patient_uuid}", r.status_code, True)
                passed_tests += 1
            else:
                log_result("Get Patient Care Plans", "GET", f"/api/v1/care-plans/patient/{patient_uuid}", r.status_code, False, r.text)
        except Exception as e:
            log_result("Get Patient Care Plans", "GET", f"/api/v1/care-plans/patient/{patient_uuid}", 0, False, str(e))

    # 12. GET /api/v1/care-plans/{plan_id}
    total_tests += 1
    if care_plan_uuid:
        try:
            r = httpx.get(f"{BASE_URL}/api/v1/care-plans/{care_plan_uuid}", headers=headers)
            if r.status_code == 200:
                log_result("Get Care Plan Details", "GET", f"/api/v1/care-plans/{care_plan_uuid}", r.status_code, True)
                passed_tests += 1
            else:
                log_result("Get Care Plan Details", "GET", f"/api/v1/care-plans/{care_plan_uuid}", r.status_code, False, r.text)
        except Exception as e:
            log_result("Get Care Plan Details", "GET", f"/api/v1/care-plans/{care_plan_uuid}", 0, False, str(e))

    print("\n===========================================")
    print(f"  RESULTS: {passed_tests} / {total_tests} ROUTES PASSED SUCCESSFULLY")
    print("===========================================\n")

if __name__ == "__main__":
    test_all()
