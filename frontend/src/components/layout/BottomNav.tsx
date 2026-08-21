import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, FolderClosed, FileText, History as HistoryIcon, User } from 'lucide-react';
import './BottomNav.css';

export const BottomNav: React.FC = () => {
  return (
    <nav className="bottom-nav">
      <NavLink 
        to="/dashboard" 
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <LayoutGrid size={20} />
        <span>Dashboard</span>
      </NavLink>

      <NavLink 
        to="/files" 
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <FolderClosed size={20} />
        <span>Files</span>
      </NavLink>

      <NavLink 
        to="/care-plan" 
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <FileText size={20} />
        <span>Care Plan</span>
      </NavLink>

      <NavLink 
        to="/history" 
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <HistoryIcon size={20} />
        <span>History</span>
      </NavLink>

      <NavLink 
        to="/profile" 
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <User size={20} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};
