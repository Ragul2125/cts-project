export interface Allergy {
  id: string;
  name: string;
  severity?: 'Mild' | 'Moderate' | 'Severe';
}

export interface ChronicCondition {
  id: string;
  name: string;
  diagnosedYear: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Patient {
  id: string;
  displayId: string;
  name: string;
  age: number;
  dob: string;
  gender: string;
  bloodGroup: string;
  profilePictureUrl?: string;
  status: 'Stable' | 'Critical' | 'Monitoring' | 'Recovering';
  allergies: Allergy[];
  conditions: ChronicCondition[];
  phone: string;
  email: string;
  address: string;
  emergencyContact: EmergencyContact;
  recentEdVisitsCount: number;
  recentHospitalizationDate: string;
  previousSimilarComplaint: boolean;
  latestBp: string;
  latestBpAiAnalyzed: boolean;
  preferences: {
    aiDataAnalysis: boolean;
    shareWithSpecialists: boolean;
    communicationPreference: 'Email' | 'SMS' | 'Phone' | 'Portal';
  };
}

export interface ActivityItem {
  id: string;
  type: 'Emergency Visit' | 'Primary Care' | 'Telehealth' | 'Specialist' | 'Lab Test' | 'Hospital Visit';
  facility: string;
  date: string;
  status?: string;
  color: 'red' | 'blue' | 'green' | 'amber' | 'purple';
  notes?: string;
}

export interface KeyObservation {
  id: string;
  label: string;
  value: string;
  reference: string;
  status: 'Normal' | 'Elevated' | 'Low' | 'Critical';
}

export interface MedicalFile {
  id: string;
  patient_id?: string;
  name: string;
  provider: string;
  description: string;
  date: string;
  type: 'PDF' | 'JPEG' | 'PNG' | 'DICOM';
  size: string;
  status: 'Reviewed' | 'Verified' | 'Pending Review' | 'Processing';
  iconType: 'blood' | 'xray' | 'vaccine' | 'prescription' | 'scan' | 'report';
  aiSummary: {
    overview: string;
    keyObservations: KeyObservation[];
    disclaimer: string;
  };
  fileUrl?: string;
}

export interface TimelineStep {
  stepNumber: string;
  title: string;
  description: string;
  timing: string; // e.g. "Today", "Daily", "Ongoing", "26 Aug"
  actionLabel?: string;
  actionType?: 'log_symptoms' | 'measure_o2' | 'inhaler_guide' | 'schedule_telehealth';
  completed?: boolean;
}

export interface CarePlan {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  description: string;
  status: 'Active' | 'Completed' | 'Archived';
  createdDate: string;
  isNew?: boolean;
  timeline: TimelineStep[];
  safetyProtocol: {
    title: string;
    urgentHelpTriggers: string[];
    emergencyContactAction: string;
  };
  dailyGoals: {
    id: string;
    text: string;
    completed: boolean;
  }[];
}

export interface AssessmentData {
  symptoms: string[];
  primarySymptom: string;
  duration: 'Today' | 'Yesterday' | '2-3 days ago' | 'More than a week ago' | '';
  severity: number; // 1 to 10
  worsening: 'Yes' | 'No' | 'Not sure' | '';
  safetyQuestions: string[];
  medicalContextConfirmed: boolean;
  additionalNotes?: string;
  triedHomeRemedies?: boolean;
  temperatureHome?: number;
  heartRateHome?: number;
  spo2Home?: number;
}

export interface ProviderSuggestion {
  id: string;
  name: string;
  specialty: string;
  distance: string;
  availability: string;
  avatarUrl?: string;
  phone?: string;
}

export interface CareNavigationResult {
  recommendationTitle: string;
  careTier?: string;
  priorityLevel?: string;
  emergencyFlag?: boolean;
  timeframe: string;
  acuityLevel: string;
  summaryRationale: string;
  symptomsReported: string[];
  recentPatterns: string[];
  safetyAdvisory: string;
  suggestedProviders: ProviderSuggestion[];
  generatedCarePlan?: CarePlan;
}


export interface Booking {
  id: string;
  providerId: string;
  providerName: string;
  providerSpecialty: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}
