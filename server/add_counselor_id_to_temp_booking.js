const pool = require('./db');

async function addCounselorIdToTemporaryBooking() {
  try {
    console.log('Adding counselor_id column to temporary_booking table...');
    
    // Add counselor_id column
    await pool.query(`
      ALTER TABLE temporary_booking 
      ADD COLUMN counselor_id INTEGER REFERENCES counselor(counselor_id)
    `);
    
    console.log('✅ Successfully added counselor_id column to temporary_booking table');
    
    // Also make doctor_id nullable since we'll have either doctor_id OR counselor_id
    await pool.query(`
      ALTER TABLE temporary_booking 
      ALTER COLUMN doctor_id DROP NOT NULL
    `);
    
    console.log('✅ Made doctor_id nullable in temporary_booking table');
    
    // Verify the changes
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'temporary_booking' 
      ORDER BY ordinal_position
    `);
    
    console.log('\nUpdated temporary_booking table columns:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

addCounselorIdToTemporaryBooking();