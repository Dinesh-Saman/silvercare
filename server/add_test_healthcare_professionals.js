require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function addTestHealthcareProfessionals() {
  try {
    console.log('Adding test healthcare professionals...');
    
    const testHealthcareProfessionals = [
      {
        counselor_name: 'Dr. Sarah Johnson',
        specialty: 'Clinical Psychology',
        email: 'sarah.johnson@silvercare.com',
        district: 'Colombo',
        years_experience: 8,
        password: '$2b$10$example_hashed_password' // This should be properly hashed
      },
      {
        counselor_name: 'Dr. Michael Chen',
        specialty: 'Mental Health Counseling',
        email: 'michael.chen@silvercare.com',
        district: 'Kandy',
        years_experience: 12,
        password: '$2b$10$example_hashed_password'
      },
      {
        counselor_name: 'Dr. Priya Patel',
        specialty: 'Therapy and Counseling',
        email: 'priya.patel@silvercare.com',
        district: 'Gampaha',
        years_experience: 6,
        password: '$2b$10$example_hashed_password'
      }
    ];
    
    for (const professional of testHealthcareProfessionals) {
      // Check if professional already exists
      const existingCheck = await pool.query(
        'SELECT counselor_id FROM counselor WHERE email = $1',
        [professional.email]
      );
      
      if (existingCheck.rows.length === 0) {
        const insertQuery = `
          INSERT INTO counselor 
          (counselor_name, specialty, email, district, years_experience, account_status, password)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING counselor_id, counselor_name, specialty, district
        `;
        
        const result = await pool.query(insertQuery, [
          professional.counselor_name,
          professional.specialty,
          professional.email,
          professional.district,
          professional.years_experience,
          'approved', // Set as approved so they show up
          professional.password
        ]);
        
        console.log('✅ Added healthcare professional:', result.rows[0]);
      } else {
        console.log('⚠️  Healthcare professional already exists:', professional.counselor_name);
      }
    }
    
    // Check total count
    const countResult = await pool.query('SELECT COUNT(*) as count FROM counselor WHERE account_status = $1', ['approved']);
    console.log(`\n📊 Total approved healthcare professionals: ${countResult.rows[0].count}`);
    
    console.log('\n🎉 Healthcare professional setup complete!');
    console.log('You can now test the healthcare professional booking feature.');
    
  } catch (error) {
    console.error('❌ Error adding healthcare professionals:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

addTestHealthcareProfessionals();
