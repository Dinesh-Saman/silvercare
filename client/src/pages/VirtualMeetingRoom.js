import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './VirtualMeetingRoom.css';

// Import Socket.IO with error handling
let io = null;
try {
  io = require('socket.io-client');
} catch (error) {
  console.warn('Socket.IO not available:', error);
}

const VirtualMeetingRoom = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // States
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  
  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef({});

  // Get URL parameters
  const doctorId = searchParams.get('doctor');
  const patientId = searchParams.get('patient');
  const meetingType = searchParams.get('type');
  const userRole = searchParams.get('role'); // 'doctor' or 'patient'
  const meetingId = window.location.pathname.split('/').pop();

  // Determine current user info
  const getCurrentUser = () => {
    // Priority 1: Explicit role parameter
    if (userRole === 'patient') {
      return {
        type: 'patient',
        id: patientId,
        name: `Patient ${patientId}`,
        displayName: 'Patient'
      };
    } else if (userRole === 'doctor') {
      return {
        type: 'doctor', 
        id: doctorId,
        name: `Doctor ${doctorId}`,
        displayName: 'Doctor'
      };
    }
    
    // Priority 2: Check if coming from patient-join route
    const referrer = document.referrer;
    if (referrer && referrer.includes('/patient-join/')) {
      return {
        type: 'patient',
        id: patientId,
        name: `Patient ${patientId}`,
        displayName: 'Patient'
      };
    }
    
    // Priority 3: Default to doctor (for direct links from dashboard)
    return {
      type: 'doctor', 
      id: doctorId,
      name: `Doctor ${doctorId}`,
      displayName: 'Doctor'
    };
  };

  const currentUser = getCurrentUser();

  useEffect(() => {
    initializeMeeting();
    
    return () => {
      cleanup();
    };
  }, []);

  const initializeMeeting = async () => {
    try {
      setConnectionStatus('Setting up camera and microphone...');
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setIsCameraOn(true);
      setIsMicOn(true);
      
      // Add current user to participants first
      setParticipants([{
        id: currentUser.id,
        name: currentUser.displayName,
        type: currentUser.type,
        isLocal: true
      }]);
      
      // Connect to signaling server if available
      if (io) {
        setConnectionStatus('Connecting to meeting server...');
        try {
          const signalingUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:5001' 
            : `http://${window.location.hostname}:5001`;
          
          const newSocket = io(signalingUrl);
          
          newSocket.on('connect', () => {
            console.log('Connected to signaling server');
            setSocket(newSocket);
            setIsConnected(true);
            setConnectionStatus('Connected - Looking for other participants');
            
            // Join the meeting room
            newSocket.emit('join-meeting', {
              meetingId,
              userRole: currentUser.type,
              userId: currentUser.id
            });
          });

          // Handle existing participants
          newSocket.on('existing-participants', (existingParticipants) => {
            console.log('Existing participants:', existingParticipants);
            setConnectionStatus(`Connected - ${existingParticipants.length + 1} participant(s) in meeting`);
            
            // Update participants list
            const allParticipants = [
              {
                id: currentUser.id,
                name: currentUser.displayName,
                type: currentUser.type,
                isLocal: true
              },
              ...existingParticipants.map(p => ({
                id: p.userId,
                name: p.userRole === 'doctor' ? 'Doctor' : 'Patient',
                type: p.userRole,
                socketId: p.socketId,
                isLocal: false
              }))
            ];
            setParticipants(allParticipants);
            
            // Create peer connections
            existingParticipants.forEach(participant => {
              createBasicPeerConnection(participant.socketId, participant.userRole);
            });
          });

          // Handle new user joined
          newSocket.on('user-joined', (data) => {
            console.log('User joined:', data);
            setConnectionStatus(`Connected - User joined as ${data.userRole}`);
            
            setParticipants(prev => [...prev, {
              id: data.userId,
              name: data.userRole === 'doctor' ? 'Doctor' : 'Patient',
              type: data.userRole,
              socketId: data.socketId,
              isLocal: false
            }]);
            
            createBasicPeerConnection(data.socketId, data.userRole);
          });

          // Handle chat messages
          newSocket.on('chat-message', (data) => {
            setChatMessages(prev => [...prev, {
              id: Date.now(),
              sender: data.senderRole === 'doctor' ? 'Doctor' : 'Patient',
              text: data.message,
              timestamp: new Date(data.timestamp).toLocaleTimeString(),
              isOwn: false
            }]);
          });

          // Handle user left
          newSocket.on('user-left', (data) => {
            console.log('User left:', data.socketId);
            setParticipants(prev => prev.filter(p => p.socketId !== data.socketId));
            setConnectionStatus('Connected - Participant left');
          });

          // Handle connection errors
          newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setConnectionStatus('Connection failed - Working in offline mode');
            setIsConnected(false);
          });

          newSocket.on('disconnect', () => {
            console.log('Disconnected from signaling server');
            setConnectionStatus('Disconnected - Working in offline mode');
            setIsConnected(false);
          });
          
        } catch (socketError) {
          console.error('Socket.IO connection failed:', socketError);
          setConnectionStatus('Connected - Working in offline mode');
          setIsConnected(true);
        }
      } else {
        setConnectionStatus('Connected - Working in offline mode (Socket.IO unavailable)');
        setIsConnected(true);
      }
      
    } catch (error) {
      console.error('Error initializing meeting:', error);
      setConnectionStatus('Failed to access camera/microphone');
    }
  };

  const createBasicPeerConnection = (socketId, userRole) => {
    console.log(`Creating basic connection tracking for ${socketId} (${userRole})`);
    // For now, we're just tracking connections
    // Real WebRTC peer connections will be added in the next step
    peerConnectionsRef.current[socketId] = {
      socketId,
      userRole,
      connected: true
    };
  };

  const toggleMicrophone = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMicOn;
        setIsMicOn(!isMicOn);
      }
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isCameraOn;
        setIsCameraOn(!isCameraOn);
      }
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        sender: currentUser.displayName,
        text: newMessage,
        timestamp: new Date().toLocaleTimeString(),
        isOwn: true
      };
      
      // Add to local chat immediately
      setChatMessages(prev => [...prev, message]);
      
      // Send via Socket.IO if connected
      if (socket && socket.connected) {
        socket.emit('chat-message', {
          meetingId,
          message: newMessage,
          senderRole: currentUser.type,
          senderName: currentUser.displayName
        });
      }
      
      setNewMessage('');
    }
  };

  const endCall = () => {
    cleanup();
    navigate('/');
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Clean up peer connections
    Object.values(peerConnectionsRef.current).forEach(connection => {
      if (connection && connection.close) {
        connection.close();
      }
    });
    peerConnectionsRef.current = {};
    
    // Disconnect socket
    if (socket && socket.connected) {
      socket.disconnect();
    }
  };

  const formatMeetingInfo = () => {
    return {
      meetingId: meetingId,
      type: meetingType || 'consultation',
      doctor: doctorId || 'Unknown',
      patient: patientId || 'Unknown'
    };
  };

  return (
    <div className="virtual-meeting-room">
      {/* Header */}
      <div className="meeting-header">
        <div className="meeting-info">
          <h2>🩺 Medical Consultation</h2>
          <div className="meeting-details">
            <span>Meeting ID: {meetingId}</span>
            <span className={`user-role ${currentUser.type}`}>
              {currentUser.type === 'doctor' ? '👨‍⚕️' : '🧑‍🦳'} Joined as: {currentUser.displayName}
            </span>
            <span className={`status ${connectionStatus.toLowerCase().replace(' ', '-')}`}>
              {connectionStatus}
            </span>
          </div>
        </div>
        <div className="meeting-actions">
          <button 
            className="btn-secondary"
            onClick={() => setShowChat(!showChat)}
          >
            💬 Chat {chatMessages.length > 0 && `(${chatMessages.length})`}
          </button>
          <button 
            className="btn-danger"
            onClick={endCall}
          >
            📞 End Call
          </button>
        </div>
      </div>

      {/* Video Area */}
      <div className="video-container">
        {/* Main Video (Remote Participant) */}
        <div className="main-video">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="remote-video"
          />
          <div className="video-overlay">
            <div className="participant-info">
              <span className="participant-name">
                {doctorId ? 'Patient' : 'Doctor'}
              </span>
              <span className="participant-status">
                Waiting to join...
              </span>
            </div>
          </div>
        </div>

        {/* Local Video (Self) */}
        <div className="local-video-container">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="local-video"
          />
          <div className="local-video-label">
            You ({doctorId ? 'Doctor' : 'Patient'})
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="meeting-controls">
        <div className="control-group">
          <button
            className={`control-btn ${isMicOn ? 'active' : 'muted'}`}
            onClick={toggleMicrophone}
            title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isMicOn ? '🎤' : '🔇'}
          </button>
          
          <button
            className={`control-btn ${isCameraOn ? 'active' : 'disabled'}`}
            onClick={toggleCamera}
            title={isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {isCameraOn ? '📹' : '📷'}
          </button>
          
          <button
            className="control-btn"
            onClick={() => window.print()}
            title="Share Screen"
          >
            🖥️
          </button>
          
          <button
            className="control-btn"
            title="Meeting Settings"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <div className="chat-sidebar">
          <div className="chat-header">
            <h3>💬 Meeting Chat</h3>
            <button 
              className="close-chat"
              onClick={() => setShowChat(false)}
            >
              ✕
            </button>
          </div>
          
          <div className="chat-messages">
            {chatMessages.length === 0 ? (
              <div className="no-messages">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className={`message ${msg.isOwn ? 'own' : 'other'}`}>
                  <div className="message-sender">{msg.sender}</div>
                  <div className="message-text">{msg.text}</div>
                  <div className="message-time">{msg.timestamp}</div>
                </div>
              ))
            )}
          </div>
          
          <div className="chat-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}

      {/* Connection Status Overlay */}
      {!isConnected && (
        <div className="connection-overlay">
          <div className="connection-status">
            <div className="loading-spinner"></div>
            <h3>{connectionStatus}</h3>
            <p>Please allow camera and microphone access to join the meeting.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualMeetingRoom;
