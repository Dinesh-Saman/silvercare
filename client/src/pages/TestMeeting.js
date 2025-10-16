import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const TestMeeting = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // States
  const [isConnected, setIsConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Initializing...');
  
  // Refs
  const localVideoRef = useRef(null);
  
  // Get URL parameters
  const doctorId = searchParams.get('doctor');
  const patientId = searchParams.get('patient');
  const userRole = searchParams.get('role');
  const meetingId = window.location.pathname.split('/').pop();

  // Determine current user info
  const getCurrentUser = () => {
    if (userRole === 'patient') {
      return {
        type: 'patient',
        id: patientId,
        name: `Patient ${patientId}`,
        displayName: 'Patient'
      };
    } else {
      return {
        type: 'doctor', 
        id: doctorId,
        name: `Doctor ${doctorId}`,
        displayName: 'Doctor'
      };
    }
  };

  const currentUser = getCurrentUser();

  useEffect(() => {
    initializeBasicMeeting();
  }, []);

  const initializeBasicMeeting = async () => {
    try {
      setConnectionStatus('Setting up camera and microphone...');
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setIsCameraOn(true);
      setIsMicOn(true);
      setIsConnected(true);
      setConnectionStatus('Ready - Basic Setup Complete');
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setConnectionStatus('Failed to access camera/microphone');
    }
  };

  const toggleMicrophone = () => {
    setIsMicOn(!isMicOn);
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };

  const endCall = () => {
    navigate('/');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <h2>🩺 Test Meeting Room</h2>
        <div>
          <span>Meeting ID: {meetingId}</span> | 
          <span style={{ color: currentUser.type === 'doctor' ? '#4CAF50' : '#2196F3', fontWeight: 'bold', marginLeft: '10px' }}>
            {currentUser.type === 'doctor' ? '👨‍⚕️' : '🧑‍🦳'} {currentUser.displayName}
          </span> | 
          <span style={{ marginLeft: '10px' }}>Status: {connectionStatus}</span>
        </div>
      </div>

      {/* Video Area */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ position: 'relative', width: '640px', height: '480px', backgroundColor: '#000', margin: '0 auto' }}>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ 
            position: 'absolute', 
            bottom: '10px', 
            left: '10px', 
            background: 'rgba(0,0,0,0.7)', 
            color: 'white', 
            padding: '5px 10px',
            borderRadius: '5px'
          }}>
            You ({currentUser.displayName})
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          onClick={toggleMicrophone}
          style={{
            margin: '0 10px',
            padding: '10px 20px',
            fontSize: '18px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            backgroundColor: isMicOn ? '#4CAF50' : '#f44336',
            color: 'white'
          }}
        >
          {isMicOn ? '🎤 Mic On' : '🔇 Mic Off'}
        </button>
        
        <button
          onClick={toggleCamera}
          style={{
            margin: '0 10px',
            padding: '10px 20px',
            fontSize: '18px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            backgroundColor: isCameraOn ? '#4CAF50' : '#f44336',
            color: 'white'
          }}
        >
          {isCameraOn ? '📹 Camera On' : '📷 Camera Off'}
        </button>

        <button
          onClick={endCall}
          style={{
            margin: '0 10px',
            padding: '10px 20px',
            fontSize: '18px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            backgroundColor: '#f44336',
            color: 'white'
          }}
        >
          📞 End Call
        </button>
      </div>

      {/* Debug Info */}
      <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px', marginTop: '20px' }}>
        <h3>🐛 Debug Information</h3>
        <p><strong>Meeting ID:</strong> {meetingId}</p>
        <p><strong>User Role:</strong> {currentUser.type}</p>
        <p><strong>User ID:</strong> {currentUser.id}</p>
        <p><strong>Connection Status:</strong> {connectionStatus}</p>
        <p><strong>Camera:</strong> {isCameraOn ? 'On' : 'Off'}</p>
        <p><strong>Microphone:</strong> {isMicOn ? 'On' : 'Off'}</p>
        <p><strong>URL Params:</strong> doctor={doctorId}, patient={patientId}, role={userRole}</p>
      </div>
    </div>
  );
};

export default TestMeeting;
