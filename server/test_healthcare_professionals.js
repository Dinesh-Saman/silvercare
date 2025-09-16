require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function testHealthcareProfessionals() {
  try {
    console.log('Testing healthcare professionals in database...');
    
    // Check if counselor table exists and has data
    const counselorQuery = `
      SELECT 
        counselor_id,
        counselor_name,
        specialty,
        email,
        district,
        years_experience,
        account_status
      FROM counselor 
      WHERE account_status = 'approved'
      LIMIT 5
    `;
    
    const result = await pool.query(counselorQuery);
    
    console.log('Healthcare professionals found:', result.rows.length);
    console.log('Sample healthcare professionals:', JSON.stringify(result.rows, null, 2));
    
    if (result.rows.length === 0) {
      console.log('No approved healthcare professionals found in database');
      console.log('Creating test healthcare professional...');
      
      // Insert a test healthcare professional
      const insertQuery = `
        INSERT INTO counselor 
        (counselor_name, specialty, email, district, years_experience, account_status, password)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING counselor_id, counselor_name, specialty, district
      `;
      
      const insertResult = await pool.query(insertQuery, [
        'Dr. Sarah Johnson',
        'Clinical Psychology',
        'sarah.johnson@healthcare.com',
        'Colombo',
        8,
        'approved',
        'hashedpassword123' // This would normally be properly hashed
      ]);
      
      console.log('Test healthcare professional created:', insertResult.rows[0]);
    }
    
  } catch (error) {
    console.error('Error testing healthcare professionals:', error.message);
  } finally {
    process.exit(0);
  }
}

testHealthcareProfessionals();
