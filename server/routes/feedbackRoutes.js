const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');



router.post('/feedback', feedbackController.createFeedback);
router.get('/feedback', feedbackController.getFeedbacks);
router.get('/feedback/doctor/:doctor_id', feedbackController.getFeedbackByDoctor);
router.get('/feedback/patient/:patient_id', feedbackController.getFeedbackByPatient);
router.put('/feedback/:feedback_id', feedbackController.updateFeedback);
router.delete('/feedback/:feedback_id', feedbackController.deleteFeedback);

module.exports = router;