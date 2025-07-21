const express = require('express');
const router = express.Router();
const healthProfessionalController = require('../controllers/healthProfessionalController');

// GET /api/healthprofessional/user/:userId
router.get('/user/:userId', healthProfessionalController.getByUserId);

module.exports = router; 