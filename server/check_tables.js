const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function checkTables() {
  try {
    console.log('📋 Checking database tables...\n');
    
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('Available tables:');
    tablesResult.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    // Check elder table structure
    console.log('\n📊 Elder table structure:');
    const elderColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'elder' 
      ORDER BY ordinal_position
    `);
    
    elderColumns.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}`);
    });
    
    // Get sample elder data
    console.log('\n👥 Sample elder data:');
    const elderSample = await pool.query(`
      SELECT elder_id, name, email, phone 
      FROM elder 
      WHERE elder_id IN (1, 12, 16) 
      ORDER BY elder_id
    `);
    
    elderSample.rows.forEach(elder => {
      console.log(`- Elder ${elder.elder_id}: ${elder.name} (${elder.email || 'No email'})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();
