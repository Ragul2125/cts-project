import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, ShieldCheck } from 'lucide-react';
import { useAssessment } from '../../context/AssessmentContext';
import './AssessmentLayout.css';

interface AssessmentLayoutProps {
  children: ReactNode;
  stepNumber: number;
  totalSteps?: number;
  stepTitle?: string;
  stepPercentage?: number;
}

export const AssessmentLayout: React.FC<AssessmentLayoutProps> = ({
  children,
  stepNumber,
  totalSteps = 5,
  stepTitle,
  stepPercentage = (stepNumber / totalSteps) * 100
}) => {
  const navigate = useNavigate();
  const { resetAssessment, closeAssessment, setCurrentStep } = useAssessment();

  const handleExit = () => {
    closeAssessment();
  };

  return (
    <div className="assessment-modal-overlay animate-fade-in" onClick={handleExit}>
      <div 
        className="assessment-popup-card card" 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="assessment-modal-title"
      >
        {/* Top Header */}
        <header className="assessment-topbar">
          <div className="topbar-left">
            {stepNumber > 1 ? (
              <button 
                type="button"
                className="assessment-back-icon-btn" 
                onClick={() => {
                  const prev = Math.max(1, stepNumber - 1);
                  setCurrentStep(prev);
                }}
                aria-label="Previous step"
                title="Go back"
              >
                <ArrowLeft size={18} />
              </button>
            ) : (
              <div className="brand-pill" onClick={handleExit}>
                <ShieldCheck size={18} color="#0062eb" />
                <span className="brand-name">CarePath AI</span>
              </div>
            )}
            <span className="assessment-brand-title">CarePath AI</span>
          </div>

          <div className="topbar-right">
            <button 
              type="button"
              className="assessment-close-modal-btn" 
              onClick={handleExit}
              title="Save draft and close"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Progress Bar Track */}
        <div className="assessment-progress-wrapper">
          <div className="progress-labels">
            <span className="step-count-label">
              Step {stepNumber} of {totalSteps}{stepTitle ? `: ${stepTitle}` : ''}
            </span>
            <span className="step-percent-label">{Math.round(stepPercentage)}% Complete</span>
          </div>
          <div className="progress-track">
            <div 
              className="progress-fill" 
              style={{ width: `${stepPercentage}%` }}
            />
          </div>
        </div>

        {/* Main Content Body */}
        <main className="assessment-main-content">
          {children}
        </main>
      </div>
    </div>
  );
};
