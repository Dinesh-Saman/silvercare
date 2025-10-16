require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function checkCounselorTableStructure() {
  try {
    console.log('Checking counselor table structure...');
    
    // Get table structure
    const structureQuery = `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'counselor' 
      ORDER BY ordinal_position;
    `;
    
    const structureResult = await pool.query(structureQuery);
    console.log('Counselor table structure:');
    console.table(structureResult.rows);
    
    // Get sample data
    const dataQuery = `SELECT * FROM counselor LIMIT 3`;
    const dataResult = await pool.query(dataQuery);
    console.log('Sample counselor data:', JSON.stringify(dataResult.rows, null, 2));
    
    // Count total counselors
    const countResult = await pool.query('SELECT COUNT(*) FROM counselor');
    console.log('Total counselors in database:', countResult.rows[0].count);
    
  } catch (error) {
    console.error('Error checking counselor table:', error.message);
  } finally {
    await pool.end();
  }
}

checkCounselorTableStructure();
