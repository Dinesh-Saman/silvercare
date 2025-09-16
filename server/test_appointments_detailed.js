const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testAppointments() {
  try {
    // Check all appointments
    console.log('All appointments in database:');
    const allAppts = await pool.query(`
      SELECT appointment_id, elder_id, doctor_id, counselor_id, 
             provider_type, status, appointment_type, date_time
      FROM appointment 
      ORDER BY appointment_id DESC 
      LIMIT 10
    `);
    
    console.table(allAppts.rows);
    
    // Check healthcare professional appointments specifically
    console.log('\n\nHealthcare professional appointments:');
    const hcAppts = await pool.query(`
      SELECT appointment_id, elder_id, counselor_id, 
             status, appointment_type, date_time
      FROM appointment 
      WHERE counselor_id IS NOT NULL
      ORDER BY appointment_id DESC
    `);
    
    console.table(hcAppts.rows);
    
    // Test our updated query for elder_id 1
    console.log('\n\nTesting updated query for elder_id 1:');
    const result = await pool.query(`
      SELECT 
        a.appointment_id,
        a.elder_id,
        a.doctor_id,
        a.counselor_id,
        a.date_time,
        a.status,
        a.appointment_type,
        u.name as provider_name,
        'doctor' as provider_type
      FROM appointment a 
      INNER JOIN doctor d ON a.doctor_id = d.doctor_id
      INNER JOIN "User" u ON d.user_id = u.user_id
      WHERE a.elder_id = $1 AND a.doctor_id IS NOT NULL
      
      UNION ALL
      
      SELECT 
        a.appointment_id,
        a.elder_id,
        a.doctor_id,
        a.counselor_id,
        a.date_time,
        a.status,
        a.appointment_type,
        u.name as provider_name,
        'healthcare_professional' as provider_type
      FROM appointment a 
      INNER JOIN counselor c ON a.counselor_id = c.counselor_id
      INNER JOIN "User" u ON c.user_id = u.user_id
      WHERE a.elder_id = $1 AND a.counselor_id IS NOT NULL
      
      ORDER BY date_time DESC
    `, [1]);
    
    console.table(result.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testAppointments();