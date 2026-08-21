import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useAssessment } from '../../context/AssessmentContext';
import { AssessmentLayout } from './AssessmentLayout';
import './Step2Details.css';

const DURATION_OPTIONS = [
  'Today',
  'Yesterday',
  '2-3 days ago',
  'More than a week ago'
] as const;

const WORSENING_OPTIONS = ['Yes', 'No', 'Not sure'] as const;

export const Step2Details: React.FC = () => {
  const { assessmentData, updateAssessmentData, setCurrentStep } = useAssessment();
  const navigate = useNavigate();

  const handleContinue = () => {
    setCurrentStep(3);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  return (
    <AssessmentLayout stepNumber={2} totalSteps={5} stepTitle="Details" stepPercentage={40}>
      {/* Duration Question */}
      <div className="detail-section">
        <h2 className="section-question-title">When did this start?</h2>
        <div className="duration-pill-grid">
          {DURATION_OPTIONS.map(opt => (
            <button
              key={opt}
              type="button"
              className={`duration-pill-btn ${assessmentData.duration === opt ? 'selected' : ''}`}
              onClick={() => updateAssessmentData({ duration: opt })}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Severity Slider */}
      <div className="detail-section severity-box">
        <div className="severity-header">
          <h2 className="section-question-title">How severe is it?</h2>
          <span className="severity-badge-score">{assessmentData.severity} / 10</span>
        </div>

        <div className="slider-wrapper">
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={assessmentData.severity}
            onChange={(e) => updateAssessmentData({ severity: parseInt(e.target.value, 10) })}
            className="severity-range-input"
            aria-label="Severity level 1 to 10"
          />
          <div className="slider-scale-labels">
            <span className="scale-label">1 (Mild)</span>
            <span className="scale-label current-mid-label">5</span>
            <span className="scale-label">10 (Severe)</span>
          </div>
        </div>
      </div>

      {/* AI Insight Worsening Card */}
      <div className="ai-insight-card">
        <div className="ai-insight-badge">
          <Sparkles size={14} className="sparkle-icon" />
          <span>AI INSIGHT</span>
        </div>

        <h3 className="ai-question-title">Is it getting worse?</h3>

        <div className="worsening-options-row">
          {WORSENING_OPTIONS.map(opt => (
            <button
              key={opt}
              type="button"
              className={`worsening-btn ${assessmentData.worsening === opt ? 'selected' : ''}`}
              onClick={() => updateAssessmentData({ worsening: opt })}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Additional ML Data */}
      <div className="detail-section">
        <h2 className="section-question-title">Have you tried any home remedies?</h2>
        <div className="worsening-options-row">
          {['Yes', 'No'].map(opt => (
            <button
              key={opt}
              type="button"
              className={`worsening-btn ${assessmentData.triedHomeRemedies === (opt === 'Yes') ? 'selected' : ''}`}
              onClick={() => updateAssessmentData({ triedHomeRemedies: opt === 'Yes' })}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="detail-section">
        <h2 className="section-question-title">Home Vitals (Optional)</h2>
        <div className="vitals-inputs-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
          <div className="vital-input-group">
            <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Temp (°F)</label>
            <input
              type="number"
              step="0.1"
              value={assessmentData.temperatureHome || ''}
              onChange={(e) => updateAssessmentData({ temperatureHome: parseFloat(e.target.value) })}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              placeholder="98.6"
            />
          </div>
          <div className="vital-input-group">
            <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Heart Rate</label>
            <input
              type="number"
              value={assessmentData.heartRateHome || ''}
              onChange={(e) => updateAssessmentData({ heartRateHome: parseInt(e.target.value, 10) })}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              placeholder="75"
            />
          </div>
          <div className="vital-input-group">
            <label style={{ fontSize: '0.8rem', color: '#64748b' }}>SpO2 (%)</label>
            <input
              type="number"
              value={assessmentData.spo2Home || ''}
              onChange={(e) => updateAssessmentData({ spo2Home: parseInt(e.target.value, 10) })}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              placeholder="98"
            />
          </div>
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

        <button 
          type="button"
          className="btn btn-primary action-continue-btn"
          disabled={!assessmentData.duration || !assessmentData.worsening}
          onClick={handleContinue}
        >
          <span>Continue</span>
          <ArrowRight size={16} />
        </button>
      </footer>
    </AssessmentLayout>
  );
};
