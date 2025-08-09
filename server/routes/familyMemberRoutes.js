const express = require('express');
const router = express.Router();
const familyMemberController = require('../controllers/familyMemberController');
const doctormessageController = require('../controllers/doctormessageController');
// Get family member details by user ID
router.get('/:userId', familyMemberController.getFamilyMemberDetails);

// Update family member details
router.put('/:userId', familyMemberController.updateFamilyMemberDetails);

// NEW: Doctor message/chat routes
// Get doctors who have confirmed/completed appointments with family member's elders
router.get('/:userId/doctors-with-appointments', doctormessageController.getDoctorsWithAppointments);

// Get appointment history between family member and specific doctor
router.get('/:userId/doctor/:doctorId/appointments', doctormessageController.getAppointmentHistoryWithDoctor);

module.exports = router;
