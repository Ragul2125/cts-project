import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import './PatientSummaryCard.css';

export const PatientSummaryCard: React.FC = () => {
  const { patient } = usePatient();

  return (
    <div className="patient-summary-card">
      <div className="patient-header">
        <div className="patient-avatar">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80" 
            alt={patient.name}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="patient-avatar-fallback">{patient.name.charAt(0)}</span>
        </div>
        <div className="patient-id-info">
          <h3 className="patient-name">{patient.name}</h3>
          <span className="patient-id">Case Number: {patient.displayId}</span>
        </div>
      </div>

      <div className="patient-stats-grid">
        <div className="patient-stat">
          <span className="stat-label">BLOOD TYPE</span>
          <span className="stat-value blood-val">{patient.bloodGroup}</span>
        </div>
        <div className="patient-stat">
          <span className="stat-label">AGE</span>
          <span className="stat-value">{patient.age} Years</span>
        </div>
      </div>

      <div className="patient-allergies-section">
        <span className="stat-label">ALLERGIES</span>
        <div className="allergy-tags-row">
          {patient.allergies.map(alg => (
            <span key={alg.id} className="allergy-chip">
              <AlertTriangle size={12} className="allergy-icon" />
              <span>{alg.name}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
