export interface CareRequest {
  id: string;
  patientId: string;
  patientName: string;
  dob?: string;
  mrn: string;
  type: string;
  priority: 'Urgent' | 'Standard' | 'Low';
  status: 'Pending' | 'Approved' | 'Urgent' | 'Completed' | 'Awaiting Triage' | 'In Progress';
  time: string;
  requestedAgo: string;
  primaryCare?: string;
  insurance?: string;
  conditions?: string[];
  recentUtilization?: {
    type: string;
    date: string;
    location: string;
    color: string;
  }[];
  aiAssessment?: {
    summary: string;
    guidelineMatch: number;
    readmissionRisk: 'High' | 'Medium' | 'Low';
    suggestedAction: string;
  };
}

export interface CareAction {
  id: string;
  patientName: string;
  initials: string;
  mrn: string;
  actionRequired: string;
  actionSubtitle: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  priority: 'High' | 'Medium' | 'Low';
  assignedTo: {
    name: string;
    avatar?: string;
    isUnassigned?: boolean;
  };
}

export interface HighFrequencyMember {
  id: string;
  initials: string;
  name: string;
  condition: string;
  visits: number;
  badgeColor: string;
}

export const RECENT_CARE_REQUESTS: CareRequest[] = [
  {
    id: 'REQ-8492',
    patientId: 'PT-8821A',
    patientName: 'Robert J. Evans',
    dob: '04/12/1945 (78y) • M',
    mrn: '489-221-00',
    type: 'Cardiology Consult',
    priority: 'Urgent',
    status: 'Pending',
    time: '10 mins ago',
    requestedAgo: '10 mins ago',
    primaryCare: 'Dr. Sarah Jenkins',
    insurance: 'Medicare Advantage',
    conditions: ['CHF', 'Type 2 Diabetes', 'Hypertension'],
    recentUtilization: [
      { type: 'ED Visit - Shortness of breath', date: 'Oct 12, 2026', location: 'Mercy General', color: '#EF4444' },
      { type: 'PCP Follow-up', date: 'Oct 05, 2026', location: 'Dr. Jenkins', color: '#8B5CF6' },
      { type: 'Home Health Assessment', date: 'Sep 28, 2026', location: 'VNA Care', color: '#10B981' }
    ],
    aiAssessment: {
      summary: 'Request for Skilled Nursing Facility (SNF) placement. Patient exhibits increasing difficulty with ADLs and recent exacerbation of CHF resulting in an ED visit. AI analysis indicates a high probability of readmission without structured rehabilitation.',
      guidelineMatch: 92,
      readmissionRisk: 'High',
      suggestedAction: 'Approve Request'
    }
  },
  {
    id: 'REQ-9042',
    patientId: 'PT-9042C',
    patientName: 'Eleanor James',
    dob: '08/19/1962 (64y) • F',
    mrn: '893-21A',
    type: 'Imaging - MRI',
    priority: 'Standard',
    status: 'Approved',
    time: '1 hr ago',
    requestedAgo: '1 hr ago',
    primaryCare: 'Dr. Martinez',
    insurance: 'Blue Cross PPO',
    conditions: ['Lumbar Radiculopathy', 'Osteoarthritis']
  },
  {
    id: 'REQ-7719',
    patientId: 'PT-7719B',
    patientName: 'Michael Kwan',
    dob: '11/03/1975 (51y) • M',
    mrn: '442-998',
    type: 'Stat Labs',
    priority: 'Urgent',
    status: 'Urgent',
    time: 'Just now',
    requestedAgo: 'Just now',
    primaryCare: 'Dr. Patel',
    insurance: 'United Healthcare',
    conditions: ['Acute Pancreatitis', 'Hyperlipidemia']
  },
  {
    id: 'REQ-3321',
    patientId: 'PT-3321D',
    patientName: 'Sarah Lopez',
    dob: '02/14/1988 (38y) • F',
    mrn: '118-42C',
    type: 'Discharge Order',
    priority: 'Low',
    status: 'Completed',
    time: '3 hrs ago',
    requestedAgo: '3 hrs ago',
    primaryCare: 'Dr. Lee',
    insurance: 'Aetna HMO',
    conditions: ['Post-Op Appendectomy']
  }
];

export const QUEUE_CARE_REQUESTS = [
  {
    id: 'REQ-8932',
    patientName: 'Eleanor James',
    initials: 'EJ',
    mrn: '893-21A',
    requestType: 'Cardiology Consult',
    requestedAgo: 'Requested 2h ago',
    priority: 'Urgent',
    status: 'Awaiting Triage'
  },
  {
    id: 'REQ-4429',
    patientName: 'Michael Kwan',
    initials: 'MK',
    mrn: '442-998',
    requestType: 'Medication Refill',
    requestedAgo: 'Requested 4h ago',
    priority: 'Standard',
    status: 'In Progress'
  },
  {
    id: 'REQ-1184',
    patientName: 'Sarah Lopez',
    initials: 'SL',
    mrn: '118-42C',
    requestType: 'General Inquiry',
    requestedAgo: 'Requested 1d ago',
    priority: 'Low',
    status: 'Awaiting Triage'
  },
  {
    id: 'REQ-8492',
    patientName: 'Robert J. Evans',
    initials: 'RE',
    mrn: '489-221-00',
    requestType: 'SNF Placement Request',
    requestedAgo: 'Requested 10m ago',
    priority: 'Urgent',
    status: 'Pending'
  }
];

export const CARE_ACTIONS: CareAction[] = [
  {
    id: 'ACT-101',
    patientName: 'Eleanor Shellstrop',
    initials: 'ES',
    mrn: 'MRN-90210',
    actionRequired: 'Medication Reconciliation',
    actionSubtitle: 'Review post-discharge...',
    status: 'Pending',
    priority: 'High',
    assignedTo: {
      name: 'Dr. C. Chidi',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=80&auto=format&fit=crop&q=80'
    }
  },
  {
    id: 'ACT-102',
    patientName: 'Jianyu Li',
    initials: 'JM',
    mrn: 'MRN-88421',
    actionRequired: 'Schedule Follow-up',
    actionSubtitle: 'Cardiology consultation...',
    status: 'In Progress',
    priority: 'Medium',
    assignedTo: {
      name: 'Unassigned',
      isUnassigned: true
    }
  },
  {
    id: 'ACT-103',
    patientName: 'Tahani Al-Jamil',
    initials: 'TA',
    mrn: 'MRN-11235',
    actionRequired: 'Lab Results Review',
    actionSubtitle: 'Routine metabolic panel...',
    status: 'Completed',
    priority: 'Low',
    assignedTo: {
      name: 'Dr. M. Kamil',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=80&auto=format&fit=crop&q=80'
    }
  }
];

export const REQUEST_VOLUME_DATA = [
  { day: 'Mon', volume: 45 },
  { day: 'Tue', volume: 52 },
  { day: 'Wed', volume: 48 },
  { day: 'Thu', volume: 68 },
  { day: 'Fri', volume: 85 },
  { day: 'Sat', volume: 110 },
  { day: 'Sun', volume: 142 }
];

export const ED_TREND_DATA = [
  { day: 'Mon', total: 65, avoidable: 22 },
  { day: 'Tue', total: 78, avoidable: 31 },
  { day: 'Wed', total: 42, avoidable: 18 },
  { day: 'Thu', total: 95, avoidable: 42 },
  { day: 'Fri', total: 84, avoidable: 36 },
  { day: 'Sat', total: 128, avoidable: 62 },
  { day: 'Sun', total: 72, avoidable: 28 }
];

export const HIGH_FREQUENCY_MEMBERS: HighFrequencyMember[] = [
  { id: 'HF-1', initials: 'ES', name: 'Eleanor Shellstrop', condition: 'Asthma Exacerbation', visits: 8, badgeColor: '#FEE2E2' },
  { id: 'HF-2', initials: 'CD', name: 'Chidi Anagonye', condition: 'Anxiety / Panic', visits: 5, badgeColor: '#FEF3C7' },
  { id: 'HF-3', initials: 'TA', name: 'Tahani Al-Jamil', condition: 'Migraine', visits: 4, badgeColor: '#F1F5F9' }
];

export const TOP_AVOIDABLE_DIAGNOSES = [
  { code: '01', name: 'Upper Respiratory Infection', count: 156, percentage: 65 },
  { code: '02', name: 'Urinary Tract Infection', count: 98, percentage: 48 },
  { code: '03', name: 'Minor Lacerations', count: 64, percentage: 32 },
  { code: '04', name: 'Back Pain (Non-Traumatic)', count: 42, percentage: 22 }
];
