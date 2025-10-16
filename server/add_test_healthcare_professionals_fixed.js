require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function addTestHealthcareProfessionals() {
  try {
    console.log('Adding test healthcare professionals with correct schema...');
    
    const testHealthcareProfessionals = [
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@silvercare.com',
        phone: '+94771234567',
        specialization: 'Clinical Psychology',
        district: 'Colombo',
        years_of_experience: 8,
        password: '$2b$10$example_hashed_password' // This should be properly hashed
      },
      {
        name: 'Dr. Michael Chen',
        email: 'michael.chen@silvercare.com',
        phone: '+94771234568',
        specialization: 'Mental Health Counseling',
        district: 'Kandy',
        years_of_experience: 12,
        password: '$2b$10$example_hashed_password'
      },
      {
        name: 'Dr. Priya Patel',
        email: 'priya.patel@silvercare.com',
        phone: '+94771234569',
        specialization: 'Therapy and Counseling',
        district: 'Gampaha',
        years_of_experience: 6,
        password: '$2b$10$example_hashed_password'
      }
    ];
    
    for (const professional of testHealthcareProfessionals) {
      // Check if user already exists
      const existingUserCheck = await pool.query(
        'SELECT user_id FROM "User" WHERE email = $1',
        [professional.email]
      );
      
      if (existingUserCheck.rows.length === 0) {
        // First create the user
        const userInsertQuery = `
          INSERT INTO "User" 
          (name, email, phone, password, role, created_at)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING user_id, name, email
        `;
        
        const userResult = await pool.query(userInsertQuery, [
          professional.name,
          professional.email,
          professional.phone,
          professional.password,
          'counselor', // Set role as counselor
          new Date()
        ]);
        
        const userId = userResult.rows[0].user_id;
        console.log('✅ Added user:', userResult.rows[0]);
        
        // Then create the counselor record
        const counselorInsertQuery = `
          INSERT INTO counselor 
          (user_id, specialization, district, years_of_experience, status, license_number, alternative_number, proof, current_institution)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING counselor_id, specialization, district, years_of_experience
        `;
        
        const counselorResult = await pool.query(counselorInsertQuery, [
          userId,
          professional.specialization,
          professional.district,
          professional.years_of_experience,
          'approved', // Set as approved so they show up
          `LIC-${Date.now()}`, // Generate a license number
          professional.phone, // Use same phone as alternative
          'verified_document.pdf', // Placeholder for proof document
          'Online Healthcare Services' // Institution name
        ]);
        
        console.log('✅ Added counselor:', counselorResult.rows[0]);
      } else {
        console.log('⚠️  User already exists:', professional.name);
      }
    }
    
    // Check total count of approved counselors
    const countResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM counselor c
      JOIN "User" u ON c.user_id = u.user_id
      WHERE c.status = $1
    `, ['approved']);
    
    console.log(`\n📊 Total approved healthcare professionals: ${countResult.rows[0].count}`);
    
    // Display all approved healthcare professionals
    const allResult = await pool.query(`
      SELECT 
        c.counselor_id,
        u.name as counselor_name,
        c.specialization,
        c.district,
        c.years_of_experience,
        u.email,
        u.phone
      FROM counselor c
      JOIN "User" u ON c.user_id = u.user_id
      WHERE c.status = 'approved'
      ORDER BY c.years_of_experience DESC
    `);
    
    console.log('\n👩‍⚕️ Available Healthcare Professionals:');
    allResult.rows.forEach(prof => {
      console.log(`  - ${prof.counselor_name} (${prof.specialization}) - ${prof.district} - ${prof.years_of_experience} years`);
    });
    
    console.log('\n🎉 Healthcare professional setup complete with correct schema!');
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
