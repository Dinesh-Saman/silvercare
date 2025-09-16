require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function testHealthcareApi() {
  try {
    console.log('Testing healthcare professional API endpoint...');
    
    // Test the exact query used in the API
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
        c.created_at
      FROM counselor c
      JOIN "User" u ON c.user_id = u.user_id
      WHERE c.status = 'approved'
      ORDER BY c.years_of_experience DESC, u.name ASC`
    );
    
    console.log(`Found ${counselorsResult.rows.length} approved healthcare professionals:`);
    
    if (counselorsResult.rows.length === 0) {
      console.log('❌ No approved healthcare professionals found!');
      console.log('Creating a test healthcare professional...');
      
      // Create a simple test user and counselor
      const userResult = await pool.query(
        `INSERT INTO "User" (name, email, phone, password, role, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING user_id`,
        ['Dr. Test Counselor', 'test.counselor@silvercare.com', '+94771111111', 'hashed_password', 'counselor', new Date()]
      );
      
      const userId = userResult.rows[0].user_id;
      
      const counselorResult = await pool.query(
        `INSERT INTO counselor (user_id, specialization, district, years_of_experience, status, license_number, alternative_number, proof, current_institution)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING counselor_id`,
        [userId, 'Clinical Psychology', 'Colombo', 5, 'approved', 'LIC123', '+94771111111', 'test_proof.pdf', 'Test Institution']
      );
      
      console.log('✅ Created test healthcare professional');
      
      // Run the query again
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
          c.created_at
        FROM counselor c
        JOIN "User" u ON c.user_id = u.user_id
        WHERE c.status = 'approved'
        ORDER BY c.years_of_experience DESC, u.name ASC`
      );
      
      console.log(`Now found ${retestResult.rows.length} approved healthcare professionals`);
      retestResult.rows.forEach(prof => {
        console.log(`  - ID: ${prof.counselor_id}, Name: ${prof.counselor_name}, Specialty: ${prof.specialty}, District: ${prof.district}`);
      });
    } else {
      counselorsResult.rows.forEach(prof => {
        console.log(`  - ID: ${prof.counselor_id}, Name: ${prof.counselor_name}, Specialty: ${prof.specialty}, District: ${prof.district}`);
      });
    }
    
    console.log('\n🎉 Healthcare professional API should now work!');
    
  } catch (error) {
    console.error('❌ Error testing healthcare API:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

testHealthcareApi();
