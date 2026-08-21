import React from 'react';
import { Sparkles, CheckCircle2, CircleDashed } from 'lucide-react';
import './AIProcessingOverlay.css';

interface AIProcessingOverlayProps {
  progress: number;
}

export const AIProcessingOverlay: React.FC<AIProcessingOverlayProps> = ({ progress }) => {
  const steps = [
    { label: 'Symptoms collected', threshold: 25 },
    { label: 'Health history reviewed', threshold: 50 },
    { label: 'Safety screening completed', threshold: 75 },
    { label: 'Care options evaluated', threshold: 95 }
  ];

  return (
    <div className="ai-processing-overlay">
      <div className="processing-modal-card animate-fade-in">
        <div className="ai-glow-orb">
          <Sparkles size={32} className="ai-glow-sparkle" />
        </div>

        <h2 className="processing-main-title">Analyzing your assessment...</h2>
        <p className="processing-sub">CarePath AI triage engine is calculating optimal care recommendations.</p>

        {/* Linear progress */}
        <div className="processing-progress-bar">
          <div className="processing-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Step Checkpoints List */}
        <div className="checkpoints-list">
          {steps.map((s, idx) => {
            const isCompleted = progress >= s.threshold;
            const isCurrent = progress < s.threshold && (idx === 0 || progress >= steps[idx - 1].threshold);

            return (
              <div 
                key={s.label} 
                className={`checkpoint-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}
              >
                <div className="checkpoint-icon">
                  {isCompleted ? (
                    <CheckCircle2 size={18} className="check-done" />
                  ) : (
                    <CircleDashed size={18} className="check-pending" />
                  )}
                </div>
                <span className="checkpoint-label">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
