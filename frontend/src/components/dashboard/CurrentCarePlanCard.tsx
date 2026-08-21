import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import './CurrentCarePlanCard.css';

export const CurrentCarePlanCard: React.FC = () => {
  const { activeCarePlan } = usePatient();
  const navigate = useNavigate();

  if (!activeCarePlan) return null;

  const desc = (activeCarePlan.description || '').toLowerCase();
  const title = (activeCarePlan.title || '').toLowerCase();
  
  let priorityLevel = 'normal';
  if (desc.includes('priority: critical') || title.includes('emergency')) {
    priorityLevel = 'critical';
  } else if (desc.includes('priority: high')) {
    priorityLevel = 'high';
  }

  let highlightClass = activeCarePlan.isNew ? 'is-new-highlight' : '';
  if (priorityLevel === 'critical') highlightClass = 'is-critical-highlight';
  if (priorityLevel === 'high') highlightClass = 'is-high-highlight';

  return (
    <section className="current-care-plan-section">
      <h2 className="section-title">Current Care Plan</h2>

      <div 
        className={`care-plan-banner-card ${highlightClass}`}
        onClick={() => navigate('/care-plan')}
        role="button"
        tabIndex={0}
      >
        <div className="banner-left">
          <div className={`banner-icon-box priority-${priorityLevel}`}>
            <FileText size={20} className="file-icon" />
          </div>
          <div className="banner-text">
            <h3 className={`banner-title priority-${priorityLevel}-text`}>{activeCarePlan.title}</h3>
            <p className="banner-desc">{activeCarePlan.subtitle || activeCarePlan.description}</p>
          </div>
        </div>

        <div className="banner-right">
          <div className={`active-status-badge priority-${priorityLevel}-badge`}>
            <span className="status-dot" />
            <span>{activeCarePlan.status}</span>
          </div>

          <button 
            className="arrow-circle-btn" 
            aria-label="View care plan details"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/care-plan');
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};
