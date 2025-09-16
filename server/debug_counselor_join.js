const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function debugCounselorUserJoin() {
  try {
    console.log('Debugging counselor-user join...');
    
    // First, check counselors
    console.log('\n1. Checking counselors table:');
    const counselors = await pool.query('SELECT counselor_id, user_id, specialization FROM counselor LIMIT 5');
    console.table(counselors.rows);
    
    // Check corresponding users
    console.log('\n2. Checking User table for those user_ids:');
    const userIds = counselors.rows.map(c => c.user_id).filter(id => id);
    if (userIds.length > 0) {
      const users = await pool.query('SELECT user_id, name, role FROM "User" WHERE user_id = ANY($1)', [userIds]);
      console.table(users.rows);
    }
    
    // Check the join specifically
    console.log('\n3. Testing the join query:');
    const joinResult = await pool.query(`
      SELECT 
        c.counselor_id,
        c.user_id,
        c.specialization,
        u.name as user_name,
        u.role
      FROM counselor c 
      LEFT JOIN "User" u ON c.user_id = u.user_id
      WHERE c.status = 'confirmed'
      LIMIT 5
    `);
    console.table(joinResult.rows);
    
    // Check appointments with counselor_id
    console.log('\n4. Checking appointments with counselor_id:');
    const appointmentCheck = await pool.query(`
      SELECT 
        appointment_id,
        elder_id,
        counselor_id,
        status,
        date_time
      FROM appointment 
      WHERE counselor_id IS NOT NULL
      ORDER BY appointment_id DESC
      LIMIT 5
    `);
    console.table(appointmentCheck.rows);
    
    // Test our exact query
    console.log('\n5. Testing the exact healthcare professional appointment query:');
    const testQuery = await pool.query(`
      SELECT 
        a.appointment_id,
        a.counselor_id,
        u.name as provider_name,
        c.specialization,
        c.current_institution,
        'healthcare_professional' as provider_type
      FROM appointment a 
      INNER JOIN counselor c ON a.counselor_id = c.counselor_id
      INNER JOIN "User" u ON c.user_id = u.user_id
      WHERE a.elder_id = $1 AND a.counselor_id IS NOT NULL
      LIMIT 3
    `, [3]);
    console.table(testQuery.rows);
    
  } catch (error) {
    console.error('Error in debugging:', error);
  } finally {
    await pool.end();
  }
}

debugCounselorUserJoin();