const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function createTestAppointment() {
  try {
    console.log('Creating test appointment...');
    
    // Create an appointment for 10 minutes from now
    const appointmentTime = new Date();
    appointmentTime.setMinutes(appointmentTime.getMinutes() + 10);
    
    const result = await pool.query(`
      INSERT INTO appointment (doctor_id, elder_id, date_time, appointment_type, status, payment_status, amount)
      VALUES (2, 1, $1, 'online', 'confirmed', 'paid', 1500.00)
      RETURNING appointment_id, doctor_id, elder_id, date_time, appointment_type, status
    `, [appointmentTime]);
    
    console.log('Created test appointment:');
    console.log(JSON.stringify(result.rows[0], null, 2));
    
    const appointment = result.rows[0];
    console.log(`\nTest URL: curl.exe -X POST http://localhost:5000/api/doctor/${appointment.doctor_id}/appointments/${appointment.appointment_id}/join`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

createTestAppointment();
