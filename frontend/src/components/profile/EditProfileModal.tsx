import React, { useState } from 'react';
import { usePatient } from '../../context/PatientContext';
import './EditProfileModal.css';

interface EditProfileModalProps {
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ onClose }) => {
  const { patient, updatePatient } = usePatient();
  const [name, setName] = useState(patient.name);
  const [phone, setPhone] = useState(patient.phone);
  const [email, setEmail] = useState(patient.email);
  const [address, setAddress] = useState(patient.address);
  const [emergencyName, setEmergencyName] = useState(patient.emergencyContact.name);
  const [emergencyPhone, setEmergencyPhone] = useState(patient.emergencyContact.phone);
  const [bloodGroup, setBloodGroup] = useState(patient.bloodGroup);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePatient({
      name,
      phone,
      email,
      address,
      bloodGroup,
      emergencyContact: {
        ...patient.emergencyContact,
        name: emergencyName,
        phone: emergencyPhone
      }
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content card animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Personal Profile</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="modal-form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="modal-input"
              required 
            />
          </div>

          <div className="form-two-cols">
            <div className="modal-form-group">
              <label>Blood Type</label>
              <select 
                value={bloodGroup} 
                onChange={e => setBloodGroup(e.target.value)} 
                className="modal-input"
              >
                <option value="O+">O Positive (O+)</option>
                <option value="O-">O Negative (O-)</option>
                <option value="A+">A Positive (A+)</option>
                <option value="A-">A Negative (A-)</option>
                <option value="B+">B Positive (B+)</option>
                <option value="B-">B Negative (B-)</option>
                <option value="AB+">AB Positive (AB+)</option>
                <option value="AB-">AB Negative (AB-)</option>
              </select>
            </div>

            <div className="modal-form-group">
              <label>Phone Number</label>
              <input 
                type="text" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                className="modal-input"
                required 
              />
            </div>
          </div>

          <div className="modal-form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="modal-input"
              required 
            />
          </div>

          <div className="modal-form-group">
            <label>Home Address</label>
            <textarea 
              rows={2} 
              value={address} 
              onChange={e => setAddress(e.target.value)} 
              className="modal-input"
              required 
            />
          </div>

          <div className="form-two-cols">
            <div className="modal-form-group">
              <label>Emergency Contact Name</label>
              <input 
                type="text" 
                value={emergencyName} 
                onChange={e => setEmergencyName(e.target.value)} 
                className="modal-input"
                required 
              />
            </div>

            <div className="modal-form-group">
              <label>Emergency Contact Phone</label>
              <input 
                type="text" 
                value={emergencyPhone} 
                onChange={e => setEmergencyPhone(e.target.value)} 
                className="modal-input"
                required 
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
