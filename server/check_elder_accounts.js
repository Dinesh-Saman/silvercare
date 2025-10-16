const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkElders() {
  try {
    const result = await pool.query(`
      SELECT * FROM elder 
      ORDER BY elder_id
      LIMIT 10
    `);
    
    console.log('Available elders:');
    console.table(result.rows);
    
    // Also check which elder has upcoming appointments
    console.log('\nChecking for elders with upcoming appointments:');
    const upcomingQuery = await pool.query(`
      SELECT 
        elder_id,
        COUNT(*) as upcoming_count
      FROM appointment
      WHERE date_time > NOW() AND status != 'cancelled'
      GROUP BY elder_id
      ORDER BY upcoming_count DESC
    `);
    
    console.table(upcomingQuery.rows);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkElders();