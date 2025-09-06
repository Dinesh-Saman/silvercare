const express = require('express');
const router = express.Router();
const familyMemberController = require('../controllers/familyMemberController');
const doctormessageController = require('../controllers/doctormessageController');
const familyMemberCounselorChatController = require('../controllers/familyMemberCounselorChatController');

// Get family member details by user ID
router.get('/:userId', familyMemberController.getFamilyMemberDetails);

// Update family member details
router.put('/:userId', familyMemberController.updateFamilyMemberDetails);

// NEW: Doctor message/chat routes
// Get doctors who have confirmed/completed appointments with family member's elders
router.get('/:userId/doctors-with-appointments', doctormessageController.getDoctorsWithAppointments);

// Get appointment history between family member and specific doctor
router.get('/:userId/doctor/:doctorId/appointments', doctormessageController.getAppointmentHistoryWithDoctor);

// NEW: Counselor chat routes
// Get counselors who have confirmed/completed appointments with family member
router.get('/:userId/counselors-with-appointments', familyMemberCounselorChatController.getCounselorsWithAppointments);

// Get appointment history between family member and specific counselor
router.get('/:userId/counselor/:counselorId/appointments', familyMemberCounselorChatController.getAppointmentHistoryWithCounselor);

module.exports = router;
