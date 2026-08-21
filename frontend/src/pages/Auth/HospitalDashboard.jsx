import React from 'react';
import HospitalPortal from '../Hospital/HospitalPortal';

export default function HospitalDashboard({ session, onLogout }) {
  return <HospitalPortal session={session} onLogout={onLogout} />;
}
