import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './VirtualMeetingRoom.css';

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
    } else if (userRole === 'doctor') {
      return {
        type: 'doctor', 
        id: doctorId,
        name: `Doctor ${doctorId}`,
        displayName: 'Doctor'
      };
    }
    
    const referrer = document.referrer;
    if (referrer && referrer.includes('/patient-join/')) {
      return {
        type: 'patient',
        id: patientId,
        name: `Patient ${patientId}`,
        displayName: 'Patient'
      };
    }
    
    return {
      type: 'doctor', 
      id: doctorId,
      name: `Doctor ${doctorId}`,
      displayName: 'Doctor'
    };
  };

  const currentUser = getCurrentUser();

  // WebRTC configuration
  const pcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

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
      
      // Connect to signaling server
      setConnectionStatus('Connecting to meeting server...');
      const newSocket = io('http://localhost:5001');
      
      newSocket.on('connect', () => {
        console.log('Connected to signaling server');
        setSocket(newSocket);
        setIsConnected(true);
        setConnectionStatus('Connected');
        
        // Join the meeting room
        newSocket.emit('join-meeting', {
          meetingId,
          userRole: currentUser.type,
          userId: currentUser.id
        });
      });

      // Handle existing participants
      newSocket.on('existing-participants', (participants) => {
        console.log('Existing participants:', participants);
        participants.forEach(participant => {
          createPeerConnection(participant.socketId, participant.userRole, true);
        });
        updateParticipantsList(participants);
      });

      // Handle new user joined
      newSocket.on('user-joined', (data) => {
        console.log('User joined:', data);
        createPeerConnection(data.socketId, data.userRole, false);
        setParticipants(prev => [...prev, {
          id: data.userId,
          name: data.userRole === 'doctor' ? 'Doctor' : 'Patient',
          type: data.userRole,
          socketId: data.socketId,
          isLocal: false
        }]);
      });

      // Handle WebRTC signaling
      newSocket.on('offer', async (data) => {
        console.log('Received offer from:', data.senderSocketId);
        await handleOffer(data.offer, data.senderSocketId);
      });

      newSocket.on('answer', async (data) => {
        console.log('Received answer from:', data.senderSocketId);
        await handleAnswer(data.answer, data.senderSocketId);
      });

      newSocket.on('ice-candidate', async (data) => {
        await handleIceCandidate(data.candidate, data.senderSocketId);
      });

      // Handle chat messages
      newSocket.on('chat-message', (data) => {
        setChatMessages(prev => [...prev, {
          id: Date.now(),
          sender: data.senderRole === 'doctor' ? 'Doctor' : 'Patient',
          text: data.message,
          timestamp: new Date(data.timestamp).toLocaleTimeString(),
          isOwn: data.senderId === newSocket.id
        }]);
      });

      // Handle user left
      newSocket.on('user-left', (data) => {
        console.log('User left:', data.socketId);
        closePeerConnection(data.socketId);
        setParticipants(prev => prev.filter(p => p.socketId !== data.socketId));
      });

    } catch (error) {
      console.error('Error initializing meeting:', error);
      setConnectionStatus('Failed to access camera/microphone');
    }
  };

  const createPeerConnection = async (socketId, userRole, isInitiator) => {
    console.log(`Creating peer connection with ${socketId}, initiator: ${isInitiator}`);
    
    const peerConnection = new RTCPeerConnection(pcConfig);
    peerConnectionsRef.current[socketId] = peerConnection;

    // Add local stream to peer connection
    localStreamRef.current.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStreamRef.current);
    });

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('Received remote stream');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', {
          targetSocketId: socketId,
          candidate: event.candidate
        });
      }
    };

    // Create offer if initiator
    if (isInitiator) {
      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit('offer', {
          targetSocketId: socketId,
          offer: offer,
          meetingId
        });
      } catch (error) {
        console.error('Error creating offer:', error);
      }
    }
  };

  const handleOffer = async (offer, senderSocketId) => {
    const peerConnection = peerConnectionsRef.current[senderSocketId];
    if (!peerConnection) return;

    try {
      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      socket.emit('answer', {
        targetSocketId: senderSocketId,
        answer: answer
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (answer, senderSocketId) => {
    const peerConnection = peerConnectionsRef.current[senderSocketId];
    if (!peerConnection) return;

    try {
      await peerConnection.setRemoteDescription(answer);
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (candidate, senderSocketId) => {
    const peerConnection = peerConnectionsRef.current[senderSocketId];
    if (!peerConnection) return;

    try {
      await peerConnection.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  const updateParticipantsList = (remoteParticipants) => {
    const allParticipants = [
      {
        id: currentUser.id,
        name: currentUser.displayName,
        type: currentUser.type,
        isLocal: true
      },
      ...remoteParticipants.map(p => ({
        id: p.userId,
        name: p.userRole === 'doctor' ? 'Doctor' : 'Patient',
        type: p.userRole,
        socketId: p.socketId,
        isLocal: false
      }))
    ];
    setParticipants(allParticipants);
  };

  const toggleMicrophone = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMicOn;
        setIsMicOn(!isMicOn);
        
        if (socket) {
          socket.emit('toggle-audio', {
            meetingId,
            isAudioOn: !isMicOn,
            userRole: currentUser.type
          });
        }
      }
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isCameraOn;
        setIsCameraOn(!isCameraOn);
        
        if (socket) {
          socket.emit('toggle-video', {
            meetingId,
            isVideoOn: !isCameraOn,
            userRole: currentUser.type
          });
        }
      }
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && socket) {
      socket.emit('chat-message', {
        meetingId,
        message: newMessage,
        senderRole: currentUser.type,
        senderName: currentUser.displayName
      });
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
    
    Object.values(peerConnectionsRef.current).forEach(pc => {
      pc.close();
    });
    peerConnectionsRef.current = {};
    
    if (socket) {
      socket.disconnect();
    }
  };

  const closePeerConnection = (socketId) => {
    if (peerConnectionsRef.current[socketId]) {
      peerConnectionsRef.current[socketId].close();
      delete peerConnectionsRef.current[socketId];
    }
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
            <span className="participants-count">
              👥 {participants.length} participant{participants.length !== 1 ? 's' : ''}
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
              {participants.find(p => !p.isLocal)?.name || 'Waiting for other participant...'}
            </div>
          </div>
        </div>

        {/* Local Video (Picture-in-Picture) */}
        <div className="local-video-container">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="local-video"
          />
          <div className="local-video-label">
            You ({currentUser.displayName})
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="meeting-controls">
        <button
          className={`control-btn ${isMicOn ? 'active' : 'inactive'}`}
          onClick={toggleMicrophone}
          title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isMicOn ? '🎤' : '🔇'}
        </button>
        
        <button
          className={`control-btn ${isCameraOn ? 'active' : 'inactive'}`}
          onClick={toggleCamera}
          title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {isCameraOn ? '📹' : '📷'}
        </button>
      </div>

      {/* Chat Panel */}
      {showChat && (
        <div className="chat-panel">
          <div className="chat-header">
            <h3>💬 Chat</h3>
            <button onClick={() => setShowChat(false)}>✕</button>
          </div>
          <div className="chat-messages">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`message ${msg.isOwn ? 'own' : 'other'}`}>
                <div className="message-sender">{msg.sender}</div>
                <div className="message-text">{msg.text}</div>
                <div className="message-time">{msg.timestamp}</div>
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualMeetingRoom;
