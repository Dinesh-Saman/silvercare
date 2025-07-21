const express = require('express');
const router = express.Router();
const { 
  getCareAssignmentsByWeek,
  getDayCareAssignments,
  getCareAssignmentStats
} = require('../controllers/carerequest');

// Get care assignments by week for an elder
router.get('/:elderId/week', getCareAssignmentsByWeek);

// Get care assignments for a specific day
router.get('/:elderId/day', getDayCareAssignments);

// Get care assignment stats for elder dashboard
router.get('/:elderId/stats', getCareAssignmentStats);

module.exports = router;
