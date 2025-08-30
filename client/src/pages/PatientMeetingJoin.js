import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './PatientMeetingJoin.css';

const PatientMeetingJoin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [patientInfo, setPatientInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const doctorId = searchParams.get('doctor');
  const patientId = searchParams.get('patient');
  const meetingType = searchParams.get('type');
  const meetingId = window.location.pathname.split('/').pop();

  useEffect(() => {
    loadPatientInfo();
  }, []);

  const loadPatientInfo = async () => {
    try {
      setIsLoading(true);
      // In a real implementation, you'd fetch patient info from API
      // For demo purposes, we'll simulate this
      
      const mockPatientData = {
        1: { name: 'Margaret Thompson', email: 'margaret.thompson@email.com' },
        12: { name: 'Chamath Kavinda', email: 'chamath@gmail.com' },
        16: { name: 'Bumal Minula', email: 'bumal@gmail.com' }
      };

      const patient = mockPatientData[patientId] || { 
        name: `Patient ${patientId}`, 
        email: 'patient@example.com' 
      };

      setPatientInfo({
        ...patient,
        id: patientId,
        doctorId: doctorId
      });

      setIsLoading(false);
    } catch (err) {
      setError('Failed to load patient information');
      setIsLoading(false);
    }
  };

  const joinMeeting = () => {
    // Navigate to the actual meeting room
    navigate(`/consultation/${meetingId}?doctor=${doctorId}&patient=${patientId}&type=${meetingType}&role=patient`);
  };

  if (isLoading) {
    return (
      <div className="patient-join-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <h2>Loading meeting information...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="patient-join-container">
        <div className="error-message">
          <h2>❌ Unable to Join Meeting</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-join-container">
      <div className="patient-join-card">
        <div className="silvercare-header">
          <h1>🏥 SilverCare</h1>
          <p>Online Medical Consultation</p>
        </div>

        <div className="meeting-info">
          <h2>Ready to Join Your Consultation?</h2>
          
          <div className="patient-details">
            <div className="detail-item">
              <span className="label">👤 Patient:</span>
              <span className="value">{patientInfo.name}</span>
            </div>
            <div className="detail-item">
              <span className="label">📧 Email:</span>
              <span className="value">{patientInfo.email}</span>
            </div>
            <div className="detail-item">
              <span className="label">👨‍⚕️ Doctor ID:</span>
              <span className="value">{doctorId}</span>
            </div>
            <div className="detail-item">
              <span className="label">🔗 Meeting ID:</span>
              <span className="value">{meetingId}</span>
            </div>
          </div>

          <div className="meeting-instructions">
            <h3>Before joining:</h3>
            <ul>
              <li>🎥 Make sure your camera is working</li>
              <li>🎤 Check your microphone</li>
              <li>🔌 Ensure stable internet connection</li>
              <li>📱 Close other apps to improve performance</li>
            </ul>
          </div>

          <div className="join-actions">
            <button 
              className="join-meeting-btn"
              onClick={joinMeeting}
            >
              🚀 Join Consultation
            </button>
            
            <p className="privacy-note">
              This is a secure, private consultation. Your video and audio will only be shared with your healthcare provider.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientMeetingJoin;
