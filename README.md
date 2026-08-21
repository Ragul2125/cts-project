# CarePath AI Platform

CarePath AI is a healthcare clinical navigation and triage platform built with a **React (Vite + TypeScript)** frontend and a **FastAPI (Python + PostgreSQL + SQLAlchemy + Alembic)** backend.

---

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, React Router v6, Lucide Icons, Recharts, PWA support.
- **Backend**: Python 3.10+, FastAPI, Uvicorn, SQLAlchemy ORM, Alembic Migrations, PyJWT, Passlib, Psycopg 3.
- **Database**: PostgreSQL (`carepath` database).

---

## 🚀 Quick Start Guide

### Prerequisites

Ensure you have the following installed on your machine:
- **Python**: 3.10 or higher
- **Node.js**: 18.0 or higher
- **PostgreSQL**: Running locally on port `5432` with user `postgres` (or update credentials in `backend/.env`)

---

## 🖥 Backend Setup & Execution

### 1. Navigate to the backend directory
```bash
cd backend
```

### 2. Activate Virtual Environment
- **Windows (PowerShell)**:
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
- **macOS / Linux**:
  ```bash
  source venv/bin/activate
  ```

*(If virtual environment is missing, create one via `python -m venv venv` and install dependencies: `pip install -r requirements.txt`)*

### 3. Configure Environment Variables
Verify or create the `.env` file in the `backend/` folder:
```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/carepath
CORS_ORIGINS=http://localhost:5173
APP_ENV=development
SECRET_KEY=change-this-secret
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### 4. Database Setup & Seeding
Run the initialization scripts to create the database, run migrations, and seed synthetic patient data:
```bash
# 1. Create database (if it doesn't exist)
$env:PYTHONPATH="."; python scripts/init_db.py

# 2. Run Alembic migrations
$env:PYTHONPATH="."; python -m alembic upgrade head

# 3. Seed demo users, synthetic patients, and care plans
$env:PYTHONPATH="."; python scripts/seed_database.py
```

### 5. Start the FastAPI Backend Server
```bash
$env:PYTHONPATH="."; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- **API Base URL**: `http://localhost:8000`
- **Swagger Documentation**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

### 6. Test All Backend Routes
To verify all 9 API routes are working properly:
```bash
$env:PYTHONPATH="."; python scripts/test_all_routes.py
```

---

## 🎨 Frontend Setup & Execution

### 1. Navigate to the frontend directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
- Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🔑 Demo Login Credentials

You can test user authentication via the **Sign In / Auth** button in the top header:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Patient (Demo)** | `patient204@example.com` | `password123` |
| **Hospital Staff** | `hospital@example.com` | `password123` |
| **CMS Analyst** | `cms@example.com` | `password123` |
| **Admin** | `admin@example.com` | `password123` |

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server health check |
| `POST` | `/api/v1/auth/register` | Register new user account |
| `POST` | `/api/v1/auth/login` | Authenticate user & receive JWT token |
| `GET` | `/api/v1/patients/{patient_id}` | Retrieve patient profile |
| `GET` | `/api/v1/patients/{patient_id}/dashboard` | Retrieve patient health summary & metrics |
| `POST` | `/api/v1/assessments/{patient_id}` | Submit symptom assessment & run triage engine |
| `GET` | `/api/v1/assessments/{assessment_id}/recommendation` | Fetch generated AI care recommendation |
| `GET` | `/api/v1/care-plans/patient/{patient_id}` | Retrieve patient's active care plans |
| `GET` | `/api/v1/care-plans/{plan_id}` | Fetch detailed care plan actions & safety protocols |
