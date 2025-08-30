const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function verifyMeetingSystem() {
  try {
    console.log('📋 Meeting System Status Check\n');
    
    // Check today's appointments
    const today = new Date().toISOString().split('T')[0];
    const result = await pool.query(`
      SELECT appointment_id, elder_id, date_time, status, zoom_join_url, notes
      FROM appointment 
      WHERE doctor_id = 2 
        AND appointment_type = 'online' 
        AND status = 'confirmed'
        AND DATE(date_time) = $1
      ORDER BY date_time ASC
    `, [today]);
    
    console.log(`✅ Found ${result.rows.length} test appointments for today:`);
    
    result.rows.forEach((apt, i) => {
      const time = new Date(apt.date_time);
      const now = new Date();
      const minutesFromNow = Math.round((time - now) / 60000);
      
      console.log(`\n${i + 1}. Appointment ${apt.appointment_id}:`);
      console.log(`   Time: ${time.toLocaleString()} (${minutesFromNow > 0 ? `in ${minutesFromNow}min` : `${Math.abs(minutesFromNow)}min ago`})`);
      console.log(`   Patient ID: ${apt.elder_id}`);
      console.log(`   Meeting URL: ${apt.zoom_join_url || 'Will be generated on join'}`);
    });
    
    console.log('\n🔧 Login Information:');
    console.log('Email: Doctor@gmail.com');
    console.log('Dashboard: http://localhost:3000/doctor/dashboard');
    
    console.log('\n✅ System Ready for Testing!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyMeetingSystem();
