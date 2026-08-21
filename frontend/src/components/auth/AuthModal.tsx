import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Lock, Mail, UserCheck, ShieldCheck, AlertCircle } from 'lucide-react';
import { apiService } from '../../services/api';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('patient204@example.com');
  const [password, setPassword] = useState<string>('password123');
  const [role, setRole] = useState<string>('PATIENT');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        // POST /api/v1/auth/login
        await apiService.login({ email, password });
        setSuccessMsg('Login successful!');
        setTimeout(() => {
          onSuccess(email);
          onClose();
        }, 500);
      } else {
        // POST /api/v1/auth/register
        await apiService.register({ email, password, role });
        setSuccessMsg('Registration successful! Logging in...');
        await apiService.login({ email, password });
        setTimeout(() => {
          onSuccess(email);
          onClose();
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="auth-modal-overlay">
      <div className="auth-modal-card animate-fade-in">
        <button className="auth-close-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="auth-header">
          <div className="auth-icon-badge">
            <ShieldCheck size={28} color="#0062eb" />
          </div>
          <h2>{isLogin ? 'Sign In to CarePath AI' : 'Create CarePath Account'}</h2>
          <p>{isLogin ? 'Access your medical history, care plans & live triage' : 'Register to manage patient assessments and care plans'}</p>
        </div>

        {error && (
          <div className="auth-alert error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-alert success">
            <UserCheck size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Role</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="role-select">
                <option value="PATIENT">Patient</option>
                <option value="HOSPITAL_STAFF">Hospital Staff</option>
                <option value="CMS_ANALYST">CMS Analyst</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Register Account'}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button type="button" onClick={() => setIsLogin(false)} className="auth-switch-btn">
                Register now
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button type="button" onClick={() => setIsLogin(true)} className="auth-switch-btn">
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
