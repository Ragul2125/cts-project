import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Download, 
  CheckCircle, 
  AlertTriangle,
  AlertCircle,
  Phone, 
  Calendar, 
  CheckSquare, 
  Square,
  FileCheck,
  Clock,
  ArrowRight,
  User,
  Hospital,
  Star,
  MapPin,
  X,
  Trash2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePatient } from '../../context/PatientContext';
import { CarePlan, TimelineStep } from '../../types';
import { apiService } from '../../services/api';
import './CarePlanPage.css';

export const CarePlanPage: React.FC = () => {
  const { 
    carePlans, 
    activeCarePlan, 
    completeCarePlan,
    patient, 
    toggleTimelineStep, 
    toggleDailyGoal,
    refreshBackendData,
    deleteCarePlan,
    bookings,
    addBooking,
    cancelBooking
  } = usePatient();

  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'bookings'>(
    (location.state as any)?.activeTab || 'active'
  );
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [selectedHistoryPlan, setSelectedHistoryPlan] = useState<CarePlan | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [actionModalStep, setActionModalStep] = useState<TimelineStep | null>(null);
  const [symptomLogInput, setSymptomLogInput] = useState('');
  const [o2Input, setO2Input] = useState('98');
  
  const [isFindingFacility, setIsFindingFacility] = useState(false);
  const [facilityResult, setFacilityResult] = useState<any>(null);
  const [facilityTier, setFacilityTier] = useState<string>('');

  // Booking modal state
  const [bookingFacility, setBookingFacility] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('09:00 AM');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const currentPlan = activeCarePlan;

  const handleFindProvider = async (tier: string) => {
    setIsFindingFacility(true);
    setFacilityResult(null);
    setFacilityTier(tier);
    try {
      const payload = {
        patient_zip: "10001",
        triage_output: {
          care_tier: tier,
          symptoms_reported: [`Primary: ${currentPlan?.title || 'General'}`, "Duration: 2 days", "Pain Scale: 6/10"],
          recent_patterns: ["Type 2 Diabetes", "Hypertension"]
        }
      };
      const res = await apiService.getFacilityRecommendation(payload);
      setFacilityResult(res);
    } catch (err) {
      console.error("Failed to find provider:", err);
    } finally {
      setIsFindingFacility(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!bookingFacility || !bookingDate) return;
    setIsBooking(true);
    try {
      const res = await apiService.bookAppointment({
        patient_id: patient.displayId || '204',
        facility_name: bookingFacility.facility_name,
        specialty: bookingFacility.specialty,
        care_tier: facilityTier,
        appointment_date: bookingDate,
        appointment_time: bookingTime,
        notes: bookingNotes
      });
      setBookingSuccess(res.message);
      
      addBooking({
        id: res.encounter_id || `bkg-${Date.now()}`,
        providerId: bookingFacility.id || 'prov-1',
        providerName: bookingFacility.facility_name,
        providerSpecialty: bookingFacility.specialty || facilityTier,
        date: bookingDate,
        time: bookingTime,
        reason: currentPlan?.title || 'General Consultation',
        status: 'Scheduled'
      });
      
      await refreshBackendData();
    } catch (err) {
      console.error('Booking failed:', err);
    } finally {
      setIsBooking(false);
    }
  };

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(0, 98, 235);
      doc.text('CarePath AI — Personalized Care Plan', 20, 22);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Patient: ${patient.name} (${patient.displayId}) | Generated: ${new Date().toLocaleDateString()}`, 20, 30);
      doc.line(20, 34, 190, 34);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`Plan: ${currentPlan?.title}`, 20, 44);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(currentPlan?.description || '', 20, 52, { maxWidth: 170 });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Recovery Timeline Milestones:', 20, 68);

      let y = 78;
      currentPlan?.timeline.forEach(step => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(0, 98, 235);
        doc.text(`[${step.stepNumber}] ${step.title} — Timing: ${step.timing}`, 20, y);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(step.description, 25, y + 6, { maxWidth: 165 });
        y += 18;
      });

      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(220, 38, 38);
      doc.text('Safety Protocol & Urgent Help Triggers:', 20, y);

      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(120, 20, 20);
      currentPlan?.safetyProtocol.urgentHelpTriggers.forEach(trigger => {
        doc.text(`• ${trigger}`, 25, y);
        y += 6;
      });

      doc.save(`CarePath_CarePlan_${patient.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const getPriorityStyle = (desc: string) => {
    if (!desc) return '';
    const lower = desc.toLowerCase();
    if (lower.includes('priority: critical')) return 'priority-critical';
    if (lower.includes('priority: high')) return 'priority-high';
    if (lower.includes('priority: medium')) return 'priority-medium';
    if (lower.includes('priority: low') || lower.includes('priority: normal')) return 'priority-low';
    return '';
  };

  const getPriorityBadge = (desc: string) => {
    if (!desc) return null;
    const lower = desc.toLowerCase();
    if (lower.includes('priority: critical')) {
      return <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={12} /> Critical Priority</span>;
    }
    if (lower.includes('priority: high')) {
      return <span className="badge" style={{ backgroundColor: '#ffedd5', color: '#9a3412', border: '1px solid #fdba74', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={12} /> High Priority</span>;
    }
    if (lower.includes('priority: medium')) {
      return <span className="badge" style={{ backgroundColor: '#fef9c3', color: '#854d0e', border: '1px solid #fde047' }}>Medium Priority</span>;
    }
    if (lower.includes('priority: low') || lower.includes('priority: normal')) {
      return <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac' }}>Normal Priority</span>;
    }
    return null;
  };

  const cleanDescription = (desc: string) => {
    if (!desc) return '';
    return desc.replace(/Priority:\s*[a-zA-Z]+.?$/i, '').trim();
  };

  return (
    <div className="care-plan-page animate-fade-in">
      {/* Top Header */}
      <header className="care-plan-header">
        <div className="header-titles">
          <h1 className="page-title">Care Plan</h1>
          <p className="page-subtitle">Your personalized recovery and monitoring schedule.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {activeTab === 'active' && currentPlan && (
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => completeCarePlan(currentPlan.id)}
            >
              <CheckCircle size={16} />
              <span>Complete Care Plan</span>
            </button>
          )}

          <button 
            type="button" 
            className="btn btn-primary download-pdf-btn" 
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf || !currentPlan}
          >
            <Download size={16} />
            <span>{isGeneratingPdf ? 'Exporting...' : 'Download PDF'}</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="care-plan-tabs">
        <button
          type="button"
          className={`tab-item ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          ACTIVE PLAN
        </button>
        <button 
          className={`tab-item ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <Clock size={18} />
          <span>History</span>
        </button>
        <button 
          className={`tab-item ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          <Calendar size={18} />
          <span>Upcoming Bookings</span>
        </button>
      </div>

      {activeTab === 'active' && !currentPlan && (
        <div className="active-plan-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', textAlign: 'center', padding: '40px' }}>
          <CheckCircle size={64} color="#10b981" style={{ marginBottom: '20px' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>All Caught Up!</h2>
          <p style={{ color: '#475569', maxWidth: '400px', marginTop: '12px', lineHeight: 1.5 }}>
            Great job! You have successfully completed your requested care plan. Your dashboard is clear, and your clinical team has been notified of your progress.
          </p>
          <button className="btn btn-primary" style={{ marginTop: '24px' }} onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </button>
        </div>
      )}

      {activeTab === 'active' && currentPlan && (
        <div className="active-plan-container">
          {/* Active Plan Overview Card */}
          <div className="plan-summary-banner">
            <div className="plan-summary-top">
              <div className="plan-status-pill">
                <span className="status-dot" />
                <span>{currentPlan.status}</span>
              </div>
              <span className="plan-created-date">Created: {currentPlan.createdDate}</span>
            </div>

            <h2 className="plan-title">{currentPlan?.title}</h2>
            <p className="plan-desc">{currentPlan.description}</p>
            {currentPlan.subtitle && (
              <div className="plan-rationale-box" style={{ 
                marginTop: '16px', 
                padding: '12px 16px', 
                backgroundColor: '#eff6ff', 
                borderRadius: '8px',
                borderLeft: '4px solid #3b82f6', 
                fontSize: '0.875rem',
                lineHeight: '1.5',
                color: '#1e40af'
              }}>
                <strong>Clinical Rationale:</strong> {currentPlan.subtitle}
              </div>
            )}
          </div>

          {/* Emergency Alert (ED only) */}
          {(currentPlan.category === 'ED' || currentPlan.category === 'Emergency') && (
            <div className="emergency-ed-alert">
              <AlertTriangle size={24} className="ed-alert-icon" />
              <div className="ed-alert-content">
                <h3>Emergency Care Recommended</h3>
                <p>Based on your symptoms, we strongly advise visiting the nearest Emergency Department immediately.</p>
              </div>
            </div>
          )}

          {/* Care Pathways (Always show) */}
          {(
            <div className="care-pathways-section">
              <h3 className="section-title">Available Care Pathways</h3>
              <div className="pathway-buttons-grid">
                <button
                  type="button"
                  className={`pathway-btn ${currentPlan.category === 'Telehealth' ? 'recommended' : ''}`}
                  onClick={() => navigate('/telehealth')}
                >
                  {currentPlan.category === 'Telehealth' && <span className="recommended-badge">Recommended by AI</span>}
                  <Phone size={20} className="pathway-icon" />
                  <span className="pathway-text">Telehealth</span>
                </button>
                
                <button
                  type="button"
                  className={`pathway-btn ${currentPlan.category === 'Urgent Care' ? 'recommended' : ''}`}
                  onClick={() => handleFindProvider('Urgent Care')}
                >
                  {currentPlan.category === 'Urgent Care' && <span className="recommended-badge">Recommended by AI</span>}
                  <Calendar size={20} className="pathway-icon" />
                  <span className="pathway-text">Find Urgent Care</span>
                </button>

                <button
                  type="button"
                  className={`pathway-btn ${currentPlan.category === 'PCP' ? 'recommended' : ''}`}
                  onClick={() => handleFindProvider('PCP')}
                >
                  {currentPlan.category === 'PCP' && <span className="recommended-badge">Recommended by AI</span>}
                  <User size={20} className="pathway-icon" />
                  <span className="pathway-text">Find Primary Care (PCP)</span>
                </button>

                <button
                  type="button"
                  className={`pathway-btn ${['Self Care', 'Routine'].includes(currentPlan.category) || !['Telehealth', 'Urgent Care', 'PCP', 'Hospital', 'ED', 'Emergency'].includes(currentPlan.category) ? 'recommended' : ''}`}
                  onClick={() => {
                    document.querySelector('.timeline-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  { (['Self Care', 'Routine'].includes(currentPlan.category) || !['Telehealth', 'Urgent Care', 'PCP', 'Hospital', 'ED', 'Emergency'].includes(currentPlan.category)) && <span className="recommended-badge">Recommended by AI</span>}
                  <Clock size={20} className="pathway-icon" />
                  <span className="pathway-text">7-Day Care Plan</span>
                </button>
              </div>
            </div>
          )}


        </div>
      )}

      {/* Facility Search Loading */}
      {isFindingFacility && createPortal(
        <div className="modal-backdrop">
          <div className="modal-content card animate-fade-in">
            <div className="modal-body text-center py-6" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="spinner mb-4" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #0062eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p>AI is analyzing clinic options and matching with your clinical profile...</p>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Ranked Facility Results Modal */}
      {facilityResult && createPortal(
        <div className="modal-backdrop" onClick={() => setFacilityResult(null)}>
          <div className="modal-content card animate-fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '95%' }}>
            <div className="modal-header">
              <h3>Recommended {facilityTier} Facilities</h3>
              <button className="modal-close-btn" onClick={() => setFacilityResult(null)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Top facility */}
              {[facilityResult.top_facility, ...(facilityResult.alternatives || [])].filter(Boolean).map((fac: any, idx: number) => (
                <div key={idx} style={{
                  border: idx === 0 ? '2px solid #0062eb' : '1px solid #e2e8f0',
                  borderRadius: '10px', padding: '14px 16px',
                  backgroundColor: idx === 0 ? '#eff6ff' : '#fff',
                  position: 'relative'
                }}>
                  {idx === 0 && (
                    <span style={{ position: 'absolute', top: '-10px', left: '14px', background: '#0062eb', color: '#fff', fontSize: '0.6875rem', fontWeight: 800, padding: '2px 10px', borderRadius: '20px' }}>
                      ⭐ Best Match
                    </span>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Hospital size={18} color="#0062eb" />
                        <h4 style={{ margin: 0, fontSize: '0.9375rem', color: '#1e293b', fontWeight: 700 }}>{fac.facility_name}</h4>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '0.8125rem', color: '#64748b', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={13} /> {fac.distance_miles?.toFixed(1)} mi
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={13} /> Quality: {fac.quality_score}
                        </span>
                        <span>{fac.specialty}</span>
                      </div>
                      <p style={{ margin: '8px 0 0', fontSize: '0.8125rem', color: '#475569', lineHeight: 1.4 }}>{fac.why_best_match}</p>
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: '0.8125rem', padding: '8px 14px', whiteSpace: 'nowrap' }}
                      onClick={() => {
                        setBookingFacility(fac);
                        setBookingDate('');
                        setBookingNotes('');
                        setBookingSuccess(null);
                      }}
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Appointment Booking Modal */}
      {bookingFacility && createPortal(
        <div className="modal-backdrop" onClick={() => { if (!isBooking) { setBookingFacility(null); setBookingSuccess(null); } }}>
          <div className="modal-content card animate-fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', width: '95%' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Book Appointment</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: '#64748b' }}>{bookingFacility.facility_name}</p>
              </div>
              <button className="modal-close-btn" onClick={() => { setBookingFacility(null); setBookingSuccess(null); }}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {bookingSuccess ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <CheckCircle size={48} color="#10b981" style={{ marginBottom: '12px' }} />
                  <h4 style={{ color: '#065f46', margin: '0 0 8px' }}>Appointment Booked!</h4>
                  <p style={{ color: '#475569', margin: 0, fontSize: '0.9rem' }}>{bookingSuccess}</p>
                  <p style={{ color: '#64748b', fontSize: '0.8125rem', marginTop: '8px' }}>Check your History page for details.</p>
                  <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => { setBookingFacility(null); setFacilityResult(null); setBookingSuccess(null); }}>Done</button>
                </div>
              ) : (
                <>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.875rem', color: '#334155', display: 'block', marginBottom: '6px' }}>Appointment Date *</label>
                    <input
                      type="date"
                      value={bookingDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setBookingDate(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.875rem', color: '#334155', display: 'block', marginBottom: '6px' }}>Preferred Time</label>
                    <select
                      value={bookingTime}
                      onChange={e => setBookingTime(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box', background: '#fff' }}
                    >
                      {['08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM'].map(t => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.875rem', color: '#334155', display: 'block', marginBottom: '6px' }}>Notes (optional)</label>
                    <textarea
                      value={bookingNotes}
                      onChange={e => setBookingNotes(e.target.value)}
                      placeholder="Any specific concerns or notes for the provider..."
                      rows={3}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={() => setBookingFacility(null)} disabled={isBooking}>Cancel</button>
                    <button
                      className="btn btn-primary"
                      onClick={handleBookAppointment}
                      disabled={!bookingDate || isBooking}
                    >
                      {isBooking ? 'Booking...' : 'Confirm Booking'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="care-plan-history animate-fade-in">
          <div className="section-header">
            <h2>Upcoming Bookings</h2>
            <p>Manage your scheduled appointments and consultations.</p>
          </div>
          {(!bookings || bookings.length === 0) ? (
            <div className="empty-state">
              <div className="empty-icon"><Calendar size={48} /></div>
              <h3>No upcoming bookings</h3>
              <p>You don't have any appointments scheduled at the moment.</p>
            </div>
          ) : (
            <div className="bookings-grid">
              {bookings.map(booking => (
                <div key={booking.id} className="booking-card animate-fade-in">
                  <div className="booking-card-header">
                    <div className="booking-icon-wrapper">
                      <Calendar size={24} className="booking-icon" />
                    </div>
                    <div className="booking-status-badge">
                      <CheckCircle size={14} />
                      <span>{booking.status}</span>
                    </div>
                  </div>
                  
                  <div className="booking-card-body">
                    <h3 className="booking-provider-name">{booking.providerName}</h3>
                    <p className="booking-provider-specialty">{booking.providerSpecialty}</p>
                    
                    {booking.reason && (
                      <div style={{ marginBottom: '16px', fontSize: '0.875rem', color: '#475569', backgroundColor: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', borderLeft: '3px solid #0062eb' }}>
                        <strong>Reason:</strong> {booking.reason}
                      </div>
                    )}
                    
                    <div className="booking-time-row">
                      <div className="booking-time-item">
                        <Calendar size={16} />
                        <span>{booking.date}</span>
                      </div>
                      <div className="booking-time-divider">•</div>
                      <div className="booking-time-item">
                        <Clock size={16} />
                        <span>{booking.time}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="booking-card-footer">
                    <button 
                      className="btn btn-secondary booking-action-btn"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to cancel this booking?')) {
                          cancelBooking(booking.id);
                        }
                      }}
                    >
                      Cancel Booking
                    </button>
                    <button 
                      className="btn btn-primary booking-action-btn"
                      onClick={() => {
                        window.open(`https://maps.google.com/?q=${encodeURIComponent(booking.providerName)}`, '_blank');
                      }}
                    >
                      Get Directions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="care-plan-history-view">
          <div className="history-plans-list">
            {carePlans.map(plan => (
              <div key={plan.id} className={`history-plan-item card ${getPriorityStyle(plan.description)}`}>
                <div className="history-plan-left">
                  <div className="history-plan-tags">
                    <span className={`badge ${plan.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>
                      {plan.status}
                    </span>
                    {getPriorityBadge(plan.description)}
                    <span className="history-date-label">Created: {plan.createdDate}</span>
                  </div>
                  <h3 className="history-plan-title">{plan.title}</h3>
                  <p className="history-plan-desc">{cleanDescription(plan.description)}</p>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary view-details-btn"
                    onClick={() => setSelectedHistoryPlan(plan)}
                  >
                    <span>View Details</span>
                    <ArrowRight size={14} />
                  </button>
                  <button 
                    type="button" 
                    className="btn view-details-btn"
                    style={{ padding: '8px', color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2' }}
                    onClick={() => deleteCarePlan(plan.id)}
                    title="Delete History Record"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Details Modal */}
      {selectedHistoryPlan && createPortal(
        <div className="modal-backdrop" onClick={() => setSelectedHistoryPlan(null)}>
          <div className="modal-content card animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedHistoryPlan.title}</h3>
              <button className="modal-close-btn" onClick={() => setSelectedHistoryPlan(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="modal-desc">{selectedHistoryPlan.description}</p>
              <h4 className="modal-subheading">Milestones:</h4>
              <ul className="modal-milestones-list">
                {selectedHistoryPlan.timeline.map(t => (
                  <li key={t.stepNumber}>
                    <strong>[{t.stepNumber}] {t.title}</strong> — {t.description}
                  </li>
                ))}
              </ul>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setSelectedHistoryPlan(null)}>Close</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Interactive Action Step Modal (e.g. Log Symptoms, O2 Reading) */}
      {actionModalStep && createPortal(
        <div className="modal-backdrop" onClick={() => setActionModalStep(null)}>
          <div className="modal-content card animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{actionModalStep.title}</h3>
              <button className="modal-close-btn" onClick={() => setActionModalStep(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="modal-desc">{actionModalStep.description}</p>
              
              {actionModalStep.actionType === 'log_symptoms' && (
                <div className="modal-form-group">
                  <label>Current Temperature & Notes:</label>
                  <textarea 
                    rows={3} 
                    placeholder="E.g., Temp: 98.6°F, mild dry cough feeling improved..."
                    value={symptomLogInput}
                    onChange={e => setSymptomLogInput(e.target.value)}
                    className="modal-input"
                  />
                </div>
              )}

              {actionModalStep.actionType === 'measure_o2' && (
                <div className="modal-form-group">
                  <label>Pulse Oximeter Reading (SpO₂ %):</label>
                  <input 
                    type="number" 
                    value={o2Input} 
                    onChange={e => setO2Input(e.target.value)}
                    className="modal-input"
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setActionModalStep(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  if (currentPlan) toggleTimelineStep(currentPlan.id, actionModalStep.stepNumber);
                  setActionModalStep(null);
                }}
              >
                Save & Complete Milestone
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
