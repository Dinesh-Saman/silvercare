const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function checkAppointments() {
  try {
    console.log('Connecting to database...');
    
    const result = await pool.query(`
      SELECT appointment_id, doctor_id, elder_id, date_time, appointment_type, status, zoom_join_url 
      FROM appointment 
      WHERE appointment_type = 'online' AND status = 'confirmed' 
      LIMIT 5
    `);
    
    console.log('Confirmed online appointments:');
    console.log(JSON.stringify(result.rows, null, 2));
    
    if (result.rows.length > 0) {
      const testAppointment = result.rows[0];
      console.log(`\nTest with: Doctor ID ${testAppointment.doctor_id}, Appointment ID ${testAppointment.appointment_id}`);
    } else {
      console.log('No confirmed online appointments found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

checkAppointments();
