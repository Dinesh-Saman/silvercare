const pool = require('../db');



// CREATE Feedback
const createFeedback = async (req, res) => {
  const { doctor_id, patient_id, rating, comment } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO feedback (doctor_id, patient_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [doctor_id, patient_id, rating, comment]);
    res.json({ success: true, feedback: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error creating feedback' });
  }
};

// READ All Feedback
const getFeedbacks = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM feedback ORDER BY created_at DESC`);
    res.json({ success: true, feedbacks: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error fetching feedbacks' });
  }
};

// READ Feedback By Doctor
const getFeedbackByDoctor = async (req, res) => {
  const { doctor_id } = req.params;
  try {
    console.log('Fetching feedbacks for doctor ID:', doctor_id);
    const result = await pool.query(`SELECT rating FROM feedback WHERE doctor_id = doctor_id ORDER BY created_at DESC`, [doctor_id]);
     if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'doctor feedback not found'
      });
    }
    
    const familyMember = result.rows[0];
    console.log('doctor feedback fetched successfully');
    
    res.json({
      success: true,
      doctor_id: doctor_id
    });
    res.json({ success: true, feedbacks: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error fetching feedbacks' });
  }
};

// READ Feedback By Patient
const getFeedbackByPatient = async (req, res) => {
  const { patient_id } = req.params;
  try {
    const result = await pool.query(`SELECT * FROM feedback WHERE patient_id = $1 ORDER BY created_at DESC`, [patient_id]);
    res.json({ success: true, feedbacks: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error fetching feedbacks' });
  }
};

// UPDATE Feedback
const updateFeedback = async (req, res) => {
  const { feedback_id } = req.params;
  const { rating, comment } = req.body;
  try {
    const result = await pool.query(`
      UPDATE feedback SET rating = $1, comment = $2
      WHERE feedback_id = $3
      RETURNING *
    `, [rating, comment, feedback_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Feedback not found' });
    }
    res.json({ success: true, feedback: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error updating feedback' });
  }
};

// DELETE Feedback
const deleteFeedback = async (req, res) => {
  const { feedback_id } = req.params;
  try {
    const result = await pool.query(`DELETE FROM feedback WHERE feedback_id = $1 RETURNING *`, [feedback_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Feedback not found' });
    }
    res.json({ success: true, message: 'Feedback deleted', feedback: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error deleting feedback' });
  }
};

module.exports = {
  createFeedback,
  getFeedbacks,
  getFeedbackByDoctor,
  getFeedbackByPatient,
  updateFeedback,
  deleteFeedback
};