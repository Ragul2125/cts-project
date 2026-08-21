import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  FolderClosed, 
  FileText, 
  History as HistoryIcon, 
  HelpCircle, 
  Settings as SettingsIcon,
  ShieldAlert,
  Activity
} from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import './Sidebar.css';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { patient } = usePatient();
  const navigate = useNavigate();

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Brand Logo */}
        <div className="sidebar-brand" onClick={() => navigate('/dashboard')} role="button" tabIndex={0}>
          <div className="brand-icon-wrapper">
            <svg className="brand-logo-svg" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="6" fill="#006EB6"/>
              <rect x="11" y="3"  width="6" height="22" rx="1.5" fill="white"/>
              <rect x="3"  y="11" width="22" height="6"  rx="1.5" fill="white"/>
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-title">CTS Healthcare</span>
            <span className="brand-subtitle">Patient Portal</span>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="sidebar-nav">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <div className="link-content">
              <LayoutGrid size={20} className="link-icon" />
              <span>Dashboard</span>
            </div>
            <span className="active-indicator" />
          </NavLink>

          <NavLink 
            to="/files" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <div className="link-content">
              <FolderClosed size={20} className="link-icon" />
              <span>Medical Files</span>
            </div>
            <span className="active-indicator" />
          </NavLink>

          <NavLink 
            to="/care-plan" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <div className="link-content">
              <FileText size={20} className="link-icon" />
              <span>Care Plan</span>
            </div>
            <span className="active-indicator" />
          </NavLink>

          <NavLink 
            to="/history" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <div className="link-content">
              <HistoryIcon size={20} className="link-icon" />
              <span>History</span>
            </div>
            <span className="active-indicator" />
          </NavLink>
        </nav>

        {/* Secondary Links & Footer */}
        <div className="sidebar-footer-group">
          <div className="sidebar-emergency" style={{ padding: '0 16px', marginBottom: '16px' }}>
            <a href="tel:911" className="btn btn-danger" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <ShieldAlert size={16} />
              <span>Call 911</span>
            </a>
          </div>
          <nav className="sidebar-secondary-nav">
            <NavLink 
              to="/help" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <div className="link-content">
                <HelpCircle size={20} className="link-icon" />
                <span>Help & Support</span>
              </div>
              <span className="active-indicator" />
            </NavLink>

            <NavLink 
              to="/settings" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <div className="link-content">
                <SettingsIcon size={20} className="link-icon" />
                <span>Settings</span>
              </div>
              <span className="active-indicator" />
            </NavLink>
          </nav>

          {/* Patient Profile Quick Card */}
          <div 
            className="sidebar-user" 
            onClick={() => {
              navigate('/profile');
              handleNavClick();
            }}
            title={`View ${patient.name} profile`}
            role="button"
            tabIndex={0}
          >
            <div className="user-avatar-wrapper">
              <div className="user-avatar">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
                  alt={patient.name}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="avatar-fallback">{patient.name.charAt(0)}</span>
              </div>
            </div>
            <div className="user-info">
              <span className="user-name">{patient.name}</span>
              <span className="user-id">Patient • {patient.displayId}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
