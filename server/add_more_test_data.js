const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function createTestAppointments() {
  try {
    console.log('Creating test appointments for doctor@gmail.com (doctor_id: 2)...\n');
    
    // Get current time
    const now = new Date();
    console.log('Current time:', now.toISOString());
    
    // Create appointments at different times relative to now
    const appointments = [
      {
        time: new Date(now.getTime() + 5 * 60 * 1000), // 5 minutes from now
        patientId: 1,
        notes: 'Test appointment - Starting in 5 minutes'
      },
      {
        time: new Date(now.getTime() + 15 * 60 * 1000), // 15 minutes from now
        patientId: 12,
        notes: 'Test appointment - Starting in 15 minutes'
      },
      {
        time: new Date(now.getTime() + 30 * 60 * 1000), // 30 minutes from now
        patientId: 16,
        notes: 'Test appointment - Starting in 30 minutes'
      },
      {
        time: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour from now
        patientId: 1,
        notes: 'Test appointment - Starting in 1 hour'
      }
    ];
    
    console.log('Creating appointments...');
    
    for (let i = 0; i < appointments.length; i++) {
      const apt = appointments[i];
      
      const result = await pool.query(`
        INSERT INTO appointment (doctor_id, elder_id, date_time, appointment_type, status, notes)
        VALUES (2, $1, $2, 'online', 'confirmed', $3)
        RETURNING appointment_id, doctor_id, elder_id, date_time, appointment_type, status, notes
      `, [apt.patientId, apt.time, apt.notes]);
      
      console.log(`Created appointment ${i + 1}:`, {
        appointment_id: result.rows[0].appointment_id,
        patient_id: result.rows[0].elder_id,
        time: result.rows[0].date_time,
        notes: result.rows[0].notes
      });
    }
    
    console.log('\n✅ Test appointments created successfully!');
    console.log('\nYou can now:');
    console.log('1. Login to the doctor dashboard with Doctor@gmail.com');
    console.log('2. Look for the "Join Meeting" buttons on confirmed online appointments');
    console.log('3. Test the meeting functionality');
    
  } catch (error) {
    console.error('Error creating test appointments:', error.message);
  } finally {
    await pool.end();
  }
}

createTestAppointments();
