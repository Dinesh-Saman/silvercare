require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkSchema() {
  try {
    // Check elder table structure
    const elderSchema = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'elder'
      ORDER BY ordinal_position
    `);
    
    console.log('Elder table columns:');
    elderSchema.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type}`);
    });
    
    // Check session table structure
    const sessionSchema = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'session'
      ORDER BY ordinal_position
    `);
    
    console.log('\nSession table columns:');
    sessionSchema.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type}`);
    });
    
    // Get some sample elder data
    const elderData = await pool.query('SELECT * FROM elder LIMIT 3');
    console.log('\nSample elder data:');
    console.log(JSON.stringify(elderData.rows, null, 2));
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    pool.end();
  }
}

checkSchema();
