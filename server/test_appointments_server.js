// Simple server to test the updated getElderAppointments function
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Updated getElderAppointments function
const getElderAppointments = async (req, res) => {
  const { elderId } = req.params;
  
  try {
    console.log('Getting appointments for elder ID:', elderId);
    
    // Query for both doctor and healthcare professional appointments using UNION
    const result = await pool.query(
      `SELECT 
        a.appointment_id,
        a.elder_id,
        a.family_id,
        a.doctor_id,
        a.counselor_id,
        a.date_time,
        a.status,
        a.notes,
        a.appointment_type,
        a.created_at,
        a.updated_at,
        u.name as provider_name,
        d.specialization,
        d.current_institution,
        e.name as elder_name,
        'doctor' as provider_type
      FROM appointment a 
      INNER JOIN doctor d ON a.doctor_id = d.doctor_id
      INNER JOIN "User" u ON d.user_id = u.user_id
      INNER JOIN elder e ON a.elder_id = e.elder_id
      WHERE a.elder_id = $1 AND a.doctor_id IS NOT NULL
      
      UNION ALL
      
      SELECT 
        a.appointment_id,
        a.elder_id,
        a.family_id,
        a.doctor_id,
        a.counselor_id,
        a.date_time,
        a.status,
        a.notes,
        a.appointment_type,
        a.created_at,
        a.updated_at,
        u.name as provider_name,
        c.specialization,
        c.current_institution,
        e.name as elder_name,
        'healthcare_professional' as provider_type
      FROM appointment a 
      INNER JOIN counselor c ON a.counselor_id = c.counselor_id
      INNER JOIN "User" u ON c.user_id = u.user_id
      INNER JOIN elder e ON a.elder_id = e.elder_id
      WHERE a.elder_id = $1 AND a.counselor_id IS NOT NULL
      
      ORDER BY date_time DESC`,
      [elderId]
    );
    
    console.log('Found appointments:', result.rows.length);
    console.log('Appointment types:', result.rows.map(row => row.provider_type));
    
    res.json({
      success: true,
      appointments: result.rows,
      count: result.rows.length
    });
    
  } catch (err) {
    console.error('Error fetching elder appointments:', err);
    res.status(500).json({
      success: false,
      error: 'Error fetching appointments'
    });
  }
};

// Test route
app.get('/api/elders/:elderId/appointments', getElderAppointments);

const PORT = 5001; // Use different port to avoid conflicts
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log('Test the appointments API with: http://localhost:5001/api/elders/3/appointments');
});