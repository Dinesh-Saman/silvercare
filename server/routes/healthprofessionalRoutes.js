const express = require('express');
const router = express.Router();
const healthProfessionalController = require('../controllers/healthProfessionalController');
const { 
  getEldersWithAppointments,
  getAppointmentHistoryWithElder
} = require('../controllers/counselorElderChatController');
const { 
  getFamilyMembersWithAppointments,
  getAppointmentHistoryWithFamilyMember
} = require('../controllers/counselorFamilyMemberChatController');

// GET /api/healthprofessional/user/:userId
router.get('/user/:userId', healthProfessionalController.getByUserId);

// Get elders with appointments for chat (counselor perspective) - MUST BE BEFORE /:counselorId route
router.get('/:counselorId/elders-with-appointments', getEldersWithAppointments);
router.get('/:counselorId/elder/:elderId/appointments', getAppointmentHistoryWithElder);

// Get family members with appointments for chat (counselor perspective)
router.get('/:counselorId/family-members-with-appointments', getFamilyMembersWithAppointments);
router.get('/:counselorId/family-member/:familyMemberId/appointments', getAppointmentHistoryWithFamilyMember);

module.exports = router; 