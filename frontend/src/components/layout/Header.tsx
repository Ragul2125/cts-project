import React, { useState, useEffect } from 'react';
import { Menu, Bell, Download, ShieldCheck, CheckCircle2, AlertCircle, LogIn, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../../context/PatientContext';
import { apiService, getAuthToken } from '../../services/api';
import { AuthModal } from '../auth/AuthModal';
import './Header.css';

interface HeaderProps {
  onMenuToggle?: () => void;
  showPwaPrompt?: boolean;
  onInstallPwa?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, showPwaPrompt, onInstallPwa }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const { patient, refreshBackendData } = usePatient();
  const navigate = useNavigate();

  useEffect(() => {
    // Check FastAPI health
    apiService.checkHealth()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));

    const token = getAuthToken();
    if (token) {
      setCurrentUserEmail('patient204@example.com');
    }
  }, []);

  const handleAuthSuccess = (email: string) => {
    setCurrentUserEmail(email);
    refreshBackendData();
  };

  const handleSignOut = () => {
    localStorage.removeItem('carepath_auth_token');
    setCurrentUserEmail(null);
    navigate('/login');
  };

  const notifications = [
    {
      id: 'notif-1',
      title: 'Care Plan Update',
      desc: 'Post-Viral Respiratory Recovery tracking active.',
      time: '10m ago',
      unread: true
    },
    {
      id: 'notif-2',
      title: 'Vitals Recorded',
      desc: 'Latest BP verified stable at 120/80 mmHg.',
      time: '2h ago',
      unread: false
    }
  ];

  return (
    <header className="app-header">
      <div className="header-left">
        {onMenuToggle && (
          <button 
            className="header-icon-btn mobile-menu-trigger" 
            onClick={onMenuToggle}
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="header-mobile-brand" onClick={() => navigate('/dashboard')}>
          <div className="mobile-brand-icon">
            <ShieldCheck size={18} color="#0062eb" />
          </div>
          <span className="mobile-brand-title">CareNexus AI</span>
        </div>

        {/* Backend Health Badge */}
        <div className="backend-health-pill" title="FastAPI Backend Connectivity (GET /health)">
          <span className={`status-dot ${backendOnline ? 'online' : 'offline'}`} />
          <span className="status-text">
            API: {backendOnline === null ? 'Connecting...' : backendOnline ? 'Online (200 OK)' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="header-right">
        {showPwaPrompt && (
          <button 
            className="pwa-quick-install-btn" 
            onClick={onInstallPwa}
            title="Install CareNexus AI App"
          >
            <Download size={15} />
            <span>Install App</span>
          </button>
        )}

        <div className="notification-wrapper">
          <button 
            className={`header-icon-btn ${showNotifications ? 'active' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="notification-dot" />
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <span className="notifications-title">Notifications</span>
                <span className="notifications-badge">1 new</span>
              </div>
              <div className="notifications-list">
                {notifications.map(n => (
                  <div key={n.id} className={`notification-item ${n.unread ? 'unread' : ''}`}>
                    <div className="notif-content">
                      <div className="notif-top">
                        <span className="notif-title">{n.title}</span>
                        <span className="notif-time">{n.time}</span>
                      </div>
                      <p className="notif-desc">{n.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button 
          className="header-signout-btn" 
          onClick={handleSignOut}
          title="Sign Out of CareNexus Portal"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};
