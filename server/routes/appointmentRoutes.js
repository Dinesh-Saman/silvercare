const express = require('express');
const router = express.Router();
const {
  getAllAppointmentsByFamily,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  getAppointmentStats,
  getAppointmentHistory 
} = require('../controllers/appointmentController');

<<<<<<< Updated upstream
// Get all appointments for a family member with filters
router.get('/family-member/:familyMemberId', getAllAppointmentsByFamily);
=======
// Get all appointments for a family member (with filtering support)
router.get('/family/:familyMemberId', getAllAppointmentsByFamily);
>>>>>>> Stashed changes

// Get appointment statistics for a family member
router.get('/family-member/:familyMemberId/stats', getAppointmentStats);

// Get specific appointment by ID
router.get('/:appointmentId', getAppointmentById);

// Update appointment status
router.put('/:appointmentId/status', updateAppointmentStatus);
router.get('/family/:familyMemberId/history', getAppointmentHistory);

// Cancel appointment
router.put('/:appointmentId/cancel', cancelAppointment);

module.exports = router;
