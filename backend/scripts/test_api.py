import httpx
import sys

BASE_URL = "http://localhost:8000/api/v1"

def run_tests():
    print("Testing Auth...")
    login_data = {"email": "patient204@example.com", "password": "password123"}
    r = httpx.post(f"{BASE_URL}/auth/login", json=login_data)
    if r.status_code != 200:
        print(f"Auth failed: {r.status_code} - {r.text}")
        sys.exit(1)
    
    token = r.json()["access_token"]
    print("Auth successful!")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    print("Testing DB connection / patients endpoint...")
    # Fetch a patient ID from the database using raw query since we don't know the UUID
    import psycopg
    conn = psycopg.connect("postgresql://postgres:r1a2g3u4l@localhost:5432/carepath")
    patient_id = None
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM patients LIMIT 1")
        row = cur.fetchone()
        if row:
            patient_id = row[0]
            
    if not patient_id:
        print("No patient found to test.")
        sys.exit(1)
        
    r = httpx.get(f"{BASE_URL}/patients/{patient_id}/dashboard", headers=headers)
    if r.status_code != 200:
        print(f"Dashboard fetch failed: {r.status_code} - {r.text}")
        sys.exit(1)
    print("Dashboard fetch successful:", r.json()["patient"]["name"])

    print("All basic routes are functioning correctly.")

if __name__ == "__main__":
    run_tests()
