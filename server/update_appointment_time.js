const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function updateAppointmentTime() {
  try {
    console.log('Updating appointment 122 time...');
    
    // Set appointment time to 10 minutes from now
    const appointmentTime = new Date();
    appointmentTime.setMinutes(appointmentTime.getMinutes() + 10);
    
    const result = await pool.query(`
      UPDATE appointment 
      SET date_time = $1, zoom_join_url = NULL, zoom_meeting_id = NULL
      WHERE appointment_id = 122
      RETURNING appointment_id, doctor_id, elder_id, date_time, appointment_type, status
    `, [appointmentTime]);
    
    console.log('Updated appointment:');
    console.log(JSON.stringify(result.rows[0], null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

updateAppointmentTime();
