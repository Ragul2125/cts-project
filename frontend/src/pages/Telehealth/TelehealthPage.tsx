import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Calendar, Star, Phone, ArrowLeft, Clock } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import './TelehealthPage.css';


const initialProviders: any[] = [
  { id: 'prov-1', name: 'Dr. Sarah Jenkins', specialty: 'Primary Care Physician', availability: 'Next available: Today, 2:30 PM', phone: '(555) 123-4567' },
  { id: 'prov-2', name: 'Dr. Michael Chen', specialty: 'Cardiologist', availability: 'Next available: Tomorrow, 9:00 AM', phone: '(555) 987-6543' },
  { id: 'prov-3', name: 'Dr. Emily Rodriguez', specialty: 'Pulmonologist', availability: 'Next available: Today, 4:15 PM', phone: '(555) 456-7890' }
];


export const TelehealthPage: React.FC = () => {
  const { activeCarePlan } = usePatient();
  const navigate = useNavigate();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  // Simple heuristic to highlight recommended provider based on care plan title or desc
  const isRespiratory = activeCarePlan?.title.toLowerCase().includes('breath') || 
                        activeCarePlan?.title.toLowerCase().includes('chest') ||
                        activeCarePlan?.description.toLowerCase().includes('breath');
  
  const recommendedProviderId = isRespiratory ? 'prov-3' : 'prov-1';

  const handleSchedule = (providerId: string) => {
    setSelectedProvider(providerId);
    setTimeout(() => {
      alert(`Appointment requested with provider ${providerId}. Check your dashboard shortly!`);
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="telehealth-page animate-fade-in">
      <header className="telehealth-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <div className="header-titles">
          <h1 className="page-title">Virtual Care Providers</h1>
          <p className="page-subtitle">Schedule a telehealth consultation</p>
        </div>
      </header>

      <div className="telehealth-content">
        <div className="recommendation-banner">
          <Star className="banner-icon" size={24} />
          <div className="banner-text">
            <h3>AI Recommendations Active</h3>
            <p>Based on your recent triage assessment, we have highlighted the most appropriate specialists for your condition.</p>
          </div>
        </div>

        <div className="providers-grid">
          {initialProviders.map((provider: any) => {
            const isRecommended = provider.id === recommendedProviderId;

            return (
              <div key={provider.id} className={`provider-card ${isRecommended ? 'recommended-card' : ''}`}>
                {isRecommended && (
                  <div className="recommended-ribbon">
                    Recommended by AI
                  </div>
                )}
                <div className="provider-info">
                  <div className="provider-avatar">
                    <Video size={28} />
                  </div>
                  <div className="provider-details">
                    <h3 className="provider-name">{provider.name}</h3>
                    <span className="provider-specialty">{provider.specialty}</span>
                  </div>
                </div>

                <div className="provider-meta">
                  <div className="meta-item">
                    <Clock size={16} />
                    <span>{provider.availability}</span>
                  </div>
                  <div className="meta-item">
                    <Phone size={16} />
                    <span>{provider.phone}</span>
                  </div>
                </div>

                <button 
                  className={`schedule-btn ${isRecommended ? 'primary-btn' : 'secondary-btn'}`}
                  onClick={() => handleSchedule(provider)}
                  disabled={selectedProvider === provider.id}
                >
                  <Calendar size={16} />
                  <span>{selectedProvider === provider.id ? 'Scheduling...' : 'Schedule Appointment'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TelehealthPage;
