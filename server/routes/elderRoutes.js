const express = require('express');
const router = express.Router();
const { 
  getEldersByFamilyMember, 
  getElderCount, 
  getElderById, 
  updateElder,
  createElder,
  getDoctorsByElderDistrict,
  getAllDoctorsForOnlineMeeting,
  getDoctorById,
  getAppointmentBookingInfo,
  createAppointment,
  getElderAppointments,
  getUpcomingAppointmentsByFamily,
  getAppointmentCountByFamily,
  getBlockedTimeSlots // Add this import
} = require('../controllers/elderController');

const { 
  getElderDetails,
  getElderDashboardStats,
  getUpcomingAppointments,
  getPastAppointments,
  getAllAppointments,
  getAppointmentById,
<<<<<<< Updated upstream
  cancelAppointment,
  rescheduleAppointment
=======
  joinAppointment
>>>>>>> Stashed changes
} = require('../controllers/elder');

const {
  getUpcomingSessions,
  getPastSessions,
  getAllSessions,
  getSessionById,
  joinSession
} = require('../controllers/session');

const {
  getCareAssignmentsByWeek,
  getDayCareAssignments,
  getCareAssignmentStats
} = require('../controllers/carerequest');

// Get all elders for a specific family member
router.get('/family-member/:familyMemberId', getEldersByFamilyMember);

// Get elder count for a specific family member
router.get('/count/:familyMemberId', getElderCount);
router.get('/family-member/:familyMemberId/appointments/upcoming', getUpcomingAppointmentsByFamily);

// Get appointment count for a family member
router.get('/family-member/:familyMemberId/appointments/count', getAppointmentCountByFamily);

// Fetch elder details - MUST BE BEFORE /:elderId route
router.get('/elderDetails', getElderDetails);

// Get blocked time slots for a doctor on a specific date - MUST BE BEFORE /:elderId route
router.get('/doctor/:doctorId/blocked-slots/:date', getBlockedTimeSlots);

// Get appointment booking info (both elder and doctor) - MUST BE BEFORE /:elderId route
router.get('/:elderId/appointment-booking/:doctorId', getAppointmentBookingInfo);

// Get doctor info by ID - MUST BE BEFORE /:elderId route
router.get('/doctor/:doctorId', getDoctorById);

// Get doctors by elder's district for physical meetings - MUST BE BEFORE /:elderId route
router.get('/:elderId/doctors', getDoctorsByElderDistrict);

// Get all doctors for online meetings - MUST BE BEFORE /:elderId route
router.get('/:elderId/doctors/online', getAllDoctorsForOnlineMeeting);

// Get dashboard stats for an elder - MUST BE BEFORE /:elderId route
router.get('/:elderId/dashboard-stats', getElderDashboardStats);

// Create new appointment - MUST BE BEFORE /:elderId route
router.post('/:elderId/appointments', createAppointment);

// Get elder appointments - MUST BE BEFORE /:elderId route
router.get('/:elderId/appointments', getElderAppointments);

// Appointment routes for elders - MUST BE BEFORE /:elderId route
router.get('/:elderId/appointments/upcoming', getUpcomingAppointments);
router.get('/:elderId/appointments/past', getPastAppointments);
router.get('/:elderId/appointments/:appointmentId', getAppointmentById);
<<<<<<< Updated upstream
router.get('/:elderId/appointments', getAllAppointments);
router.put('/:elderId/appointments/:appointmentId/cancel', cancelAppointment);
router.put('/:elderId/appointments/:appointmentId/reschedule', rescheduleAppointment);
=======
router.post('/:elderId/appointments/:appointmentId/join', joinAppointment);

// Session routes for elders - MUST BE BEFORE /:elderId route
router.get('/:elderId/sessions/upcoming', getUpcomingSessions);
router.get('/:elderId/sessions/past', getPastSessions);
router.get('/:elderId/sessions', getAllSessions);
router.get('/:elderId/sessions/:sessionId', getSessionById);
router.post('/:elderId/sessions/:sessionId/join', joinSession);

// Care assignment routes for elders - MUST BE BEFORE /:elderId route
router.get('/:elderId/care-assignments/week', getCareAssignmentsByWeek);
router.get('/:elderId/care-assignments/day', getDayCareAssignments);
router.get('/:elderId/care-assignments/stats', getCareAssignmentStats);
>>>>>>> Stashed changes

// Get specific elder by ID
router.get('/:elderId', getElderById);

// Update elder details
router.put('/:elderId', updateElder);

// Create new elder
router.post('/', createElder);

module.exports = router;
