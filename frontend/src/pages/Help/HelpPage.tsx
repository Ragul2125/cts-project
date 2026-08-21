import React, { useState } from 'react';
import { 
  HelpCircle, 
  PhoneCall, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  Send, 
  CheckCircle2 
} from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import './HelpPage.css';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How does CarePath AI formulate care recommendations?',
    answer: 'CarePath AI evaluates your reported symptoms, duration, pain severity scale, and safety red-flags against established clinical triage guidelines and your confirmed chronic health history.'
  },
  {
    id: 'faq-2',
    question: 'Is CarePath AI a substitute for 911 emergency services?',
    answer: 'No. CarePath AI is an educational navigation and triage assistance tool. If you experience severe chest pain, inability to breathe, sudden numbness, or life-threatening symptoms, immediately call 911 or visit the nearest emergency department.'
  },
  {
    id: 'faq-3',
    question: 'How are my uploaded medical files processed?',
    answer: 'Documents uploaded to CarePath AI are parsed in an isolated HIPAA-compliant sandbox. Key biomarkers (e.g., Blood Glucose, BP, Hemoglobin, LDL) are automatically extracted to keep your health context up-to-date.'
  },
  {
    id: 'faq-4',
    question: 'Can I share my Care Plan with my primary doctor?',
    answer: 'Yes! You can click "Download PDF" on the Care Plan page to export a complete clinical summary report for your clinician or caregiver.'
  }
];

export const HelpPage: React.FC = () => {
  const { patient } = usePatient();
  const [openFaq, setOpenFaq] = useState<string | null>('faq-1');
  const [messageText, setMessageText] = useState('');
  const [msgSent, setMsgSent] = useState(false);

  const toggleFaq = (id: string) => {
    setOpenFaq(prev => (prev === id ? null : id));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setMsgSent(true);
    setTimeout(() => {
      setMessageText('');
      setMsgSent(false);
    }, 4000);
  };

  return (
    <div className="help-page animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Help & Support</h1>
        <p className="page-subtitle">Get answers to clinical triage questions or connect directly with our care coordination team.</p>
      </header>

      {/* Urgent Emergency Callout */}
      <div className="urgent-help-banner">
        <div className="urgent-banner-left">
          <AlertTriangle size={24} className="urgent-banner-icon" />
          <div>
            <h3 className="urgent-banner-title">Experiencing a Medical Emergency?</h3>
            <p className="urgent-banner-text">If you have severe chest pain, acute respiratory distress, or stroke signs, call emergency services immediately.</p>
          </div>
        </div>
        <a href="tel:911" className="btn btn-danger call-911-btn">
          <PhoneCall size={16} />
          <span>Call 911</span>
        </a>
      </div>

      <div className="help-content-grid">
        {/* Left Column: FAQ Accordion */}
        <section className="faq-section card">
          <div className="card-section-header">
            <HelpCircle size={18} className="blue-icon" />
            <h3 className="section-header-title">Frequently Asked Questions</h3>
          </div>

          <div className="faq-accordion-list">
            {FAQS.map(faq => {
              const isOpen = openFaq === faq.id;
              return (
                <div key={faq.id} className={`faq-item ${isOpen ? 'open' : ''}`}>
                  <button 
                    type="button" 
                    className="faq-question-btn"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {isOpen && (
                    <div className="faq-answer-body">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Column: Message Care Team */}
        <aside className="contact-care-team card">
          <div className="card-section-header">
            <MessageSquare size={18} className="blue-icon" />
            <h3 className="section-header-title">Message Care Navigator</h3>
          </div>

          <p className="contact-team-sub">
            Have questions regarding your care plan or upcoming appointment? Send a message to your assigned care coordinator.
          </p>

          {msgSent ? (
            <div className="msg-success-box">
              <CheckCircle2 size={24} color="#10b981" />
              <h4>Message Sent to Care Coordinator</h4>
              <p>We typically respond within 2 hours during clinic operation.</p>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="contact-form">
              <div className="modal-form-group">
                <label>Topic</label>
                <select className="modal-input">
                  <option>Care Plan Clarification</option>
                  <option>Appointment Scheduling</option>
                  <option>Medication Question</option>
                  <option>General Inquiries</option>
                </select>
              </div>

              <div className="modal-form-group">
                <label>Your Message</label>
                <textarea 
                  rows={4}
                  placeholder={`Hi Care Team, regarding my recent ${patient.conditions[0]?.name || 'condition'}...`}
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  className="modal-input"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary send-msg-btn">
                <Send size={15} />
                <span>Send Message</span>
              </button>
            </form>
          )}

          <div className="care-team-hours">
            <span>24/7 Clinical Navigator Hotline: <strong>+1 (800) 555-CARE</strong></span>
          </div>
        </aside>
      </div>
    </div>
  );
};
