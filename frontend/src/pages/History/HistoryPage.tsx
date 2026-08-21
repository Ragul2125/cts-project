import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  History as HistoryIcon, 
  Search, 
  Filter, 
  Calendar, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  Stethoscope,
  Building2,
  Video
} from 'lucide-react';
import { usePatient } from '../../context/PatientContext';

import './HistoryPage.css';

export const HistoryPage: React.FC = () => {
  const { historyRecords } = usePatient();
  const [filterType, setFilterType] = useState<'ALL' | 'Assessment' | 'Emergency' | 'Clinic Visit' | 'Telehealth' | 'Pre-Care' | 'Post-Care'>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  const filteredRecords = historyRecords.filter(r => {
    if (filterType === 'ALL') return true;
    return r.type === filterType;
  });

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'Emergency':
        return <AlertCircle size={20} className="hist-icon red-icon" />;
      case 'Assessment':
        return <Activity size={20} className="hist-icon blue-icon" />;
      case 'Telehealth':
        return <Video size={20} className="hist-icon green-icon" />;
      default:
        return <Building2 size={20} className="hist-icon blue-icon" />;
    }
  };

  return (
    <div className="history-page animate-fade-in">
      <header className="page-header">
        <div className="header-titles">
          <h1 className="page-title">Care History</h1>
          <p className="page-subtitle">Complete chronological record of your medical encounters and triage assessments.</p>
        </div>

        {/* Filter Pills */}
        <div className="history-filter-pills">
          {(['ALL', 'Assessment', 'Emergency', 'Clinic Visit', 'Telehealth', 'Pre-Care', 'Post-Care'] as const).map(type => (
            <button
              key={type}
              type="button"
              className={`filter-pill ${filterType === type ? 'active' : ''}`}
              onClick={() => setFilterType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </header>

      {/* History Timeline List */}
      <div className="history-list-container">
        {filteredRecords.map(record => (
          <div 
            key={record.id} 
            className="history-card card card-interactive"
            onClick={() => setSelectedRecord(record)}
            role="button"
            tabIndex={0}
          >
            <div className="history-icon-col">
              {getRecordIcon(record.type)}
            </div>

            <div className="history-main-details">
              <div className="hist-top-row">
                <span className="hist-type-badge">{record.type}</span>
                <span className="hist-date">{record.date}</span>
              </div>

              <h3 className="hist-title">{record.title}</h3>
              <p className="hist-facility">{record.providerOrLocation}</p>

              <div className="hist-symptoms-tags">
                {record.symptoms.map((s: any, i: number) => (
                  <span key={i} className="hist-symptom-tag">{s}</span>
                ))}
              </div>
            </div>

            <div className="history-status-col">
              <span className={`badge ${record.status === 'Resolved' ? 'badge-neutral' : record.status === 'Completed' ? 'badge-success' : 'badge-primary'}`}>
                {record.status}
              </span>
              <ChevronRight size={18} className="hist-arrow" />
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedRecord && createPortal(
        <div className="modal-backdrop" onClick={() => setSelectedRecord(null)}>
          <div className="modal-content card animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{selectedRecord.title}</h3>
                <span className="modal-sub">{selectedRecord.providerOrLocation} • {selectedRecord.date}</span>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedRecord(null)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="modal-info-block">
                <strong>Recommendation / Action Taken:</strong>
                <p>{selectedRecord.recommendation}</p>
              </div>

              <div className="modal-info-block">
                <strong>Symptoms Evaluated:</strong>
                <div className="hist-symptoms-tags" style={{ marginTop: '4px' }}>
                  {selectedRecord.symptoms.map((s: any, i: number) => (
                    <span key={i} className="hist-symptom-tag">{s}</span>
                  ))}
                </div>
              </div>

              <div className="modal-info-block">
                <strong>Clinical Notes & Findings:</strong>
                <p className="modal-desc">{selectedRecord.notes}</p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setSelectedRecord(null)}>Close Record</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
