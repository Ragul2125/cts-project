import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, HeartPulse, CheckSquare, FolderClosed, Calendar } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { useAssessment } from '../../context/AssessmentContext';
import { PatientSummaryCard } from '../../components/dashboard/PatientSummaryCard';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { CurrentCarePlanCard } from '../../components/dashboard/CurrentCarePlanCard';
import { RecentActivityTimeline } from '../../components/dashboard/RecentActivityTimeline';
import { UpcomingBookingsCard } from '../../components/dashboard/UpcomingBookingsCard';
import './DashboardPage.css';

export const DashboardPage: React.FC = () => {
  const { patient, activeCarePlan, medicalFiles } = usePatient();
  const { openAssessment } = useAssessment();
  const navigate = useNavigate();

  return (
    <div className="dashboard-page animate-fade-in">
      {/* Top Welcome Header */}
      <header className="dashboard-header">
        <div className="welcome-text-group">
          <h1 className="welcome-title">Good morning, {patient.name.split(' ')[0]} 👋</h1>
          <p className="welcome-subtitle">Here's your health overview.</p>
        </div>

        <button 
          type="button"
          className="btn btn-primary request-care-btn" 
          onClick={openAssessment}
        >
          <Plus size={18} />
          <span>Request Care</span>
        </button>
      </header>

      {/* Top Overview Cards Row */}
      <section className="overview-cards-row">
        <PatientSummaryCard />

        <div className="metrics-grid">
          <MetricCard 
            icon={<HeartPulse size={18} />}
            iconBgColor="#fee2e2"
            iconColor="#ef4444"
            value={patient.recentEdVisitsCount}
            label="Recent ED Visits"
            onClick={() => navigate('/history')}
          />

          <MetricCard 
            icon={<CheckSquare size={18} />}
            iconBgColor="#ecfdf5"
            iconColor="#10b981"
            value={activeCarePlan ? '1' : '0'}
            label={activeCarePlan ? "Active Care Plan" : "No Active Plans"}
            onClick={() => navigate('/care-plan')}
          />

          <MetricCard 
            icon={<FolderClosed size={18} />}
            iconBgColor="#eff6ff"
            iconColor="#0062eb"
            value={medicalFiles.length}
            label="Medical Files"
            onClick={() => navigate('/files')}
          />

          <MetricCard 
            icon={<Calendar size={18} />}
            iconBgColor="#0062eb"
            iconColor="#ffffff"
            value={patient.recentHospitalizationDate ? patient.recentHospitalizationDate.replace(/[^0-9]/g, '') || '0' : '0'}
            label="Days Since Discharge"
          />
        </div>
      </section>

      {/* Current Care Plan Highlight */}
      <UpcomingBookingsCard />

      <CurrentCarePlanCard />

      {/* Recent Activity Timeline */}
      <RecentActivityTimeline />
    </div>
  );
};
