/**
 * CarePath AI API Service Client
 * Connects frontend with FastAPI Backend on http://localhost:8000
 */

const API_BASE_URL = 'http://localhost:8000';

let authToken: string | null = localStorage.getItem('carepath_auth_token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('carepath_auth_token', token);
  } else {
    localStorage.removeItem('carepath_auth_token');
  }
};

export const getAuthToken = (): string | null => {
  return authToken || localStorage.getItem('carepath_auth_token');
};

const getHeaders = (extraHeaders: Record<string, string> = {}): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export interface HealthCheckResponse {
  status: string;
  message: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
}

export interface AssessmentPayload {
  primary_symptom: string;
  duration: string;
  severity: number;
  worsening: string;
  additional_notes?: string;
  medical_context_confirmed: boolean;
  additional_symptoms?: Array<{
    symptom: string;
    symptom_code?: string;
    selected: boolean;
  }>;
  safety_questions?: Array<{
    question_code: string;
    question_text: string;
    answer: boolean;
  }>;
  medical_context?: Array<{
    context_type: string;
    context_key: string;
    context_value: string;
    confirmed: boolean;
  }>;
}

export const apiService = {
  // 1. GET /health
  async checkHealth(): Promise<HealthCheckResponse> {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    return res.json();
  },

  // 2. POST /api/v1/auth/register
  async register(data: RegisterRequest): Promise<UserResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  // 3. POST /api/v1/auth/login
  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Login failed');
    }
    const tokenData: AuthResponse = await res.json();
    setAuthToken(tokenData.access_token);
    return tokenData;
  },

  // 4. GET /api/v1/patients/{patient_id}
  async getPatientProfile(patientId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/v1/patients/${patientId}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Failed to load patient profile: ${res.status}`);
    return res.json();
  },

  // 4b. PATCH /api/v1/patients/{patient_id}
  async updatePatientProfile(patientId: string, updates: Record<string, any>): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/v1/patients/${patientId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error(`Failed to update patient profile: ${res.status}`);
    return res.json();
  },

  async uploadProfilePicture(patientId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const headers = getHeaders();
    delete headers['Content-Type']; // Let browser set multipart/form-data boundary
    
    const res = await fetch(`${API_BASE_URL}/api/v1/patients/${patientId}/profile-picture`, {
      method: 'POST',
      headers,
      body: formData
    });
    if (!res.ok) throw new Error(`Failed to upload profile picture: ${res.status}`);
    return res.json();
  },

  async uploadMedicalFile(patientId: string, file: File, name: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    
    const headers = getHeaders();
    delete headers['Content-Type'];
    
    const res = await fetch(`${API_BASE_URL}/api/v1/patients/${patientId}/files`, {
      method: 'POST',
      headers,
      body: formData
    });
    if (!res.ok) throw new Error(`Failed to upload medical file: ${res.status}`);
    return res.json();
  },

  // 5. GET /api/v1/patients/{patient_id}/dashboard
  async getPatientDashboard(patientId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/v1/patients/${patientId}/dashboard`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Failed to load patient dashboard: ${res.status}`);
    return res.json();
  },

  // 6. POST /api/v1/assessments/{patient_id}
  async submitAssessment(patientId: string, payload: AssessmentPayload): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/v1/assessments/${patientId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Assessment submission failed' }));
      throw new Error(err.detail || 'Assessment submission failed');
    }
    return res.json();
  },

  // 7. GET /api/v1/assessments/{assessment_id}/recommendation
  async getCareRecommendation(assessmentId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/v1/assessments/${assessmentId}/recommendation`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Failed to load recommendation: ${res.status}`);
    return res.json();
  },

  // 8. GET /api/v1/care-plans/patient/{patient_id}
  async getPatientCarePlans(patientId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/api/v1/care-plans/patient/${patientId}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Failed to load care plans: ${res.status}`);
    return res.json();
  },

  // 8b. POST /api/v1/care-plans/patient/{patient_id}
  async createPatientCarePlan(patientId: string, payload: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/v1/care-plans/patient/${patientId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to create care plan: ${res.status}`);
    return res.json();
  },

  // 9. GET /api/v1/care-plans/{plan_id}
  async getCarePlanDetails(planId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/v1/care-plans/${planId}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Failed to load care plan details: ${res.status}`);
    return res.json();
  },

  // 9b. PATCH /api/v1/care-plans/{plan_id}/complete
  async completeCarePlan(planId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/v1/care-plans/${planId}/complete`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Failed to complete care plan: ${res.status}`);
    return res.json();
  },

  // 9c. DELETE /api/v1/care-plans/{plan_id}
  async deleteCarePlan(planId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/v1/care-plans/${planId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Failed to delete care plan: ${res.status}`);
    return res.json();
  },

  // 10. GET /api/v1/patients/{patient_id}/files
  async getPatientFiles(patientId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/api/v1/patients/${patientId}/files`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Failed to load medical files: ${res.status}`);
    return res.json();
  },

  // 11. GET /api/v1/patients/{patient_id}/history
  async getPatientHistory(patientId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/api/v1/patients/${patientId}/history`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Failed to load patient history: ${res.status}`);
    return res.json();
  },

  // 12. GET /api/v1/patients/{patient_id}/full-profile
  async getFullPatientProfile(patientId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/v1/patients/${patientId}/full-profile`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Failed to load full patient profile: ${res.status}`);
    return res.json();
  },

  // 13. HOS APIs
  async getHOSDashboard(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/v1/hos/dashboard`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to load HOS dashboard: ${res.status}`);
    return res.json();
  },

  async getHOSCareRequests(params: { status?: string; priority?: string; search?: string } = {}): Promise<any[]> {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.priority) query.append('priority', params.priority);
    if (params.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE_URL}/api/v1/hos/care-requests?${query.toString()}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to load care requests: ${res.status}`);
    return res.json();
  },

  async createHOSCareRequest(payload: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/v1/hos/care-requests`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to create care request: ${res.status}`);
    return res.json();
  },

  async getHOSReport(reportId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/v1/hos/reports/${reportId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to load HOS report: ${res.status}`);
    return res.json();
  },

  async updateHOSDetermination(requestId: string, payload: { status: string; auth_duration_days?: number; clinical_notes?: string }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/v1/hos/care-requests/${requestId}/determination`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to update determination: ${res.status}`);
    return res.json();
  },

  async getHOSCareActions(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/api/v1/hos/care-actions`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to load care actions: ${res.status}`);
    return res.json();
  },

  async updateHOSCareAction(actionId: string, payload: { status?: string; assigned_to_name?: string }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/v1/hos/care-actions/${actionId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to update care action: ${res.status}`);
    return res.json();
  },

  // 14. CMS APIs
  async getCMSDashboard(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/v1/cms/dashboard`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to load CMS dashboard: ${res.status}`);
    return res.json();
  },

  async getCMSPatterns(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/v1/cms/patterns`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to load CMS patterns: ${res.status}`);
    return res.json();
  },

  async getCMSMembers(params: { query?: string; pattern?: string; priority?: string } = {}): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append('query', params.query);
    if (params.pattern) queryParams.append('pattern', params.pattern);
    if (params.priority) queryParams.append('priority', params.priority);

    const res = await fetch(`${API_BASE_URL}/api/v1/cms/members?${queryParams.toString()}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to load CMS members: ${res.status}`);
    return res.json();
  },

  async getCMSProviders(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/api/v1/cms/providers`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to load CMS providers: ${res.status}`);
    return res.json();
  },

  async getCMSNavigation(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/v1/cms/navigation`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to load CMS navigation: ${res.status}`);
    return res.json();
  },

  async getCMSInsights(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/v1/cms/insights`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to load CMS insights: ${res.status}`);
    return res.json();
  },

  // 15. Agentic AI & ML Triage APIs
  async submitTriageText(payload: { user_id: string; user_query: string }): Promise<{
    status: string;
    missing_fields: string[];
    agent_response: string;
    recommendation?: any;
  }> {
    const res = await fetch(`${API_BASE_URL}/api/v1/triage/text`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to submit triage text: ${res.status}`);
    return res.json();
  },

  async submitTriageForm(payload: {
    user_id: string;
    primary_symptom: string;
    associated_symptoms?: string;
    symptom_onset?: string;
    symptom_duration_days?: number;
    pain_level?: number;
    worse_with_activity?: number;
    tried_home_remedies?: number;
    temperature_home?: number;
    heart_rate_home?: number;
    spo2_home?: number;
  }): Promise<{
    status: string;
    missing_fields: string[];
    agent_response: string;
    recommendation?: any;
  }> {
    const res = await fetch(`${API_BASE_URL}/api/v1/triage/form`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to submit triage form: ${res.status}`);
    return res.json();
  },

  async getFacilityRecommendation(payload: {
    triage_output: any;
    patient_zip: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/v1/facility/recommend`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to get facility recommendation: ${res.status}`);
    return res.json();
  },

  async bookAppointment(payload: {
    patient_id: string;
    facility_name: string;
    specialty: string;
    care_tier: string;
    appointment_date: string;
    appointment_time: string;
    notes?: string;
  }): Promise<{ ok: boolean; encounter_id: string; message: string }> {
    const res = await fetch(`${API_BASE_URL}/api/v1/facility/book-appointment`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to book appointment: ${res.status}`);
    return res.json();
  }
};
