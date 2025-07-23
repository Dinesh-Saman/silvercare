const express = require('express');
const router = express.Router();
const meetingService = require('../services/meetingService');
const meetingScheduler = require('../jobs/meetingScheduler');

// Manual trigger for meeting link generation (for testing)
router.post('/generate-links', async (req, res) => {
  try {
    const updatedAppointments = await meetingService.generateLinksForUpcomingAppointments();
    res.json({
      success: true,
      message: `Generated meeting links for ${updatedAppointments.length} appointments`,
      appointments: updatedAppointments
    });
  } catch (error) {
    console.error('Error generating meeting links:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate meeting links',
      details: error.message
    });
  }
});

// Get joinable appointments for a doctor
router.get('/joinable/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appointments = await meetingService.getJoinableAppointments(doctorId);
    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Error fetching joinable appointments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch joinable appointments',
      details: error.message
    });
  }
});

// Get scheduler status
router.get('/scheduler/status', (req, res) => {
  const status = meetingScheduler.getStatus();
  res.json({
    success: true,
    scheduler: status
  });
});

// Manually trigger scheduler (for testing)
router.post('/scheduler/trigger', async (req, res) => {
  try {
    await meetingScheduler.triggerNow();
    res.json({
      success: true,
      message: 'Meeting scheduler triggered successfully'
    });
  } catch (error) {
    console.error('Error triggering scheduler:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger scheduler',
      details: error.message
    });
  }
});

module.exports = router;
