import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../../context/PatientContext';
import './RecentActivityTimeline.css';

export const RecentActivityTimeline: React.FC = () => {
  const { recentActivities } = usePatient();
  const navigate = useNavigate();

  return (
    <section className="recent-activity-section">
      <div className="section-header-row">
        <h2 className="section-title">Recent Activity</h2>
        <button 
          className="view-all-link" 
          onClick={() => navigate('/history')}
        >
          View all history
        </button>
      </div>

      <div className="activity-timeline-card">
        <div className="timeline-items-list">
          {recentActivities.map((act, index) => {
            const isLast = index === recentActivities.length - 1;
            return (
              <div key={act.id} className="timeline-row-item">
                <div className="timeline-node-column">
                  <div className={`timeline-dot dot-${act.color}`} />
                  {!isLast && <div className="timeline-vertical-line" />}
                </div>

                <div className="timeline-details">
                  <div className="timeline-title-row">
                    <span className="activity-type-title">{act.type}</span>
                    <span className="activity-date-badge">{act.date}</span>
                  </div>
                  <span className="activity-facility-name">{act.facility}</span>
                  {act.notes && (
                    <p className="activity-note-text">{act.notes}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
