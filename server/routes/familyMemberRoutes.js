const express = require('express');
const router = express.Router();
const familyMemberController = require('../controllers/familyMemberController');

// Get family member details by user ID
router.get('/:userId', familyMemberController.getFamilyMemberDetails);

// Update family member details
router.put('/:userId', familyMemberController.updateFamilyMemberDetails);

module.exports = router;
