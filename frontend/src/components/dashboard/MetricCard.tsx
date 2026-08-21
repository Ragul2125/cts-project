import React, { ReactNode } from 'react';
import './MetricCard.css';

interface MetricCardProps {
  icon: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  value: string | number;
  label: string;
  subtext?: string;
  isAccent?: boolean;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  iconBgColor = '#eff6ff',
  iconColor = '#0062eb',
  value,
  label,
  subtext,
  isAccent,
  onClick
}) => {
  return (
    <div 
      className={`metric-card ${isAccent ? 'accent-highlight' : ''} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div 
        className="metric-icon-box" 
        style={{ backgroundColor: iconBgColor, color: iconColor }}
      >
        {icon}
      </div>

      <div className="metric-content">
        <span className="metric-value">{value}</span>
        <span className="metric-label">{label}</span>
        {subtext && <span className="metric-subtext">{subtext}</span>}
      </div>
    </div>
  );
};
