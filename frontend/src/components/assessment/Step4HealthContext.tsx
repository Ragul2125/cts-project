import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowLeft, 
  HeartHandshake, 
  HeartPulse, 
  Calendar, 
  History as HistoryIcon, 
  Edit3,
  Check
} from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { useAssessment } from '../../context/AssessmentContext';
import { AssessmentLayout } from './AssessmentLayout';
import { EditProfileModal } from '../profile/EditProfileModal';
import './Step4HealthContext.css';

export const Step4HealthContext: React.FC = () => {
  const { patient } = usePatient();
  const { assessmentData, updateAssessmentData, setCurrentStep } = useAssessment();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);

  const handleContinue = () => {
    updateAssessmentData({ medicalContextConfirmed: true });
    setCurrentStep(5);
  };

  const handleBack = () => {
    setCurrentStep(3);
  };

  return (
    <AssessmentLayout stepNumber={4} totalSteps={5} stepTitle="Confirm Context" stepPercentage={80}>
      <div className="assessment-heading-group">
        <h1 className="assessment-title">Confirm your health context</h1>
        <p className="assessment-subtitle">
          Please review the critical health information retrieved from {patient.name}'s profile to ensure accurate AI assistance.
        </p>
      </div>

      <div className="context-cards-grid">
        {/* Known Conditions */}
        <div className="context-card conditions-card">
          <div className="context-card-header">
            <HeartHandshake size={18} className="context-icon green-icon" />
            <span className="context-card-title">Known Conditions</span>
          </div>
          <div className="conditions-list">
            {patient.conditions.length > 0 ? (
              patient.conditions.map(c => (
                <div key={c.id} className="condition-item">
                  <Check size={14} className="check-icon" />
                  <span>{c.name.replace('Type 2 ', '')}</span>
                </div>
              ))
            ) : (
              <span className="no-data-text" style={{ color: '#64748b', fontSize: '0.9rem', padding: '4px 0' }}>None reported</span>
            )}
          </div>
        </div>

        {/* Recent ED Visits */}
        <div className="context-card">
          <div className="context-card-header">
            <HeartPulse size={18} className="context-icon red-icon" />
            <span className="context-card-title uppercase">Recent ED Visits</span>
          </div>
          <div className="ed-visits-body">
            <span className="ed-count-number">{patient.recentEdVisitsCount}</span>
            <span className="ed-timeframe-sub">in the last 12 months</span>
          </div>
        </div>

        {/* Recent Hospitalization */}
        <div className="context-card">
          <div className="context-card-header">
            <Calendar size={18} className="context-icon blue-icon" />
            <span className="context-card-title uppercase">Recent Hospitalization</span>
          </div>
          <div className="hospitalization-date">
            <span>{patient.recentHospitalizationDate}</span>
          </div>
        </div>

        {/* Previous Similar Complaint */}
        <div className="context-card">
          <div className="context-card-header">
            <HistoryIcon size={18} className="context-icon amber-icon" />
            <span className="context-card-title uppercase">Previous Similar Complaint</span>
          </div>
          <div className="similar-complaint-badge-wrapper">
            <span className="complaint-badge">Yes</span>
          </div>
        </div>
      </div>

      {/* Confirmation Bottom Box */}
      <div className="context-confirmation-box">
        <h3 className="confirm-prompt-title">Is this information correct?</h3>
        <div className="confirm-buttons-row">
          <button 
            type="button" 
            className="btn btn-secondary edit-context-btn"
            onClick={() => setShowEditModal(true)}
          >
            <Edit3 size={15} />
            <span>Edit information</span>
          </button>

          <button 
            type="button" 
            className="btn btn-primary continue-confirm-btn"
            onClick={handleContinue}
          >
            <span>Yes, continue</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <footer className="assessment-actions-bar">
        <button 
          type="button"
          className="btn btn-secondary action-back-btn" 
          onClick={handleBack}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </footer>

      {showEditModal && (
        <EditProfileModal onClose={() => setShowEditModal(false)} />
      )}
    </AssessmentLayout>
  );
};
