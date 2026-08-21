import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowLeft, 
  AlertTriangle, 
  Frown, 
  Eye, 
  Volume2, 
  UserCheck, 
  Thermometer, 
  ShieldAlert, 
  CheckCircle2 
} from 'lucide-react';
import { useAssessment } from '../../context/AssessmentContext';
import { AssessmentLayout } from './AssessmentLayout';
import './Step3Safety.css';

interface SafetyOption {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const SAFETY_OPTIONS: SafetyOption[] = [
  { id: 'sudden_headache', name: 'Sudden severe headache', icon: <Frown size={20} /> },
  { id: 'vision_changes', name: 'Vision changes', icon: <Eye size={20} /> },
  { id: 'diff_speaking', name: 'Difficulty speaking', icon: <Volume2 size={20} /> },
  { id: 'weakness_numbness', name: 'Weakness or numbness', icon: <UserCheck size={20} /> },
  { id: 'fever', name: 'Fever', icon: <Thermometer size={20} /> },
  { id: 'head_injury', name: 'Recent head injury', icon: <ShieldAlert size={20} /> },
  { id: 'diff_swallowing', name: 'Difficulty swallowing or breathing', icon: <AlertTriangle size={20} /> }
];

export const Step3Safety: React.FC = () => {
  const { assessmentData, toggleSafetyQuestion, setCurrentStep } = useAssessment();
  const navigate = useNavigate();

  const handleContinue = () => {
    setCurrentStep(4);
  };

  const handleBack = () => {
    setCurrentStep(2);
  };

  const isSelected = (name: string) => assessmentData.safetyQuestions.includes(name);

  return (
    <AssessmentLayout stepNumber={3} totalSteps={5} stepTitle="Safety Questions" stepPercentage={60}>
      <div className="assessment-heading-group">
        <h1 className="assessment-title">Help us understand your symptoms</h1>
        <p className="assessment-subtitle">Are you experiencing any of these? (Select all that apply)</p>
      </div>

      {/* Safety Alert Box */}
      <div className="safety-warning-banner">
        <AlertTriangle size={18} className="safety-warning-icon" />
        <p className="safety-warning-text">
          These questions help identify situations that may require immediate medical evaluation.
        </p>
      </div>

      {/* Safety Options Grid */}
      <div className="safety-options-grid">
        {SAFETY_OPTIONS.map(opt => {
          const active = isSelected(opt.name);
          return (
            <button
              key={opt.id}
              type="button"
              className={`safety-card ${active ? 'selected' : ''}`}
              onClick={() => toggleSafetyQuestion(opt.name)}
              aria-pressed={active}
            >
              <div className="safety-icon-box">{opt.icon}</div>
              <span className="safety-name">{opt.name}</span>
            </button>
          );
        })}

        {/* None of these full-width option */}
        <button
          type="button"
          className={`safety-card none-of-these-card ${isSelected('None of these') ? 'selected' : ''}`}
          onClick={() => toggleSafetyQuestion('None of these')}
          aria-pressed={isSelected('None of these')}
        >
          <div className="safety-icon-box">
            <CheckCircle2 size={20} />
          </div>
          <span className="safety-name">None of these</span>
        </button>
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

        <button 
          type="button"
          className="btn btn-primary action-continue-btn"
          disabled={assessmentData.safetyQuestions.length === 0}
          onClick={handleContinue}
        >
          <span>Continue to Next Step</span>
          <ArrowRight size={16} />
        </button>
      </footer>
    </AssessmentLayout>
  );
};
