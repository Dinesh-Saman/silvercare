const pool = require('./db');

async function checkTempBookingTable() {
  try {
    // Check temporary_booking table columns
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'temporary_booking' 
      ORDER BY ordinal_position
    `);
    
    console.log('Temporary_booking table columns:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkTempBookingTable();