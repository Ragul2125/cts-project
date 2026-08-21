import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Patient, CarePlan, MedicalFile, ActivityItem, Booking } from '../types';

import { apiService } from '../services/api';

const DEFAULT_PATIENT_UUID = 'f28a5553-277c-49b5-98c5-c42dac12aa9b';

interface PatientContextType {
  patient: Patient;
  updatePatient: (updates: Partial<Patient>) => void;
  addAllergy: (name: string, severity?: 'Mild' | 'Moderate' | 'Severe') => void;
  removeAllergy: (id: string) => void;
  addCondition: (name: string, diagnosedYear?: string) => void;
  removeCondition: (id: string) => void;
  updatePreferences: (updates: Partial<Patient['preferences']>) => void;
  
  carePlans: CarePlan[];
  activeCarePlan: CarePlan | undefined;
  addCarePlan: (newPlan: CarePlan) => void;
  toggleDailyGoal: (planId: string, goalId: string) => void;
  toggleTimelineStep: (planId: string, stepNumber: string) => void;
  completeCarePlan: (planId: string) => void;
  deleteCarePlan: (planId: string) => void;
  
  medicalFiles: MedicalFile[];
  selectedFile: MedicalFile | null;
  setSelectedFile: (file: MedicalFile | null) => void;
  addMedicalFile: (file: MedicalFile) => void;
  deleteMedicalFile: (fileId: string) => void;

  recentActivities: ActivityItem[];
  historyRecords: any[];
  addHistoryRecord: (record: any) => void;
  
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  cancelBooking: (bookingId: string) => void;
  
  refreshBackendData: (dynamicPatientId?: string) => Promise<void>;
  resetToDefaults: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patient, setPatient] = useState<Patient>(() => {
    const saved = localStorage.getItem('carepath_patient_data');
    return saved ? JSON.parse(saved) : {
      id: DEFAULT_PATIENT_UUID,
      displayId: '204',
      name: 'Unknown Patient',
      age: 0,
      gender: 'Unknown',
      bloodGroup: 'Unknown',
      phone: '',
      email: '',
      address: '',
      profilePictureUrl: '',
      conditions: [],
      allergies: [],
      latestBp: '',
      recentEdVisitsCount: 0,
      recentHospitalizationDate: '',
      preferences: {
        aiDataAnalysis: true,
        shareWithSpecialists: true,
        communicationPreference: 'Email'
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      }
    };
  });

  const [carePlans, setCarePlans] = useState<CarePlan[]>(() => {
    const saved = localStorage.getItem('carepath_careplans');
    return saved ? JSON.parse(saved) : [];
  });

  const [medicalFiles, setMedicalFiles] = useState<MedicalFile[]>(() => {
    const saved = localStorage.getItem('carepath_medical_files');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedFile, setSelectedFile] = useState<MedicalFile | null>(() => {
    return medicalFiles.length > 0 ? medicalFiles[0] : null;
  });

  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>(() => {
    const saved = localStorage.getItem('carepath_activities');
    return saved ? JSON.parse(saved) : [];
  });

  const [historyRecords, setHistoryRecords] = useState<any[]>(() => {
    const saved = localStorage.getItem('carepath_history_records');
    return saved ? JSON.parse(saved) : [];
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('carepath_bookings');
    return saved ? JSON.parse(saved) : [];
  });
  
  useEffect(() => {
    localStorage.setItem('carepath_bookings', JSON.stringify(bookings));
  }, [bookings]);

  const addBooking = (booking: Booking) => {
    setBookings(prev => [booking, ...prev]);
  };

  const cancelBooking = (bookingId: string) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId));
  };

  const refreshBackendData = async (dynamicPatientId?: string) => {
    try {
      const targetId = dynamicPatientId || patient.displayId || '204';
      
      // Fetch full profile, dashboard, files, history, and care plans in parallel
      const [fullProfile, dashboardData, backendFiles, backendHistory, apiCarePlans] = await Promise.all([
        apiService.getFullPatientProfile(targetId).catch(() => null),
        apiService.getPatientDashboard(targetId).catch(() => null),
        apiService.getPatientFiles(targetId).catch(() => []),
        apiService.getPatientHistory(targetId).catch(() => []),
        apiService.getPatientCarePlans(targetId).catch(() => [])
      ]);

      if (fullProfile || dashboardData) {
        setPatient(prev => ({
          ...prev,
          id: fullProfile?.id || dashboardData?.patient?.id || prev.id,
          displayId: fullProfile?.patient_id || dashboardData?.patient?.patient_id || prev.displayId,
          name: fullProfile?.name || dashboardData?.patient?.name || prev.name,
          age: fullProfile?.age || dashboardData?.patient?.age || prev.age,
          gender: fullProfile?.gender || dashboardData?.patient?.gender || prev.gender,
          bloodGroup: fullProfile?.blood_group || dashboardData?.patient?.blood_group || prev.bloodGroup,
          phone: fullProfile?.phone || prev.phone,
          email: fullProfile?.email || prev.email,
          address: fullProfile?.address || prev.address,
          profilePictureUrl: fullProfile?.profile_picture_url || dashboardData?.patient?.profile_picture_url || prev.profilePictureUrl,
          latestBp: fullProfile?.vitals?.systolic_bp ? `${fullProfile.vitals.systolic_bp}/80` : prev.latestBp,
          recentEdVisitsCount: dashboardData?.utilization?.ed_visits_last_12m ?? 0,
          recentHospitalizationDate: dashboardData?.utilization?.days_since_discharge 
            ? `${dashboardData.utilization.days_since_discharge} days ago` 
            : '0 days ago',
          conditions: (fullProfile?.conditions || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            diagnosedYear: c.first_seen_date ? c.first_seen_date.substring(0, 4) : 'Verified'
          })),
          allergies: (fullProfile?.allergies || []).map((a: any) => ({
            id: a.id,
            name: a.name,
            severity: (a.severity as any) || 'Moderate'
          })),
          emergencyContact: fullProfile?.emergency_contacts?.[0] ? {
            name: fullProfile.emergency_contacts[0].name,
            relationship: fullProfile.emergency_contacts[0].relationship,
            phone: fullProfile.emergency_contacts[0].phone
          } : prev.emergencyContact,
          preferences: fullProfile?.preferences ? {
            aiDataAnalysis: fullProfile.preferences.ai_data_analysis,
            shareWithSpecialists: fullProfile.preferences.share_with_specialists,
            communicationPreference: (fullProfile.preferences.communication_preference as any) || 'Email'
          } : prev.preferences
        }));
      }

      // Map backend Medical Files
      if (backendFiles) {
        if (backendFiles.length > 0) {
          const mappedFiles: MedicalFile[] = backendFiles.map((f: any, idx: number) => ({
            id: f.id,
            name: f.name,
            provider: f.provider || 'Unknown Provider',
            description: f.summary?.overview || `${f.category} document uploaded for patient record.`,
            date: f.document_date || f.uploaded_at ? new Date(f.document_date || f.uploaded_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent',
            type: (f.file_type as any) || 'PDF',
            size: f.file_size || '0 MB',
            status: 'Verified',
            iconType: f.category.toLowerCase().includes('lab') ? 'blood' : f.category.toLowerCase().includes('imaging') ? 'xray' : f.category.toLowerCase().includes('prescription') ? 'prescription' : 'report',
            aiSummary: {
              overview: f.summary?.overview || 'Standard medical document.',
              keyObservations: [
                {
                  id: `obs-1-${idx}`,
                  label: 'Document Category',
                  value: f.category,
                  reference: 'Record Tag',
                  status: 'Normal'
                },
                {
                  id: `obs-2-${idx}`,
                  label: 'Key Findings',
                  value: f.summary?.key_findings || 'No findings available.',
                  reference: 'AI Extract',
                  status: 'Normal'
                }
              ],
              disclaimer: 'AI-generated summary based on clinical document parsing.'
            }
          }));
          setMedicalFiles(mappedFiles);
          setSelectedFile(mappedFiles[0]);
        } else {
          setMedicalFiles([]);
          setSelectedFile(null);
        }
      }

      // Map backend History Records & Recent Activities
      if (backendHistory && backendHistory.length > 0) {
        setHistoryRecords(backendHistory);

        const mappedActivities: ActivityItem[] = backendHistory.slice(0, 5).map((h: any, idx: number) => {
          let typeStr: ActivityItem['type'] = 'Hospital Visit';
          let colorStr: ActivityItem['color'] = 'green';
          
          const title = (h.title || '').toLowerCase();
          const loc = (h.providerOrLocation || '').toLowerCase();
          
          if (h.type === 'Emergency' || title.includes('emergency') || title.includes('urgent') || loc.includes(' er') || loc.endsWith('er')) {
            typeStr = 'Emergency Visit';
            colorStr = 'red';
          } else if (loc.includes('clinic')) {
            typeStr = 'Specialist';
            colorStr = 'blue';
          } else if (loc.includes('lab')) {
            typeStr = 'Lab Test';
            colorStr = 'purple';
          } else if (h.type === 'Assessment' || loc.includes('primary')) {
            typeStr = 'Primary Care';
            colorStr = 'amber';
          }

          return {
            id: h.id || `act-api-${idx}`,
            type: typeStr,
            facility: h.providerOrLocation || 'Unknown Facility',
            date: h.date || 'Recent',
            status: h.status || 'Completed',
            color: colorStr,
            notes: h.notes || h.recommendation || 'Clinical encounter recorded'
          };
        });
        setRecentActivities(mappedActivities);
      }

      // Map backend Care Plans
      if (apiCarePlans && apiCarePlans.length > 0) {
        const fullPlanDetail = await apiService.getCarePlanDetails(apiCarePlans[0].id).catch(() => null);

        const mappedPlans: CarePlan[] = apiCarePlans.map((p: any) => ({
          id: p.id,
          title: p.title,
          category: p.category || 'General',
          subtitle: p.description || 'Active Care Protocol',
          description: p.description,
          status: p.active ? 'Active' : 'Completed',
          createdDate: p.start_date || 'Recent',
          timeline: (fullPlanDetail?.actions || []).map((act: any, aIdx: number) => ({
            stepNumber: `0${aIdx + 1}`,
            title: act.title,
            description: act.description || 'Recommended Action',
            timing: act.due_date || 'Daily',
            actionLabel: act.action_type || 'View',
            actionType: 'log_symptoms',
            completed: act.status === 'Completed'
          })),
          safetyProtocol: fullPlanDetail?.safety_protocol ? {
            title: fullPlanDetail.safety_protocol.title || 'Safety Warning',
            urgentHelpTriggers: [fullPlanDetail.safety_protocol.description || 'Unknown triggers'],
            emergencyContactAction: fullPlanDetail.safety_protocol.emergency_action || 'Seek medical attention'
          } : {
            title: 'Safety Protocol',
            urgentHelpTriggers: ['Escalating symptoms', 'Chest pain', 'Severe shortness of breath'],
            emergencyContactAction: 'Emergency Contact'
          },
          dailyGoals: (fullPlanDetail?.daily_goals || []).map((g: any) => ({
            id: g.id,
            text: g.goal_text,
            completed: g.completed
          }))
        }));

        setCarePlans(mappedPlans);
      }
    } catch (err) {
      console.warn('Backend connection sync fallback:', err);
    }
  };

  useEffect(() => {
    refreshBackendData();
  }, []);

  useEffect(() => {
    localStorage.setItem('carepath_patient_data', JSON.stringify(patient));
  }, [patient]);

  useEffect(() => {
    localStorage.setItem('carepath_careplans', JSON.stringify(carePlans));
  }, [carePlans]);

  useEffect(() => {
    localStorage.setItem('carepath_medical_files', JSON.stringify(medicalFiles));
  }, [medicalFiles]);

  useEffect(() => {
    localStorage.setItem('carepath_activities', JSON.stringify(recentActivities));
  }, [recentActivities]);

  useEffect(() => {
    localStorage.setItem('carepath_history_records', JSON.stringify(historyRecords));
  }, [historyRecords]);

  const updatePatient = async (updates: Partial<Patient>) => {
    setPatient(prev => ({ ...prev, ...updates }));
    
    try {
      const patientId = localStorage.getItem('carepath_member_id') || '204';
      
      const apiUpdates: any = {};
      if (updates.name) apiUpdates.name = updates.name;
      if (updates.phone) apiUpdates.phone = updates.phone;
      if (updates.email) apiUpdates.email = updates.email;
      if (updates.address) apiUpdates.address = updates.address;
      if (updates.bloodGroup) apiUpdates.blood_group = updates.bloodGroup;

      if (Object.keys(apiUpdates).length > 0) {
        await apiService.updatePatientProfile(patientId, apiUpdates);
      }
    } catch (err) {
      console.error('Failed to update patient profile on backend:', err);
    }
  };

  const addAllergy = (name: string, severity: 'Mild' | 'Moderate' | 'Severe' = 'Mild') => {
    const newAllergy = { id: `alg-${Date.now()}`, name, severity };
    setPatient(prev => ({ ...prev, allergies: [...prev.allergies, newAllergy] }));
  };

  const removeAllergy = (id: string) => {
    setPatient(prev => ({
      ...prev,
      allergies: prev.allergies.filter(a => a.id !== id)
    }));
  };

  const addCondition = (name: string, diagnosedYear: string = new Date().getFullYear().toString()) => {
    const newCondition = { id: `cnd-${Date.now()}`, name, diagnosedYear };
    setPatient(prev => ({ ...prev, conditions: [...prev.conditions, newCondition] }));
  };

  const removeCondition = (id: string) => {
    setPatient(prev => ({
      ...prev,
      conditions: prev.conditions.filter(c => c.id !== id)
    }));
  };

  const updatePreferences = (updates: Partial<Patient['preferences']>) => {
    setPatient(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...updates }
    }));
  };

  const addCarePlan = (newPlan: CarePlan) => {
    setCarePlans(prev => [newPlan, ...prev]);
  };

  const toggleDailyGoal = (planId: string, goalId: string) => {
    setCarePlans(prev =>
      prev.map(plan => {
        if (plan.id !== planId) return plan;
        return {
          ...plan,
          dailyGoals: plan.dailyGoals.map(goal =>
            goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
          )
        };
      })
    );
  };

  const toggleTimelineStep = (planId: string, stepNumber: string) => {
    setCarePlans(prev =>
      prev.map(plan => {
        if (plan.id !== planId) return plan;
        return {
          ...plan,
          timeline: plan.timeline.map(step =>
            step.stepNumber === stepNumber ? { ...step, completed: !step.completed } : step
          )
        };
      })
    );
  };

  const addMedicalFile = (file: MedicalFile) => {
    setMedicalFiles(prev => [file, ...prev]);
    setSelectedFile(file);
  };

  const deleteMedicalFile = (fileId: string) => {
    setMedicalFiles(prev => {
      const filtered = prev.filter(f => f.id !== fileId);
      if (selectedFile?.id === fileId) {
        setSelectedFile(filtered.length > 0 ? filtered[0] : null);
      }
      return filtered;
    });
  };

  const addHistoryRecord = (record: any) => {
    setHistoryRecords(prev => [record, ...prev]);
  };

  const resetToDefaults = () => {
    localStorage.removeItem('carepath_patient_data');
    localStorage.removeItem('carepath_careplans');
    localStorage.removeItem('carepath_medical_files');
    localStorage.removeItem('carepath_activities');
    localStorage.removeItem('carepath_history_records');
    localStorage.removeItem('carepath_assessment_draft');
    localStorage.removeItem('carepath_navigation_result');
    window.location.reload();
  };

  const completeCarePlan = async (planId: string) => {
    setCarePlans(prev => prev.map(p => p.id === planId ? { ...p, status: 'Completed', active: false } : p));
    try {
      if (planId && !planId.startsWith('mock') && !planId.startsWith('cp-')) {
        await apiService.completeCarePlan(planId);
      }
      await refreshBackendData();
    } catch (err) {
      console.error('Failed to complete care plan:', err);
    }
  };

  const deleteCarePlan = async (planId: string) => {
    setCarePlans(prev => prev.filter(p => p.id !== planId));
    try {
      if (planId && !planId.startsWith('mock') && !planId.startsWith('cp-')) {
        await apiService.deleteCarePlan(planId);
      }
      await refreshBackendData();
    } catch (err) {
      console.error('Failed to delete care plan:', err);
    }
  };

  const activeCarePlan = carePlans.find(cp => cp.status === 'Active');

  return (
    <PatientContext.Provider
      value={{
        patient,
        updatePatient,
        addAllergy,
        removeAllergy,
        addCondition,
        removeCondition,
        updatePreferences,
        carePlans,
        activeCarePlan,
        addCarePlan,
        toggleDailyGoal,
        toggleTimelineStep,
        completeCarePlan,
        deleteCarePlan,
        medicalFiles,
        selectedFile,
        setSelectedFile,
        addMedicalFile,
        deleteMedicalFile,
        recentActivities,
        historyRecords,
        addHistoryRecord, bookings, addBooking, cancelBooking,
        refreshBackendData,
        resetToDefaults
      }}
    >
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = (): PatientContextType => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};
