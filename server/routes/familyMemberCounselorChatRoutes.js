const express = require('express');
const router = express.Router();
const { getCounselorsWithAppointments, getAppointmentHistoryWithCounselor } = require('../controllers/familyMemberCounselorChatController');

// Get counselors that have appointments with family member
router.get('/family/:userId/counselors', getCounselorsWithAppointments);

// Get appointment history between family member and counselor
router.get('/family/:userId/counselor/:counselorId/appointments', getAppointmentHistoryWithCounselor);

module.exports = router;
