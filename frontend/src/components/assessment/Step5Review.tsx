import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Edit2, 
  Flame, 
  Clock, 
  BarChart3, 
  ArrowRightCircle, 
  CheckCircle, 
  ShieldCheck,
  FileText
} from 'lucide-react';
import { useAssessment } from '../../context/AssessmentContext';
import { AssessmentLayout } from './AssessmentLayout';
import { AIProcessingOverlay } from './AIProcessingOverlay';
import './Step5Review.css';

export const Step5Review: React.FC = () => {
  const { assessmentData, setCurrentStep, submitAssessment, isProcessing, processingProgress, closeAssessment } = useAssessment();
  const navigate = useNavigate();

  const handleEdit = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    try {
      await submitAssessment();
      closeAssessment();
      navigate('/care-navigation');
    } catch (err) {
      console.error(err);
    }
  };

  const extraSymptoms = assessmentData.symptoms.filter(s => s !== assessmentData.primarySymptom);

  return (
    <AssessmentLayout stepNumber={5} totalSteps={5} stepTitle="Review" stepPercentage={100}>
      {isProcessing && <AIProcessingOverlay progress={processingProgress} />}

      <div className="assessment-heading-group">
        <h1 className="assessment-title">Review your assessment</h1>
        <p className="assessment-subtitle">
          Please confirm your symptoms and details before submitting to CarePath AI.
        </p>
      </div>

      {/* Review Summary Card */}
      <div className="assessment-summary-card">
        <div className="summary-card-header">
          <div className="summary-header-left">
            <FileText size={18} className="summary-header-icon" />
            <h3 className="summary-header-title">Summary</h3>
          </div>
          <button 
            type="button" 
            className="edit-summary-link" 
            onClick={handleEdit}
            aria-label="Edit assessment details"
          >
            <Edit2 size={13} />
            <span>Edit</span>
          </button>
        </div>

        <div className="summary-details-grid">
          {/* Primary Symptom */}
          <div className="summary-detail-item">
            <span className="summary-label">PRIMARY SYMPTOM</span>
            <div className="summary-value-row">
              <div className="value-icon-circle icon-pink">
                <Flame size={14} />
              </div>
              <span className="summary-val-text">{assessmentData.primarySymptom || 'Headache'}</span>
            </div>
          </div>

          {/* Duration */}
          <div className="summary-detail-item">
            <span className="summary-label">DURATION</span>
            <div className="summary-value-row">
              <div className="value-icon-circle icon-blue">
                <Clock size={14} />
              </div>
              <span className="summary-val-text">{assessmentData.duration || '2-3 days ago'}</span>
            </div>
          </div>

          {/* Severity */}
          <div className="summary-detail-item">
            <span className="summary-label">SEVERITY</span>
            <div className="summary-value-row">
              <div className="value-icon-circle icon-teal">
                <BarChart3 size={14} />
              </div>
              <span className="summary-val-text">{assessmentData.severity}/10</span>
            </div>
          </div>

          {/* Worsening */}
          <div className="summary-detail-item">
            <span className="summary-label">WORSENING</span>
            <div className="summary-value-row">
              <div className="value-icon-circle icon-gray">
                <ArrowRightCircle size={14} />
              </div>
              <span className="summary-val-text">{assessmentData.worsening || 'No'}</span>
            </div>
          </div>
        </div>

        <div className="summary-divider" />

        {/* Additional Symptoms */}
        <div className="summary-section-block">
          <span className="summary-label">ADDITIONAL SYMPTOMS</span>
          <p className="additional-symptoms-text">
            {extraSymptoms.length > 0 ? extraSymptoms.join(', ') : 'None reported.'}
          </p>
        </div>

        {/* Medical History Status */}
        <div className="summary-section-block">
          <span className="summary-label">MEDICAL HISTORY</span>
          <div className="history-confirmed-badge">
            <CheckCircle size={14} className="badge-check-icon" />
            <span>Confirmed & Up to Date</span>
          </div>
        </div>
      </div>

      {/* Encryption & Disclaimer Banner */}
      <div className="security-disclaimer-banner">
        <ShieldCheck size={18} className="shield-icon" />
        <p className="security-text">
          Your data is securely encrypted and reviewed by CarePath AI prior to clinician handoff. This is not a substitute for emergency medical care.
        </p>
      </div>

      {/* Action Buttons */}
      <footer className="assessment-actions-bar step5-actions">
        <button 
          type="button" 
          className="btn btn-secondary edit-all-btn" 
          onClick={handleEdit}
        >
          Edit Information
        </button>

        <button 
          type="button" 
          className="btn btn-primary submit-assessment-btn"
          onClick={handleSubmit}
        >
          <span>Submit Assessment</span>
          <ArrowRight size={16} />
        </button>
      </footer>
    </AssessmentLayout>
  );
};
