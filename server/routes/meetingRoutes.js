const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Store active meetings (in production, use Redis or database)
const activeMeetings = new Map();

// Generate a unique meeting
router.post('/create-meeting', cors(), (req, res) => {
  try {
    const { doctorId, patientId, appointmentId, appointmentType } = req.body;
    
    // Generate unique meeting ID
    const meetingId = uuidv4();
    const roomName = `silvercare-${meetingId}`;
    
    // Create meeting object
    const meeting = {
      id: meetingId,
      roomName,
      doctorId,
      patientId,
      appointmentId,
      appointmentType: appointmentType || 'online',
      createdAt: new Date(),
      status: 'active',
      // Public Jitsi Meet URL
      publicUrl: `https://meet.jit.si/${roomName}`,
      // App-specific URLs
      doctorUrl: `${req.protocol}://${req.get('host')}/meeting/${meetingId}?role=doctor&doctor=${doctorId}`,
      patientUrl: `${req.protocol}://${req.get('host')}/meeting/${meetingId}?role=patient&patient=${patientId}`,
      // Alternative public URLs for direct access
      doctorPublicUrl: `https://meet.jit.si/${roomName}?userInfo.displayName=Dr.${doctorId}`,
      patientPublicUrl: `https://meet.jit.si/${roomName}?userInfo.displayName=Patient${patientId}`
    };
    
    // Store meeting
    activeMeetings.set(meetingId, meeting);
    
    // Auto-cleanup meeting after 24 hours
    setTimeout(() => {
      activeMeetings.delete(meetingId);
    }, 24 * 60 * 60 * 1000);
    
    console.log(`📞 Created meeting: ${meetingId} for Doctor ${doctorId} and Patient ${patientId}`);
    console.log(`🔗 Public URL: ${meeting.publicUrl}`);
    
    res.json({
      success: true,
      meeting
    });
    
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create meeting'
    });
  }
});

// Get meeting details
router.get('/meeting/:meetingId', cors(), (req, res) => {
  try {
    const { meetingId } = req.params;
    const meeting = activeMeetings.get(meetingId);
    
    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found or expired'
      });
    }
    
    res.json({
      success: true,
      meeting
    });
    
  } catch (error) {
    console.error('Error getting meeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get meeting details'
    });
  }
});

// List all active meetings (for admin/debugging)
router.get('/meetings', cors(), (req, res) => {
  try {
    const meetings = Array.from(activeMeetings.values());
    res.json({
      success: true,
      meetings,
      count: meetings.length
    });
  } catch (error) {
    console.error('Error listing meetings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list meetings'
    });
  }
});

// End/delete a meeting
router.delete('/meeting/:meetingId', cors(), (req, res) => {
  try {
    const { meetingId } = req.params;
    const deleted = activeMeetings.delete(meetingId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found'
      });
    }
    
    console.log(`📞 Ended meeting: ${meetingId}`);
    
    res.json({
      success: true,
      message: 'Meeting ended successfully'
    });
    
  } catch (error) {
    console.error('Error ending meeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end meeting'
    });
  }
});

// Create a quick meeting (no database, just generate URLs)
router.post('/quick-meeting', cors(), (req, res) => {
  try {
    const meetingId = uuidv4();
    const roomName = `silvercare-${meetingId}`;
    const timestamp = Date.now();
    
    const meetingUrls = {
      meetingId,
      roomName,
      createdAt: new Date(),
      
      // Direct Jitsi URLs (no login required)
      publicUrl: `https://meet.jit.si/${roomName}`,
      
      // Branded URLs for doctor/patient
      doctorDirectUrl: `https://meet.jit.si/${roomName}?userInfo.displayName=Doctor&userInfo.email=doctor@silvercare.com`,
      patientDirectUrl: `https://meet.jit.si/${roomName}?userInfo.displayName=Patient&userInfo.email=patient@silvercare.com`,
      
      // App wrapper URLs (with our branding)
      doctorAppUrl: `${req.protocol}://${req.get('host')}/meeting/${meetingId}?role=doctor`,
      patientAppUrl: `${req.protocol}://${req.get('host')}/meeting/${meetingId}?role=patient`,
      
      // Instructions
      instructions: {
        doctor: "Click the doctor URL to join as the healthcare provider",
        patient: "Click the patient URL to join as the patient",
        public: "Anyone can join using the public URL",
        sharing: "Share these URLs with participants - no login required"
      }
    };
    
    console.log(`📞 Quick meeting created: ${meetingId}`);
    console.log(`🔗 Public URL: ${meetingUrls.publicUrl}`);
    
    res.json({
      success: true,
      meeting: meetingUrls
    });
    
  } catch (error) {
    console.error('Error creating quick meeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create quick meeting'
    });
  }
});

module.exports = router;
