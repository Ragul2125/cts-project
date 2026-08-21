import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  ShieldCheck, 
  Bell, 
  Lock, 
  Download, 
  RotateCcw, 
  Smartphone, 
  Eye, 
  Check, 
  Trash2 
} from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import './SettingsPage.css';

export const SettingsPage: React.FC = () => {
  const { patient, resetToDefaults } = usePatient();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [biometricLogin, setBiometricLogin] = useState(true);
  const [offlineSync, setOfflineSync] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(patient, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `CarePath_Patient_Data_${patient.displayId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Health data exported successfully.');
  };

  return (
    <div className="settings-page animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Settings & Preferences</h1>
        <p className="page-subtitle">Manage application preferences, notifications, security, and offline PWA data.</p>
      </header>

      {toastMessage && (
        <div className="settings-toast-banner">
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="settings-sections-grid">
        {/* Security & Authentication */}
        <div className="settings-card card">
          <div className="settings-card-header">
            <Lock size={18} className="blue-icon" />
            <h3>Security & Login</h3>
          </div>

          <div className="settings-options-list">
            <div className="settings-option-item">
              <div>
                <span className="opt-title">Biometric / Touch ID Login</span>
                <p className="opt-desc">Enable fingerprint or face unlock for faster PWA access.</p>
              </div>
              <label className="switch-control">
                <input 
                  type="checkbox" 
                  checked={biometricLogin} 
                  onChange={e => setBiometricLogin(e.target.checked)} 
                />
                <span className="switch-slider" />
              </label>
            </div>

            <div className="settings-option-item">
              <div>
                <span className="opt-title">HIPAA Encrypted Local Storage</span>
                <p className="opt-desc">AES-256 encrypted sandbox for offline health documents.</p>
              </div>
              <span className="badge badge-success">Active</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-card card">
          <div className="settings-card-header">
            <Bell size={18} className="blue-icon" />
            <h3>Notifications</h3>
          </div>

          <div className="settings-options-list">
            <div className="settings-option-item">
              <div>
                <span className="opt-title">Care Plan Reminders</span>
                <p className="opt-desc">Receive prompts for daily vitals, temperature, and medications.</p>
              </div>
              <label className="switch-control">
                <input 
                  type="checkbox" 
                  checked={emailAlerts} 
                  onChange={e => setEmailAlerts(e.target.checked)} 
                />
                <span className="switch-slider" />
              </label>
            </div>

            <div className="settings-option-item">
              <div>
                <span className="opt-title">SMS Urgent Care Alerts</span>
                <p className="opt-desc">Direct text notifications if safety protocol is triggered.</p>
              </div>
              <label className="switch-control">
                <input 
                  type="checkbox" 
                  checked={smsAlerts} 
                  onChange={e => setSmsAlerts(e.target.checked)} 
                />
                <span className="switch-slider" />
              </label>
            </div>
          </div>
        </div>

        {/* PWA & Data Management */}
        <div className="settings-card card">
          <div className="settings-card-header">
            <Smartphone size={18} className="blue-icon" />
            <h3>PWA Offline & Data</h3>
          </div>

          <div className="settings-options-list">
            <div className="settings-option-item">
              <div>
                <span className="opt-title">Offline Document Sync</span>
                <p className="opt-desc">Cache your latest care plans and medical records for offline viewing.</p>
              </div>
              <label className="switch-control">
                <input 
                  type="checkbox" 
                  checked={offlineSync} 
                  onChange={e => setOfflineSync(e.target.checked)} 
                />
                <span className="switch-slider" />
              </label>
            </div>

            <div className="settings-btn-row">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleExportData}
              >
                <Download size={15} />
                <span>Export My Health Data (JSON)</span>
              </button>

              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={() => setShowResetConfirm(true)}
              >
                <RotateCcw size={15} />
                <span>Reset Demo State to Initial</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && createPortal(
        <div className="modal-backdrop" onClick={() => setShowResetConfirm(false)}>
          <div className="modal-content card animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reset Demo Data</h3>
              <button className="modal-close-btn" onClick={() => setShowResetConfirm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>This will restore all patient records, assessment drafts, care plans, and uploaded files back to initial demo defaults.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowResetConfirm(false)}>Cancel</button>
              <button 
                className="btn btn-danger" 
                onClick={() => {
                  resetToDefaults();
                  setShowResetConfirm(false);
                  showToast('Data reset to default demo baseline.');
                }}
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
