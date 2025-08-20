// Simple signaling server for WebRTC connections
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// Store active meetings and participants
const meetings = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a meeting room
  socket.on('join-meeting', (data) => {
    const { meetingId, userRole, userId } = data;
    
    console.log(`${userRole} ${userId} joining meeting ${meetingId}`);
    
    // Join the socket room
    socket.join(meetingId);
    socket.meetingId = meetingId;
    socket.userRole = userRole;
    socket.userId = userId;
    
    // Initialize meeting if it doesn't exist
    if (!meetings.has(meetingId)) {
      meetings.set(meetingId, {
        participants: [],
        createdAt: new Date()
      });
    }
    
    const meeting = meetings.get(meetingId);
    
    // Add participant if not already in meeting
    const existingParticipant = meeting.participants.find(p => p.userId === userId);
    if (!existingParticipant) {
      meeting.participants.push({
        socketId: socket.id,
        userId,
        userRole,
        joinedAt: new Date()
      });
    } else {
      // Update socket ID if user reconnected
      existingParticipant.socketId = socket.id;
    }
    
    // Notify other participants about new user
    socket.to(meetingId).emit('user-joined', {
      userId,
      userRole,
      socketId: socket.id
    });
    
    // Send current participants to the new user
    const otherParticipants = meeting.participants
      .filter(p => p.userId !== userId)
      .map(p => ({ userId: p.userId, userRole: p.userRole, socketId: p.socketId }));
    
    socket.emit('existing-participants', otherParticipants);
    
    console.log(`Meeting ${meetingId} now has ${meeting.participants.length} participants`);
  });

  // Handle WebRTC signaling
  socket.on('offer', (data) => {
    const { targetSocketId, offer, meetingId } = data;
    console.log(`Sending offer from ${socket.id} to ${targetSocketId}`);
    socket.to(targetSocketId).emit('offer', {
      offer,
      senderSocketId: socket.id,
      senderRole: socket.userRole
    });
  });

  socket.on('answer', (data) => {
    const { targetSocketId, answer } = data;
    console.log(`Sending answer from ${socket.id} to ${targetSocketId}`);
    socket.to(targetSocketId).emit('answer', {
      answer,
      senderSocketId: socket.id,
      senderRole: socket.userRole
    });
  });

  socket.on('ice-candidate', (data) => {
    const { targetSocketId, candidate } = data;
    socket.to(targetSocketId).emit('ice-candidate', {
      candidate,
      senderSocketId: socket.id
    });
  });

  // Handle chat messages
  socket.on('chat-message', (data) => {
    const { meetingId, message, senderRole, senderName } = data;
    
    // Broadcast message to all participants in the meeting
    io.to(meetingId).emit('chat-message', {
      message,
      senderRole,
      senderName,
      timestamp: new Date().toISOString(),
      senderId: socket.id
    });
  });

  // Handle mute/unmute notifications
  socket.on('toggle-audio', (data) => {
    const { meetingId, isAudioOn, userRole } = data;
    socket.to(meetingId).emit('participant-audio-toggle', {
      socketId: socket.id,
      isAudioOn,
      userRole
    });
  });

  socket.on('toggle-video', (data) => {
    const { meetingId, isVideoOn, userRole } = data;
    socket.to(meetingId).emit('participant-video-toggle', {
      socketId: socket.id,
      isVideoOn,
      userRole
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.meetingId && meetings.has(socket.meetingId)) {
      const meeting = meetings.get(socket.meetingId);
      
      // Remove participant
      meeting.participants = meeting.participants.filter(p => p.socketId !== socket.id);
      
      // Notify other participants
      socket.to(socket.meetingId).emit('user-left', {
        socketId: socket.id,
        userRole: socket.userRole
      });
      
      // Clean up empty meetings
      if (meeting.participants.length === 0) {
        meetings.delete(socket.meetingId);
        console.log(`Meeting ${socket.meetingId} cleaned up`);
      }
    }
  });
});

const PORT = process.env.SIGNALING_PORT || 5001;
server.listen(PORT, () => {
  console.log(`🔗 WebRTC Signaling Server running on port ${PORT}`);
  console.log(`📡 Handling meetings for http://localhost:3000`);
});
