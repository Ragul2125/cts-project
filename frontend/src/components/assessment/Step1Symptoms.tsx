import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowLeft,
  Flame, 
  HeartPulse, 
  Thermometer, 
  Wind, 
  Activity, 
  RotateCw, 
  Bandage, 
  PlusCircle,
  Sparkles
} from 'lucide-react';
import { useAssessment } from '../../context/AssessmentContext';
import { AssessmentLayout } from './AssessmentLayout';
import './Step1Symptoms.css';

interface SymptomOption {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const SYMPTOM_OPTIONS: SymptomOption[] = [
  { id: 'Headache', name: 'Headache', icon: <Flame size={22} /> },
  { id: 'Sore Throat', name: 'Sore Throat', icon: <Thermometer size={22} /> },
  { id: 'Cough', name: 'Cough', icon: <Wind size={22} /> },
  { id: 'Chest Pain', name: 'Chest Pain', icon: <HeartPulse size={22} /> },
  { id: 'Fever', name: 'Fever', icon: <Thermometer size={22} /> },
  { id: 'Breathing Difficulty', name: 'Breathing Difficulty', icon: <Wind size={22} /> },
  { id: 'Abdominal Pain', name: 'Abdominal Pain', icon: <Activity size={22} /> },
  { id: 'Dizziness', name: 'Dizziness', icon: <RotateCw size={22} /> },
  { id: 'Injury', name: 'Injury', icon: <Bandage size={22} /> },
  { id: 'Other', name: 'Other', icon: <PlusCircle size={22} /> }
];

export const Step1Symptoms: React.FC = () => {
  const { assessmentData, toggleSymptom, setCurrentStep, closeAssessment } = useAssessment();
  const navigate = useNavigate();

  const handleContinue = () => {
    setCurrentStep(2);
  };

  const isSelected = (name: string) => assessmentData.symptoms.includes(name);

  return (
    <AssessmentLayout stepNumber={1} totalSteps={5} stepTitle="Initial Assessment" stepPercentage={20}>
      <div className="assessment-heading-group">
        <div className="assessment-badge-pill">
          <Sparkles size={13} />
          <span>Initial Assessment</span>
        </div>
        <h1 className="assessment-title">What are you experiencing?</h1>
        <p className="assessment-subtitle">Select all the symptoms that apply to you right now.</p>
      </div>

      <div className="symptoms-grid">
        {SYMPTOM_OPTIONS.map(s => {
          const active = isSelected(s.name);
          return (
            <button
              key={s.id}
              type="button"
              className={`symptom-card ${active ? 'selected' : ''}`}
              onClick={() => toggleSymptom(s.name)}
              aria-pressed={active}
            >
              <div className="symptom-icon-bubble">
                {s.icon}
              </div>
              <span className="symptom-card-name">{s.name}</span>
            </button>
          );
        })}
      </div>

      <footer className="assessment-actions-bar">
        <button 
          type="button"
          className="btn btn-secondary action-back-btn" 
          onClick={() => {
            closeAssessment();
            navigate('/dashboard');
          }}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <button 
          type="button"
          className="btn btn-primary action-continue-btn"
          disabled={assessmentData.symptoms.length === 0}
          onClick={handleContinue}
        >
          <span>Continue</span>
          <ArrowRight size={16} />
        </button>
      </footer>
    </AssessmentLayout>
  );
};
