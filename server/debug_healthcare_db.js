// Test the database query directly
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function testHealthcareProfessionalsQuery() {
  try {
    console.log('Testing healthcare professionals database query...');
    
    // Test the exact query from the controller
    const counselorsResult = await pool.query(
      `SELECT 
        c.counselor_id,
        u.name as counselor_name,
        c.specialization as specialty,
        u.phone,
        u.email,
        c.years_of_experience as years_experience,
        c.district,
        c.status,
        u.created_at
      FROM counselor c
      JOIN "User" u ON c.user_id = u.user_id
      WHERE c.status = 'confirmed'
      ORDER BY c.years_of_experience DESC, u.name ASC`
    );
    
    console.log(`✅ Query executed successfully!`);
    console.log(`Found ${counselorsResult.rows.length} approved healthcare professionals:`);
    
    if (counselorsResult.rows.length === 0) {
      console.log('❌ No healthcare professionals found!');
      console.log('This explains why clicking the healthcare professional options does nothing.');
      console.log('');
      console.log('Let me create a test healthcare professional...');
      
      // Create test user
      const userResult = await pool.query(
        `INSERT INTO "User" (name, email, phone, password, role, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING user_id`,
        ['Dr. Test Healthcare Professional', 'test.healthcare@silvercare.com', '+94123456789', 'hashed_password', 'counselor', new Date()]
      );
      
      const userId = userResult.rows[0].user_id;
      
      // Create counselor record
      await pool.query(
        `INSERT INTO counselor (user_id, specialization, district, years_of_experience, status, license_number, alternative_number, proof, current_institution)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [userId, 'Clinical Psychology', 'Colombo', 5, 'confirmed', 'TEST123', '+94123456789', 'test_proof.pdf', 'Test Healthcare Center']
      );
      
      console.log('✅ Created test healthcare professional!');
      
      // Re-run the query
      const retestResult = await pool.query(
        `SELECT 
          c.counselor_id,
          u.name as counselor_name,
          c.specialization as specialty,
          u.phone,
          u.email,
          c.years_of_experience as years_experience,
          c.district,
          c.status,
          u.created_at
        FROM counselor c
        JOIN "User" u ON c.user_id = u.user_id
        WHERE c.status = 'confirmed'
        ORDER BY c.years_of_experience DESC, u.name ASC`
      );
      
      console.log(`Now found ${retestResult.rows.length} healthcare professionals:`);
      retestResult.rows.forEach((prof, index) => {
        console.log(`  ${index + 1}. ${prof.counselor_name} - ${prof.specialty} (${prof.district})`);
      });
    } else {
      counselorsResult.rows.forEach((prof, index) => {
        console.log(`  ${index + 1}. ${prof.counselor_name} - ${prof.specialty} (${prof.district})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database query failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

testHealthcareProfessionalsQuery();