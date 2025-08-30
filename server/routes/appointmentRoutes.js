const express = require('express');
const router = express.Router();
const {
  getAllAppointmentsByFamily,
  getUpcomingAppointmentsByFamily,
  getAppointmentCountByFamily,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  getAppointmentStats,
  getAppointmentHistory 
} = require('../controllers/appointmentController');

// Get all appointments for a family member (with filtering support)
router.get('/family/:familyMemberId', getAllAppointmentsByFamily);

// Get upcoming confirmed appointments for dashboard
router.get('/family/:familyMemberId/upcoming', getUpcomingAppointmentsByFamily);

// Get confirmed appointment count for dashboard
router.get('/family/:familyMemberId/count', getAppointmentCountByFamily);

// Get appointment statistics (with enhanced info)
router.get('/family/:familyMemberId/stats', getAppointmentStats);

// Get specific appointment by ID
router.get('/:appointmentId', getAppointmentById);

// Update appointment status
router.put('/:appointmentId/status', updateAppointmentStatus);

// Get meeting information for an appointment
router.get('/:appointmentId/meeting', async (req, res) => {
  try {
    const MeetingService = require('../services/meetingService');
    const meetingInfo = await MeetingService.getMeetingInfo(req.params.appointmentId);
    res.json({
      success: true,
      meeting: meetingInfo
    });
  } catch (error) {
    console.error('Error getting meeting info:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});
router.get('/family/:familyMemberId/history', getAppointmentHistory);

// Cancel appointment with refund processing
router.put('/:appointmentId/cancel', cancelAppointment);

module.exports = router;
