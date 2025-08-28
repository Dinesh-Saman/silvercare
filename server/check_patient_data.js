const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function checkPatientData() {
  try {
    console.log('👥 Checking Patient Data for Meeting Testing...\n');
    
    // Get today's appointments and patient info
    const result = await pool.query(`
      SELECT a.appointment_id, a.elder_id, a.date_time, a.zoom_join_url,
             e.name as patient_name, e.email, e.contact
      FROM appointment a
      LEFT JOIN elder e ON a.elder_id = e.elder_id
      WHERE a.doctor_id = 2 
        AND a.appointment_type = 'online'
        AND a.status = 'confirmed'
        AND DATE(a.date_time) = CURRENT_DATE
      ORDER BY a.date_time
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No appointments found for today');
      return;
    }
    
    console.log('✅ Available Appointments for Testing:\n');
    
    result.rows.forEach((apt, index) => {
      const time = new Date(apt.date_time);
      const now = new Date();
      const minutesFromNow = Math.round((time - now) / 60000);
      
      console.log(`${index + 1}. Appointment ${apt.appointment_id}:`);
      console.log(`   Patient: ${apt.patient_name || 'Unknown'} (ID: ${apt.elder_id})`);
      console.log(`   Email: ${apt.email || 'No email'}`);
      console.log(`   Contact: ${apt.contact || 'No contact'}`);
      console.log(`   Time: ${time.toLocaleString()} (${minutesFromNow > 0 ? `in ${minutesFromNow}min` : `${Math.abs(minutesFromNow)}min ago`})`);
      console.log(`   Meeting URL: ${apt.zoom_join_url || 'Not generated yet'}`);
      console.log('');
    });
    
    console.log('🔧 For Patient Testing:');
    console.log('Since patients don\'t have login accounts, they will access meetings via direct links.');
    console.log('The meeting URLs will be generated when the doctor joins first.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkPatientData();
