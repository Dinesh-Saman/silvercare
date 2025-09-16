const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testElderWithHealthcareAppts() {
  try {
    console.log('Testing updated query for elder_id 3 (who has healthcare appointments):');
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
        d.specialization,
        d.current_institution,
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
        c.specialization,
        c.current_institution,
        'healthcare_professional' as provider_type
      FROM appointment a 
      INNER JOIN counselor c ON a.counselor_id = c.counselor_id
      INNER JOIN "User" u ON c.user_id = u.user_id
      WHERE a.elder_id = $1 AND a.counselor_id IS NOT NULL
      
      ORDER BY date_time DESC
    `, [3]);
    
    console.table(result.rows);
    console.log(`\nFound ${result.rows.length} total appointments for elder_id 3`);
    console.log(`Doctor appointments: ${result.rows.filter(r => r.provider_type === 'doctor').length}`);
    console.log(`Healthcare professional appointments: ${result.rows.filter(r => r.provider_type === 'healthcare_professional').length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testElderWithHealthcareAppts();