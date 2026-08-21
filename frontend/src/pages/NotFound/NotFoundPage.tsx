import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import './NotFoundPage.css';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page animate-fade-in">
      <div className="not-found-card card">
        <div className="not-found-icon">
          <ShieldAlert size={48} color="#0062eb" />
        </div>
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-text">
          The healthcare portal screen you are trying to access does not exist or has been relocated.
        </p>

        <div className="not-found-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>
          
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={() => navigate('/dashboard')}
          >
            <Home size={16} />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
