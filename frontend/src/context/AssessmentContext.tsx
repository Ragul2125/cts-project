import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AssessmentData, CareNavigationResult, CarePlan } from '../types';

import { usePatient } from './PatientContext';
import { apiService } from '../services/api';

interface AssessmentContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isAssessmentOpen: boolean;
  openAssessment: () => void;
  closeAssessment: () => void;
  assessmentData: AssessmentData;
  updateAssessmentData: (updates: Partial<AssessmentData>) => void;
  toggleSymptom: (symptom: string) => void;
  toggleSafetyQuestion: (question: string) => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
  processingProgress: number;
  navigationResult: CareNavigationResult | null;
  submitAssessment: (overrideRecommendation?: any) => Promise<CareNavigationResult>;
  resetAssessment: () => void;
  canProceedFromCurrentStep: () => boolean;
}

const defaultAssessment: AssessmentData = {
  symptoms: ['Headache'],
  primarySymptom: 'Headache',
  duration: '2-3 days ago',
  severity: 6,
  worsening: 'No',
  safetyQuestions: ['None of these'],
  medicalContextConfirmed: true,
  additionalNotes: '',
  triedHomeRemedies: false,
  temperatureHome: 98.6,
  heartRateHome: 75,
  spo2Home: 98
};

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const AssessmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { patient, addCarePlan, addHistoryRecord, refreshBackendData } = usePatient();

  const [currentStep, setCurrentStep] = useState<number>(() => {
    const savedStep = localStorage.getItem('carepath_assessment_step');
    return savedStep ? parseInt(savedStep, 10) : 1;
  });

  const [isAssessmentOpen, setIsAssessmentOpen] = useState<boolean>(false);

  const openAssessment = () => {
    setIsAssessmentOpen(true);
  };

  const closeAssessment = () => {
    setIsAssessmentOpen(false);
  };

  const [assessmentData, setAssessmentData] = useState<AssessmentData>(() => {
    const saved = localStorage.getItem('carepath_assessment_draft');
    return saved ? JSON.parse(saved) : defaultAssessment;
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);

  const [navigationResult, setNavigationResult] = useState<CareNavigationResult | null>(() => {
    const saved = localStorage.getItem('carepath_navigation_result');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('carepath_assessment_step', currentStep.toString());
  }, [currentStep]);

  useEffect(() => {
    localStorage.setItem('carepath_assessment_draft', JSON.stringify(assessmentData));
  }, [assessmentData]);

  useEffect(() => {
    if (navigationResult) {
      localStorage.setItem('carepath_navigation_result', JSON.stringify(navigationResult));
    }
  }, [navigationResult]);

  const updateAssessmentData = (updates: Partial<AssessmentData>) => {
    setAssessmentData(prev => {
      const updated = { ...prev, ...updates };
      if (updates.symptoms && updates.symptoms.length > 0) {
        if (!updates.symptoms.includes(updated.primarySymptom)) {
          updated.primarySymptom = updates.symptoms[0];
        }
      }
      return updated;
    });
  };

  const toggleSymptom = (symptom: string) => {
    setAssessmentData(prev => {
      const exists = prev.symptoms.includes(symptom);
      let newSymptoms: string[];
      if (exists) {
        newSymptoms = prev.symptoms.filter(s => s !== symptom);
      } else {
        newSymptoms = [...prev.symptoms, symptom];
      }
      return {
        ...prev,
        symptoms: newSymptoms,
        primarySymptom: newSymptoms.length > 0 ? (newSymptoms.includes(prev.primarySymptom) ? prev.primarySymptom : newSymptoms[0]) : ''
      };
    });
  };

  const toggleSafetyQuestion = (question: string) => {
    setAssessmentData(prev => {
      if (question === 'None of these') {
        return {
          ...prev,
          safetyQuestions: prev.safetyQuestions.includes('None of these') ? [] : ['None of these']
        };
      } else {
        const withoutNone = prev.safetyQuestions.filter(q => q !== 'None of these');
        const exists = withoutNone.includes(question);
        const newQuestions = exists ? withoutNone.filter(q => q !== question) : [...withoutNone, question];
        return {
          ...prev,
          safetyQuestions: newQuestions.length === 0 ? ['None of these'] : newQuestions
        };
      }
    });
  };

  const canProceedFromCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return assessmentData.symptoms.length > 0;
      case 2:
        return assessmentData.duration !== '' && assessmentData.worsening !== '';
      case 3:
        return assessmentData.safetyQuestions.length > 0;
      case 4:
        return assessmentData.medicalContextConfirmed;
      case 5:
        return true;
      default:
        return true;
    }
  };

  const submitAssessment = async (overrideRecommendation?: any): Promise<CareNavigationResult> => {
    setIsProcessing(true);
    setProcessingProgress(20);

    const defaultPatientUuid = 'f28a5553-277c-49b5-98c5-c42dac12aa9b';

    let apiRecommendation: any = overrideRecommendation || null;

    if (!apiRecommendation) {
      try {
        setProcessingProgress(40);
        
        const pId = patient.displayId || patient.id || '204';
        const triageRes = await apiService.submitTriageForm({
          user_id: pId,
          primary_symptom: (assessmentData.primarySymptom || 'general_discomfort').toLowerCase().replace(/ /g, '_'),
          associated_symptoms: assessmentData.symptoms.filter(s => s !== assessmentData.primarySymptom).join(', ').toLowerCase().replace(/ /g, '_') || 'none',
          symptom_onset: assessmentData.worsening === 'Yes' ? 'sudden' : 'gradual',
          symptom_duration_days: assessmentData.duration?.includes('2-3') ? 3 : assessmentData.duration?.includes('week') ? 7 : 1,
          pain_level: assessmentData.severity,
          worse_with_activity: assessmentData.worsening === 'Yes' ? 1 : 0,
          tried_home_remedies: assessmentData.triedHomeRemedies ? 1 : 0,
          temperature_home: assessmentData.temperatureHome || 98.6,
          heart_rate_home: assessmentData.heartRateHome || 75,
          spo2_home: assessmentData.spo2Home || 98
        });

        setProcessingProgress(70);

        if (triageRes && triageRes.recommendation) {
          apiRecommendation = triageRes.recommendation;
        }
      } catch (e) {
        console.warn('API triage form submission notice (using fallback UI engine):', e);
      }
    }

    setProcessingProgress(90);
    await new Promise(r => setTimeout(r, 400));
    setProcessingProgress(100);

    const isUrgent = apiRecommendation
      ? apiRecommendation.emergency_flag || apiRecommendation.care_tier === 'ED' || apiRecommendation.priority_level === 'High' || apiRecommendation.priority_level === 'Critical'
      : assessmentData.safetyQuestions.some(q => q !== 'None of these') || assessmentData.severity >= 8;

    const primarySym = assessmentData.primarySymptom || 'Reported symptoms';
    const recTitle = apiRecommendation?.recommendation_title || apiRecommendation?.title || (isUrgent ? 'Go to the Nearest Emergency Department' : 'Primary Care Follow-up');
    const timeframe = apiRecommendation?.timeframe || (isUrgent ? 'Immediately' : 'Within 24-48 hours');
    const acuity = apiRecommendation?.acuity_level || (isUrgent ? 'Urgent / Emergency' : 'Moderate');

    const reportedList = apiRecommendation?.symptoms_reported || [
      `${primarySym} (${assessmentData.duration || 'Recently started'}, Severity ${assessmentData.severity}/10)`,
      ...assessmentData.symptoms.filter(s => s !== primarySym).map(s => `Associated: ${s}`),
      assessmentData.worsening === 'Yes' ? 'Progressively worsening condition' : 'Stable trajectory (not acutely worsening)'
    ];

    const patterns = apiRecommendation?.recent_patterns || [
      `History of ${patient.conditions.map(c => c.name).join(' & ')} verified.`,
      `Recent vitals stable (${patient.latestBp} mmHg), ${patient.recentEdVisitsCount} ED visits in past 12 months.`
    ];

    const generatedCarePlan: CarePlan = {
      id: `cp-${Date.now()}`,
      title: apiRecommendation?.recommendation_title || `${primarySym} Recovery & Monitoring Protocol`,
      category: apiRecommendation?.care_tier || recTitle,
      subtitle: apiRecommendation?.summary_rationale || 'AI-assisted recovery tracking based on latest triage.',
      description: `Targeted clinical monitoring pathway for ${primarySym.toLowerCase()} symptoms following assessment on ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}. Priority: ${apiRecommendation?.priority_level || 'Normal'}.`,
      status: 'Active',
      createdDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      isNew: true,
      timeline: [
        {
          stepNumber: '01',
          title: 'Initial Follow-up & Rest',
          description: apiRecommendation?.symptoms_reported ? `Monitor reported symptoms: ${apiRecommendation.symptoms_reported.join(', ')}` : 'Record daily temperature, pain score, and maintain proper hydration.',
          timing: 'Today',
          actionLabel: 'Log Symptoms',
          actionType: 'log_symptoms',
          completed: false
        },
        {
          stepNumber: '02',
          title: 'Vitals & Parameter Logging',
          description: `Monitor resting blood pressure and vitals twice daily. Baseline target: ${patient.latestBp} mmHg.`,
          timing: 'Daily',
          actionLabel: 'Record Vitals',
          actionType: 'measure_o2',
          completed: false
        },
        {
          stepNumber: '03',
          title: 'Treatment Instructions',
          description: apiRecommendation?.recent_patterns ? `Review recent patterns: ${apiRecommendation.recent_patterns.join(' ')}` : 'Adhere to prescribed medication and avoid strenuous physical strain.',
          timing: 'Ongoing',
          actionLabel: 'View Medication Plan',
          actionType: 'inhaler_guide',
          completed: false
        },
        {
          stepNumber: '04',
          title: 'Care Team Consultation',
          description: `Scheduled ${apiRecommendation?.care_tier || recTitle.toLowerCase()} appointment to review symptom resolution.`,
          timing: apiRecommendation?.timeframe || '26 Aug',
          actionLabel: 'View Appointment',
          actionType: 'schedule_telehealth',
          completed: false
        }
      ],
      safetyProtocol: {
        title: 'Safety Protocol',
        urgentHelpTriggers: apiRecommendation?.safety_advisory 
          ? [apiRecommendation.safety_advisory, 'Sudden escalation in pain severity', 'Difficulty breathing or chest tightness']
          : [
            'Sudden escalation in pain severity (> 8/10)',
            'Difficulty breathing or chest tightness',
            'Dizziness, fainting, or acute vision changes',
            'Fever persisting above 101.5°F despite antipyretics'
          ],
        emergencyContactAction: 'Emergency Contact'
      },
      dailyGoals: [
        { id: `g-1-${Date.now()}`, text: 'Drink 2L of water / electrolytes', completed: false },
        { id: `g-2-${Date.now()}`, text: '15 mins resting or gentle stretching', completed: false },
        { id: `g-3-${Date.now()}`, text: 'Record Evening Symptoms & Temp', completed: false }
      ]
    };

    const result: CareNavigationResult = {
      recommendationTitle: recTitle,
      careTier: apiRecommendation?.care_tier || (isUrgent ? 'ED' : 'Urgent Care'),
      priorityLevel: apiRecommendation?.priority_level || (isUrgent ? 'Critical' : 'Medium'),
      emergencyFlag: apiRecommendation?.emergency_flag ?? isUrgent,
      timeframe,
      acuityLevel: acuity,
      summaryRationale: apiRecommendation?.summary_rationale || apiRecommendation?.explanation || (isUrgent
        ? 'Based on your reported symptom severity and associated risk markers, immediate clinical consultation is advised to prevent potential complications.'
        : 'Based on the symptoms reported today and your recent medical history, your condition appears stable but warrants professional evaluation to rule out secondary complications. The acuity level is low, indicating a non-emergent status.'),
      symptomsReported: reportedList,
      recentPatterns: patterns,
      safetyAdvisory: apiRecommendation?.safety_advisory || 'If symptoms worsen, significantly change, or if you experience difficulty breathing, seek emergency medical care immediately or call 911.',
      suggestedProviders: [],
      generatedCarePlan
    };

    setNavigationResult(result);
    
    // Always create a Care Plan to show the recommendation on the Care Plan page
    const shouldCreatePlan = true;
    
    if (shouldCreatePlan) {
      addCarePlan(generatedCarePlan);
    }

    // ==========================================
    // PERSIST TO BACKEND DATABASE
    // ==========================================
    try {
      const dbPId = patient.displayId || '204';
      
      // 1. Create HOS Care Request (HealthcareEncounter)
      await apiService.createHOSCareRequest({
        patient_id: dbPId,
        patient_name: patient.name || `Patient ${dbPId}`,
        mrn: dbPId,
        type: result.careTier || 'Urgent Care',
        priority: result.priorityLevel || 'Standard',
        primary_care: 'Dr. Unassigned',
        insurance: 'Standard',
        conditions: [primarySym],
        summary: result.summaryRationale
      }).catch(e => console.warn('Failed to save HOS care request to DB', e));

      // 2. Create Care Plan ONLY if it's an actual continuous care plan
      if (shouldCreatePlan) {
        await apiService.createPatientCarePlan(dbPId, {
          title: generatedCarePlan.title,
          category: generatedCarePlan.category,
          subtitle: generatedCarePlan.subtitle,
          description: generatedCarePlan.description,
          status: generatedCarePlan.status,
          active: true,
          actions: generatedCarePlan.timeline?.map((step, idx) => ({
            title: step.title,
            description: step.description,
            action_type: step.actionType,
            frequency: step.timing,
            status: 'Pending',
            sort_order: idx + 1
          })) || [],
          daily_goals: generatedCarePlan.dailyGoals?.map(goal => ({
            goal_text: goal.text,
            frequency: 'Daily',
            completed: false
          })) || []
        }).catch(e => console.warn('Failed to save Care Plan to DB', e));
      }
      
      // Trigger a sync from the backend to ensure local state matches the DB
      await refreshBackendData(dbPId).catch(e => console.warn('Failed to sync backend data:', e));
    } catch (e) {
      console.error('Failed to persist triage workflow to DB:', e);
    }
    // ==========================================

    addHistoryRecord({
      id: `hist-${Date.now()}`,
      type: 'Assessment',
      title: `${primarySym} Care Assessment`,
      providerOrLocation: 'CarePath AI Triage (Backend Engine)',
      date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      symptoms: reportedList,
      recommendation: `${recTitle} (${timeframe})`,
      status: 'Ongoing',
      notes: result.summaryRationale
    });

    setIsProcessing(false);
    return result;
  };

  const resetAssessment = () => {
    setAssessmentData(defaultAssessment);
    setCurrentStep(1);
    setIsProcessing(false);
    setProcessingProgress(0);
    localStorage.removeItem('carepath_assessment_step');
    localStorage.removeItem('carepath_assessment_draft');
  };

  return (
    <AssessmentContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        isAssessmentOpen,
        openAssessment,
        closeAssessment,
        assessmentData,
        updateAssessmentData,
        toggleSymptom,
        toggleSafetyQuestion,
        isProcessing,
        setIsProcessing,
        processingProgress,
        navigationResult,
        submitAssessment,
        resetAssessment,
        canProceedFromCurrentStep
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = (): AssessmentContextType => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
};
