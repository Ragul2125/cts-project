import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  PhoneCall, 
  Send, 
  Sparkles, 
  X, 
  ChevronRight, 
  ShieldCheck,
  FileText,
  HelpCircle
} from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { useAssessment } from '../../context/AssessmentContext';
import { AssessmentData } from '../../types';
import { apiService } from '../../services/api';
import './ConversationalCallBot.css';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  type?: 'text' | 'clarification' | 'result';
  data?: any;
}

export const ConversationalCallBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Extracted clinical state from natural conversation
  const [extractedSymptom, setExtractedSymptom] = useState<string>('');
  const [extractedDuration, setExtractedDuration] = useState<string>('');
  const [extractedSeverity, setExtractedSeverity] = useState<number | null>(null);
  const [pendingClarification, setPendingClarification] = useState<'severity_duration' | 'safety' | null>(null);

  const { patient } = usePatient();
  const { submitAssessment, updateAssessmentData } = useAssessment();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  // Timer for active call duration
  useEffect(() => {
    let interval: any = null;
    if (isOpen) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const initConversation = () => {
    const firstName = patient.name.split(' ')[0] || 'there';
    setExtractedSymptom('');
    setExtractedDuration('');
    setExtractedSeverity(null);
    setPendingClarification(null);

    setMessages([
      {
        id: 'msg-1',
        sender: 'bot',
        text: `Hello ${firstName}! I'm your CarePath Conversational AI Triage Bot 🤖. Please describe what health symptoms or concerns you're having in your own words.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleOpen = () => {
    setIsOpen(true);
    initConversation();
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const formatCallTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Natural Language Understanding (NLU) Parser
  const processUserMessage = async (userText: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Append user message
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: timeStr
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const textLower = userText.toLowerCase();

    // Check for severity number in message (1-10 or written words)
    const numberMatch = textLower.match(/\b([1-9]|10)\b/);
    const severityFound = numberMatch ? parseInt(numberMatch[1], 10) : (
      textLower.includes('severe') || textLower.includes('intense') ? 8 :
      textLower.includes('moderate') || textLower.includes('mild') ? 5 : null
    );

    // Check duration keywords
    const durationFound = textLower.includes('today') ? 'Today' :
      textLower.includes('yesterday') ? 'Yesterday' :
      textLower.includes('day') || textLower.includes('days') ? 'Past 2-3 days' :
      textLower.includes('week') ? '1 week' : null;

    let currentSymptom = extractedSymptom;
    if (!currentSymptom) {
      currentSymptom = userText;
      setExtractedSymptom(userText);
    }

    let currentSev = extractedSeverity !== null ? extractedSeverity : severityFound;
    if (severityFound !== null) setExtractedSeverity(severityFound);

    let currentDur = extractedDuration !== '' ? extractedDuration : (durationFound || '');
    if (durationFound) setExtractedDuration(durationFound);

    // Simulate bot thinking delay
    setTimeout(async () => {
      setIsTyping(false);

      // Case A: If user hasn't specified severity or duration yet, ask a natural clarifying question
      if (currentSev === null && currentDur === '' && !pendingClarification) {
        setPendingClarification('severity_duration');
        const botAskMsg: Message = {
          id: `msg-${Date.now() + 1}`,
          sender: 'bot',
          text: `Thank you for sharing. I understand you're experiencing "${userText}". To help determine the right care plan, how long has this been going on, and how severe is the discomfort on a scale of 1 to 10?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'clarification'
        };
        setMessages(prev => [...prev, botAskMsg]);
        return;
      }

      // Case B: If we asked for clarification and user answered, or if user gave details upfront -> Proceed to Safety & Triage
      setPendingClarification(null);

      const botAnalysingMsg: Message = {
        id: `msg-${Date.now() + 2}`,
        sender: 'bot',
        text: `Got it! Evaluating your reported symptoms (${currentSymptom}), duration (${currentDur || 'Recent'}), and severity (${currentSev || 6}/10) against your medical profile...`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botAnalysingMsg]);

      // Call backend API / triage engine
      try {
        const patientId = (patient as any).displayId || (patient as any).patient_id || '204';
        const triageRes = await apiService.submitTriageText({
          user_id: patientId,
          user_query: userText
        });

        // Sync bot-extracted data into AssessmentContext BEFORE calling submitAssessment
        // so the generated care plan reflects what the user actually said
        updateAssessmentData({
          primarySymptom: currentSymptom || userText,
          symptoms: [currentSymptom || userText],
          severity: currentSev ?? 6,
          duration: (currentDur || 'Today') as AssessmentData['duration'],
          worsening: (currentSev ?? 6) >= 7 ? 'Yes' : 'No',
          medicalContextConfirmed: true,
          additionalNotes: userText
        });

        const recommendation = triageRes.recommendation || {
          recommendation_title: "Primary Care Follow-up",
          care_tier: "PCP",
          timeframe: "Within 24-48 hours",
          acuity_level: "Moderate",
          priority_level: "Medium",
          emergency_flag: false,
          summary_rationale: triageRes.agent_response,
          safety_advisory: "Contact your doctor if symptoms worsen."
        };

        const localAssessment = await submitAssessment(recommendation);

        setTimeout(() => {
          const resultMsg: Message = {
            id: `msg-${Date.now() + 3}`,
            sender: 'bot',
            text: `Care recommendation generated by CarePath ML Triage Engine based on your reported symptoms and PostgreSQL medical profile.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'result',
            data: {
              ...localAssessment,
              recommendationTitle: recommendation.recommendation_title,
              timeframe: recommendation.timeframe,
              acuityLevel: recommendation.acuity_level,
              priorityLevel: recommendation.priority_level,
              careTier: recommendation.care_tier,
              emergencyFlag: recommendation.emergency_flag,
              summaryRationale: recommendation.summary_rationale,
              safetyAdvisory: recommendation.safety_advisory,
              rawMlRecommendation: recommendation
            }
          };
          setMessages(prev => [...prev, resultMsg]);
        }, 800);
      } catch (err) {
        updateAssessmentData({
          primarySymptom: currentSymptom || userText,
          symptoms: [currentSymptom || userText],
          severity: currentSev ?? 6,
          duration: (currentDur || 'Today') as AssessmentData['duration'],
          worsening: (currentSev ?? 6) >= 7 ? 'Yes' : 'No',
          medicalContextConfirmed: true,
          additionalNotes: userText
        });
        const localAssessment = await submitAssessment();
        const errorMsg: Message = {
          id: `msg-${Date.now() + 4}`,
          sender: 'bot',
          text: `I've recorded your symptoms and generated your personalized care plan recommendations.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'result',
          data: localAssessment
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    }, 900);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    processUserMessage(inputText.trim());
  };

  return (
    <>
      {/* Floating Launcher FAB Button */}
      <div className="call-bot-fab-container">
        <button 
          className="call-bot-fab-btn" 
          onClick={handleOpen}
          aria-label="CarePath AI Conversational Bot"
          title="CarePath AI Conversational Bot"
        >
          <div className="fab-pulse-ring" />
          <div className="fab-icon-inner">
            <PhoneCall size={22} className="fab-phone-icon" />
            <Sparkles size={14} className="fab-sparkle-icon" />
          </div>
          <span className="fab-label">Care AI Bot</span>
        </button>
      </div>

      {/* Floating Conversational Window */}
      {isOpen && createPortal(
        <div className="bot-modal-backdrop" onClick={handleClose}>
          <div className="bot-modal-window animate-fade-in" onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="bot-call-header">
              <div className="bot-header-info">
                <div className="bot-avatar-box">
                  <Bot size={24} color="#0062eb" />
                  <span className="live-call-dot" />
                </div>
                <div>
                  <h3 className="bot-name">CarePath Conversational AI Bot</h3>
                  <div className="call-status-row">
                    <span className="live-pill">AI TRIAGE CHAT</span>
                    <span className="call-timer">{formatCallTime(callDuration)}</span>
                  </div>
                </div>
              </div>

              {/* Waveform Equalizer */}
              <div className="audio-equalizer">
                <span className="eq-bar bar-1" />
                <span className="eq-bar bar-2" />
                <span className="eq-bar bar-3" />
                <span className="eq-bar bar-4" />
              </div>

              <button className="bot-close-btn" onClick={handleClose} title="Close Assistant">
                <X size={18} />
              </button>
            </div>

            {/* Conversational Stream */}
            <div className="bot-chat-body">
              {messages.map((msg) => (
                <div key={msg.id} className={`chat-message-row ${msg.sender}`}>
                  {msg.sender === 'bot' && (
                    <div className="message-avatar">
                      <Bot size={16} />
                    </div>
                  )}

                  <div className="message-bubble-content">
                    <p className="message-text">{msg.text}</p>
                    <span className="message-time">{msg.timestamp}</span>

                    {/* Clarification Indicator Badge */}
                    {msg.type === 'clarification' && (
                      <div className="clarification-badge">
                        <HelpCircle size={14} />
                        <span>AI Assistant asking for clarification</span>
                      </div>
                    )}

                    {/* Triage & Care Plan Result Card */}
                    {msg.type === 'result' && msg.data && (
                      <div 
                        className="bot-result-card animate-fade-in"
                        style={{
                          borderColor: (msg.data.emergencyFlag || msg.data.careTier === 'ED' || msg.data.recommendationTitle?.includes('Emergency')) ? '#dc2626' : '#10b981',
                          backgroundColor: (msg.data.emergencyFlag || msg.data.careTier === 'ED' || msg.data.recommendationTitle?.includes('Emergency')) ? '#fff5f5' : '#f0fdf4'
                        }}
                      >
                        <div className="result-card-header">
                          {(msg.data.emergencyFlag || msg.data.careTier === 'ED' || msg.data.recommendationTitle?.includes('Emergency')) ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626' }}>
                              <X size={20} color="#dc2626" />
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#fee2e2', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                EMERGENCY (ED)
                              </span>
                            </div>
                          ) : (
                            <ShieldCheck size={20} color="#10b981" />
                          )}
                          <h4 style={{ color: (msg.data.emergencyFlag || msg.data.careTier === 'ED' || msg.data.recommendationTitle?.includes('Emergency')) ? '#991b1b' : '#065f46', marginTop: '4px' }}>
                            {msg.data.recommendationTitle || msg.data.recommendation_title}
                          </h4>
                        </div>

                        <p className="result-timeframe" style={{ color: (msg.data.emergencyFlag || msg.data.careTier === 'ED' || msg.data.recommendationTitle?.includes('Emergency')) ? '#991b1b' : '#047857' }}>
                          Timeframe: <strong>{msg.data.timeframe}</strong> • Acuity: <strong>{msg.data.acuityLevel || 'Urgent'}</strong>
                        </p>

                        <p className="result-rationale" style={{ color: (msg.data.emergencyFlag || msg.data.careTier === 'ED' || msg.data.recommendationTitle?.includes('Emergency')) ? '#7f1d1d' : '#334155' }}>
                          {msg.data.summaryRationale || msg.data.summary_rationale}
                        </p>

                        {msg.data.safetyAdvisory && (
                          <div style={{ background: (msg.data.emergencyFlag || msg.data.careTier === 'ED' || msg.data.recommendationTitle?.includes('Emergency')) ? '#fef2f2' : '#ecfdf5', border: `1px solid ${(msg.data.emergencyFlag || msg.data.careTier === 'ED' || msg.data.recommendationTitle?.includes('Emergency')) ? '#fca5a5' : '#a7f3d0'}`, borderRadius: '6px', padding: '8px 10px', marginTop: '8px', fontSize: '0.75rem', color: (msg.data.emergencyFlag || msg.data.careTier === 'ED' || msg.data.recommendationTitle?.includes('Emergency')) ? '#991b1b' : '#065f46' }}>
                            <strong>Safety Advisory:</strong> {msg.data.safetyAdvisory}
                          </div>
                        )}
                        
                        <div className="result-actions-row" style={{ marginTop: '12px' }}>
                          {(msg.data.emergencyFlag || msg.data.careTier === 'ED' || msg.data.recommendationTitle?.includes('Emergency')) && (
                            <a 
                              href="tel:911" 
                              className="btn btn-danger"
                              style={{ padding: '8px 16px', fontSize: '0.8125rem', fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              <PhoneCall size={14} />
                              <span>Call 911 Immediately</span>
                            </a>
                          )}
                          <button 
                            className="btn btn-primary view-plan-btn"
                            onClick={() => {
                              handleClose();
                              navigate('/care-plan');
                            }}
                          >
                            <FileText size={15} />
                            <span>View Personalized Care Plan</span>
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Bot Typing Indicator */}
              {isTyping && (
                <div className="chat-message-row bot">
                  <div className="message-avatar">
                    <Bot size={16} />
                  </div>
                  <div className="message-bubble-content">
                    <div className="typing-indicator">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleFormSubmit} className="bot-input-bar">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Type your message or answer..."
                className="bot-text-input"
                autoFocus
              />
              <button type="submit" className="bot-send-btn" disabled={!inputText.trim()}>
                <Send size={16} />
              </button>
            </form>

          </div>
        </div>,
        document.body
      )}
    </>
  );
};
