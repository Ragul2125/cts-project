import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  ArrowRight, 
  Sparkles, 
  Activity, 
  Clock, 
  User, 
  AlertTriangle, 
  ChevronDown,
  Phone,
  Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAssessment } from '../../context/AssessmentContext';
import { usePatient } from '../../context/PatientContext';
import './CareNavigationPage.css';

export const CareNavigationPage: React.FC = () => {
  const { navigationResult, assessmentData } = useAssessment();
  const { patient } = usePatient();
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger celebratory subtle confetti on arrival
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }
  }, []);

  const result = navigationResult || {
    recommendationTitle: 'Primary Care Follow-up',
    careTier: 'PCP',
    priorityLevel: 'Low',
    emergencyFlag: false,
    timeframe: 'Within 1–3 days',
    acuityLevel: 'Low (Non-Emergent)',
    summaryRationale:
      'Based on the symptoms reported today and your recent medical history, your condition appears stable but warrants professional evaluation to rule out secondary complications. The acuity level is low, indicating a non-emergent status.',
    symptomsReported: [
      `${assessmentData.primarySymptom || 'Mild persistent cough'} (${assessmentData.duration || '3 days'})`,
      'Low-grade fever (99.2°F)',
      'Fatigue'
    ],
    recentPatterns: [
      'No history of severe respiratory issues.',
      `Recent vitals from last month's checkup were within normal ranges (${patient.latestBp} mmHg).`
    ],
    safetyAdvisory:
      'If symptoms worsen, significantly change, or if you experience difficulty breathing, seek emergency medical care immediately or call 911.'
  };

  return (
    <div className="care-navigation-page animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Care Navigation & Triage Result</h1>
        <p className="page-subtitle">Powered by CarePath Random Forest ML Triage Engine</p>
      </header>

      {/* High-Priority Emergency Flag Banner */}
      {(result.emergencyFlag || result.careTier === 'ED' || result.acuityLevel?.includes('Urgent')) && (
        <div className="emergency-alert-banner">
          <div className="emergency-banner-left">
            <AlertTriangle size={24} className="emergency-banner-icon" />
            <div>
              <h3 className="emergency-banner-title">IMMEDIATE EMERGENCY EVALUATION REQUIRED</h3>
              <p className="emergency-banner-sub">This triage assessment was flagged for high clinical urgency by our ML model.</p>
            </div>
          </div>
          <a href="tel:911" className="btn btn-danger call-911-btn">
            <Phone size={16} />
            <span>Call 911 Immediately</span>
          </a>
        </div>
      )}

      {/* Main Recommendation Banner */}
      <div className="recommendation-banner-card">
        <div className="rec-left-group">
          <div className="rec-icon-circle">
            <Stethoscope size={28} />
          </div>
          <div className="rec-text-info">
            <div className="rec-badge-row" style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
              <span className="rec-kicker">RECOMMENDATION</span>
              {result.careTier && (
                <span className="badge badge-primary" style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                  {result.careTier}
                </span>
              )}
              {result.priorityLevel && (
                <span className={`badge ${result.priorityLevel === 'Critical' || result.priorityLevel === 'High' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                  Priority: {result.priorityLevel}
                </span>
              )}
            </div>
            <h2 className="rec-main-title">{result.recommendationTitle}</h2>
            <div className="rec-timeframe-row" style={{ marginTop: '8px' }}>
              <Clock size={15} />
              <span>Timeframe: <strong>{result.timeframe}</strong></span>
              <span style={{ margin: '0 6px' }}>•</span>
              <Activity size={15} />
              <span>Acuity: <strong>{result.acuityLevel}</strong></span>
            </div>
          </div>
        </div>

        <div className="rec-actions-group">
          <button 
            type="button" 
            className="btn btn-primary view-plan-btn"
            onClick={() => navigate('/care-plan')}
          >
            <span>View Care Plan</span>
            <ArrowRight size={16} />
          </button>

          <button 
            type="button" 
            className="btn btn-secondary return-dash-btn"
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </button>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="nav-results-grid">
        {/* Left Column: Why this recommendation? */}
        <div className="why-rec-card">
          <div className="why-header">
            <Sparkles size={20} className="why-sparkle-icon" />
            <h3 className="why-title">ML Clinical Rationale</h3>
          </div>

          <p className="why-rationale-text">{result.summaryRationale}</p>

          <div className="rationale-subcards-row">
            {/* Symptoms Reported */}
            <div className="rationale-subcard">
              <div className="subcard-header">
                <Activity size={16} className="subcard-icon blue-icon" />
                <span className="subcard-title">Symptoms Reported</span>
              </div>
              <ul className="subcard-bullet-list">
                {result.symptomsReported.map((sym, idx) => (
                  <li key={idx}>{sym}</li>
                ))}
              </ul>
            </div>

            {/* Recent Patterns */}
            <div className="rationale-subcard">
              <div className="subcard-header">
                <Clock size={16} className="subcard-icon blue-icon" />
                <span className="subcard-title">EHR History & Lab Patterns</span>
              </div>
              <ul className="subcard-bullet-list">
                {result.recentPatterns.map((pat, idx) => (
                  <li key={idx}>{pat}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>


      </div>

      {/* Safety Advisory Banner */}
      <div className="safety-advisory-box">
        <AlertTriangle size={20} className="advisory-icon" />
        <div className="advisory-content">
          <h4 className="advisory-title">Clinical Safety Advisory</h4>
          <p className="advisory-text">{result.safetyAdvisory}</p>
        </div>
      </div>
    </div>
  );
};
