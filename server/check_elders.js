require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkElders() {
  try {
    // Get elders with their emails
    const result = await pool.query(`
      SELECT e.elder_id, u.email, u.name 
      FROM elder e 
      JOIN "User" u ON e.user_id = u.user_id 
      ORDER BY e.elder_id 
      LIMIT 10
    `);
    
    console.log('Elders with email addresses:');
    result.rows.forEach(row => {
      console.log(`Elder ID: ${row.elder_id}, Email: ${row.email}, Name: ${row.name}`);
    });
    
    // Check which elders have sessions
    const sessionResult = await pool.query(`
      SELECT e.elder_id, u.email, u.name, COUNT(s.session_id) as session_count
      FROM elder e 
      JOIN "User" u ON e.user_id = u.user_id 
      LEFT JOIN session s ON e.elder_id = s.elder_id
      GROUP BY e.elder_id, u.email, u.name
      HAVING COUNT(s.session_id) > 0
      ORDER BY e.elder_id
    `);
    
    console.log('\nElders with sessions:');
    sessionResult.rows.forEach(row => {
      console.log(`Elder ID: ${row.elder_id}, Email: ${row.email}, Name: ${row.name}, Sessions: ${row.session_count}`);
    });
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    pool.end();
  }
}

checkElders();
