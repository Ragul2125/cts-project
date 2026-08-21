import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import './DashboardCards.css';

export const UpcomingBookingsCard: React.FC = () => {
  const { bookings } = usePatient();
  const navigate = useNavigate();

  if (!bookings || bookings.length === 0) return null;

  return (
    <div className="dashboard-card upcoming-bookings-card">
      <div className="card-header">
        <div className="header-title">
          <Calendar size={18} />
          <h2>Upcoming Bookings</h2>
        </div>
        <button className="btn-link" onClick={() => navigate('/care-plan')}>
          <span>View All</span>
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="bookings-list">
        {bookings.slice(0, 3).map(booking => (
          <div key={booking.id} className="booking-item">
            <div className="booking-info">
              <h4>{booking.providerName}</h4>
              <p>{booking.providerSpecialty}</p>
            </div>
            <div className="booking-time">
              <Calendar size={14} />
              <span>{booking.date} at {booking.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
