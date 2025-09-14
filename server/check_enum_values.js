require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function checkEnumValues() {
  try {
    console.log('Checking counselor table enum values...');
    
    // Check what enum values are available
    const enumQuery = `
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'approval_status'
      )
    `;
    
    const enumResult = await pool.query(enumQuery);
    console.log('Available approval_status enum values:', enumResult.rows.map(r => r.enumlabel));
    
    // Check what status values actually exist in the counselor table
    const statusQuery = 'SELECT DISTINCT status FROM counselor';
    const statusResult = await pool.query(statusQuery);
    console.log('Actual status values in counselor table:', statusResult.rows.map(r => r.status));
    
    // Check total count
    const countQuery = 'SELECT COUNT(*) as total FROM counselor';
    const countResult = await pool.query(countQuery);
    console.log('Total counselors in table:', countResult.rows[0].total);
    
    // Try different status values
    for (const status of ['approved', 'pending', 'rejected']) {
      try {
        const testQuery = 'SELECT COUNT(*) as count FROM counselor WHERE status = $1';
        const testResult = await pool.query(testQuery, [status]);
        console.log(`Counselors with status '${status}':`, testResult.rows[0].count);
      } catch (err) {
        console.log(`Status '${status}' is not valid:`, err.message);
      }
    }
    
  } catch (error) {
    console.error('Error checking enum values:', error.message);
  } finally {
    await pool.end();
  }
}

checkEnumValues();