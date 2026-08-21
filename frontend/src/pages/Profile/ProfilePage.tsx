import React, { useState, useRef } from 'react';
import { 
  Edit3, 
  Camera, 
  CheckCircle2, 
  Droplet, 
  Activity, 
  AlertTriangle, 
  Plus, 
  Settings as SettingsIcon, 
  Phone, 
  Mail, 
  Home, 
  Heart,
  Sliders,
  X
} from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { EditProfileModal } from '../../components/profile/EditProfileModal';
import { apiService } from '../../services/api';
import './ProfilePage.css';

export const ProfilePage: React.FC = () => {
  const { 
    patient, 
    addAllergy, 
    removeAllergy, 
    addCondition, 
    removeCondition, 
    updatePreferences 
  } = usePatient();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddAllergy, setShowAddAllergy] = useState(false);
  const [newAllergyName, setNewAllergyName] = useState('');
  const [showAddCondition, setShowAddCondition] = useState(false);
  const [newConditionName, setNewConditionName] = useState('');
  const [newConditionYear, setNewConditionYear] = useState('2024');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      const patientId = localStorage.getItem('carepath_member_id') || '204';
      await apiService.uploadProfilePicture(patientId, file);
      window.location.reload(); // Quick refresh to grab new data
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      alert('Failed to upload profile picture.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleAddAllergySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAllergyName.trim()) return;
    addAllergy(newAllergyName.trim(), 'Mild');
    setNewAllergyName('');
    setShowAddAllergy(false);
  };

  const handleAddConditionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConditionName.trim()) return;
    addCondition(newConditionName.trim(), newConditionYear);
    setNewConditionName('');
    setShowAddCondition(false);
  };

  return (
    <div className="patient-profile-page animate-fade-in">
      {/* Header */}
      <header className="profile-page-header">
        <div className="header-titles">
          <h1 className="page-title">Patient Profile</h1>
          <p className="page-subtitle">Manage your personal and medical information.</p>
        </div>

        <button 
          type="button" 
          className="btn btn-primary edit-profile-main-btn"
          onClick={() => setShowEditModal(true)}
        >
          <Edit3 size={15} />
          <span>Edit Profile</span>
        </button>
      </header>

      {/* Main Grid */}
      <div className="profile-content-grid">
        {/* Left Column */}
        <div className="profile-left-col">
          {/* Patient Card */}
          <div className="profile-user-card card">
            <div className="avatar-camera-container">
              <div className="profile-main-avatar">
                <img 
                  src={patient.profilePictureUrl ? `http://localhost:8000${patient.profilePictureUrl}` : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80"} 
                  alt={patient.name}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="profile-avatar-fallback">{patient.name.charAt(0)}</span>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                style={{ display: 'none' }} 
                accept="image/*"
              />
              <button 
                className="camera-upload-badge" 
                title="Change Avatar"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
              >
                <Camera size={14} />
              </button>
            </div>

            <h2 className="profile-card-name">{patient.name}</h2>
            <span className="profile-card-id">Case Number: {patient.displayId}</span>

            <div className="profile-status-pill">
              <CheckCircle2 size={13} />
              <span>Status: {patient.status}</span>
            </div>

            <div className="user-meta-details-list">
              <div className="user-meta-item">
                <span className="meta-label">Date of Birth</span>
                <span className="meta-value">{patient.dob} ({patient.age} yrs)</span>
              </div>
              <div className="user-meta-item">
                <span className="meta-label">Biological Sex</span>
                <span className="meta-value">{patient.gender}</span>
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="contact-details-card card">
            <div className="card-section-header">
              <Phone size={18} className="header-icon blue-icon" />
              <h3 className="section-header-title">Contact Details</h3>
            </div>

            <div className="contact-items-list">
              <div className="contact-field-group">
                <span className="field-label">Phone Number</span>
                <div className="contact-input-readonly">
                  <Phone size={15} className="input-icon" />
                  <span>{patient.phone}</span>
                </div>
              </div>

              <div className="contact-field-group">
                <span className="field-label">Email Address</span>
                <div className="contact-input-readonly">
                  <Mail size={15} className="input-icon" />
                  <span>{patient.email}</span>
                </div>
              </div>

              <div className="contact-field-group">
                <span className="field-label">Home Address</span>
                <div className="contact-input-readonly address-box">
                  <Home size={16} className="input-icon address-icon" />
                  <span className="address-text">{patient.address}</span>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="emergency-contact-box">
                <div className="emergency-header">
                  <Heart size={14} className="heart-icon" />
                  <span className="emergency-label">Emergency Contact</span>
                </div>
                <div className="emergency-body">
                  <span className="emergency-name">{patient.emergencyContact.name}</span>
                  <span className="emergency-rel">{patient.emergencyContact.relationship}</span>
                  <a href={`tel:${patient.emergencyContact.phone}`} className="emergency-phone-link">
                    <Phone size={13} />
                    <span>{patient.emergencyContact.phone}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="profile-right-col">
          {/* Medical Information */}
          <div className="medical-info-card card">
            <div className="card-section-header">
              <Activity size={18} className="header-icon blue-icon" />
              <h3 className="section-header-title">Medical Information</h3>
            </div>

            <div className="medical-stats-boxes-row">
              {/* Blood Type Box */}
              <div className="med-stat-box blood-box">
                <div className="med-box-icon-circle pink-circle">
                  <Droplet size={18} />
                </div>
                <div className="med-box-content">
                  <span className="med-box-sub">Blood Type</span>
                  <h4 className="med-box-val">{patient.bloodGroup === 'O+' ? 'O Positive' : patient.bloodGroup}</h4>
                </div>
              </div>

              {/* Latest BP Box */}
              <div className="med-stat-box bp-box">
                <div className="med-box-icon-circle green-circle">
                  <Activity size={18} />
                </div>
                <div className="med-box-content">
                  <span className="med-box-sub">Latest BP (AI Analyzed)</span>
                  <h4 className="med-box-val">{patient.latestBp} <span className="bp-unit">mmHg</span></h4>
                </div>
              </div>
            </div>

            {/* Known Allergies */}
            <div className="allergies-group-section">
              <div className="sub-section-header">
                <AlertTriangle size={15} className="alert-yellow-icon" />
                <span className="sub-section-title">Known Allergies</span>
              </div>

              <div className="allergies-chips-wrap">
                {patient.allergies.map(alg => (
                  <span key={alg.id} className="allergy-removable-chip">
                    <span>{alg.name} {alg.severity ? `(${alg.severity})` : ''}</span>
                    <button 
                      type="button" 
                      onClick={() => removeAllergy(alg.id)}
                      className="remove-chip-btn"
                      title="Remove Allergy"
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}

                {showAddAllergy ? (
                  <form onSubmit={handleAddAllergySubmit} className="add-chip-form">
                    <input 
                      type="text" 
                      placeholder="Allergy name..." 
                      value={newAllergyName}
                      onChange={e => setNewAllergyName(e.target.value)}
                      className="add-chip-input"
                      autoFocus
                    />
                    <button type="submit" className="add-chip-submit-btn">Add</button>
                    <button type="button" onClick={() => setShowAddAllergy(false)} className="add-chip-cancel-btn">✕</button>
                  </form>
                ) : (
                  <button 
                    type="button" 
                    className="add-allergy-trigger-btn"
                    onClick={() => setShowAddAllergy(true)}
                  >
                    <Plus size={13} />
                    <span>Add Allergy</span>
                  </button>
                )}
              </div>
            </div>

            {/* Chronic Conditions */}
            <div className="conditions-group-section">
              <div className="sub-section-header">
                <SettingsIcon size={15} className="settings-blue-icon" />
                <span className="sub-section-title">Chronic Conditions</span>
              </div>

              <div className="conditions-table-list">
                {patient.conditions.map(c => (
                  <div key={c.id} className="condition-row">
                    <span className="condition-name">{c.name}</span>
                    <div className="condition-right">
                      <span className="diagnosed-tag">Diagnosed {c.diagnosedYear}</span>
                      <button 
                        type="button" 
                        onClick={() => removeCondition(c.id)}
                        className="remove-chip-btn"
                        title="Remove condition"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                ))}

                {showAddCondition ? (
                  <form onSubmit={handleAddConditionSubmit} className="add-condition-form">
                    <input 
                      type="text" 
                      placeholder="Condition name..." 
                      value={newConditionName}
                      onChange={e => setNewConditionName(e.target.value)}
                      className="modal-input"
                      required
                    />
                    <input 
                      type="text" 
                      placeholder="Year (e.g. 2024)" 
                      value={newConditionYear}
                      onChange={e => setNewConditionYear(e.target.value)}
                      className="modal-input"
                      style={{ width: '100px' }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px' }}>Save</button>
                    <button type="button" onClick={() => setShowAddCondition(false)} className="btn btn-secondary" style={{ padding: '6px 10px' }}>✕</button>
                  </form>
                ) : (
                  <button 
                    type="button" 
                    className="add-condition-trigger-btn"
                    onClick={() => setShowAddCondition(true)}
                  >
                    <Plus size={14} />
                    <span>Add Condition</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Preferences & Privacy Card */}
          <div className="preferences-privacy-card card">
            <div className="card-section-header">
              <Sliders size={18} className="header-icon blue-icon" />
              <h3 className="section-header-title">Preferences & Privacy</h3>
            </div>

            <div className="preferences-list">
              {/* AI Data Analysis Toggle */}
              <div className="preference-item-row">
                <div className="pref-info">
                  <span className="pref-title">AI Data Analysis</span>
                  <p className="pref-desc">Allow CarePath AI to analyze medical history for insights.</p>
                </div>
                <label className="switch-control">
                  <input 
                    type="checkbox" 
                    checked={patient.preferences.aiDataAnalysis}
                    onChange={e => updatePreferences({ aiDataAnalysis: e.target.checked })}
                  />
                  <span className="switch-slider" />
                </label>
              </div>

              {/* Share with Specialists Toggle */}
              <div className="preference-item-row">
                <div className="pref-info">
                  <span className="pref-title">Share with Specialists</span>
                  <p className="pref-desc">Automatically share updated vitals with referred doctors.</p>
                </div>
                <label className="switch-control">
                  <input 
                    type="checkbox" 
                    checked={patient.preferences.shareWithSpecialists}
                    onChange={e => updatePreferences({ shareWithSpecialists: e.target.checked })}
                  />
                  <span className="switch-slider" />
                </label>
              </div>

              {/* Communication Preference */}
              <div className="preference-item-row comm-pref-row">
                <div className="pref-info">
                  <span className="pref-title">Communication Preference</span>
                  <p className="pref-desc">How you prefer to receive appointment reminders.</p>
                </div>
                <select 
                  value={patient.preferences.communicationPreference}
                  onChange={e => updatePreferences({ communicationPreference: e.target.value as any })}
                  className="comm-select-input"
                >
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="Phone">Phone</option>
                  <option value="Portal">Portal</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && <EditProfileModal onClose={() => setShowEditModal(false)} />}
    </div>
  );
};
