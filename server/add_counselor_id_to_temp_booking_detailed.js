const pool = require('./db');

async function addCounselorIdToTemporaryBooking() {
  try {
    console.log('Checking if counselor_id column already exists...');
    
    // Check if counselor_id column already exists
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'temporary_booking' AND column_name = 'counselor_id'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ counselor_id column already exists in temporary_booking table');
    } else {
      console.log('Adding counselor_id column to temporary_booking table...');
      
      // Add counselor_id column
      await pool.query(`
        ALTER TABLE temporary_booking 
        ADD COLUMN counselor_id INTEGER REFERENCES counselor(counselor_id)
      `);
      
      console.log('✅ Successfully added counselor_id column');
    }
    
    // Check if doctor_id is already nullable
    const doctorIdCheck = await pool.query(`
      SELECT is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'temporary_booking' AND column_name = 'doctor_id'
    `);
    
    if (doctorIdCheck.rows[0].is_nullable === 'NO') {
      console.log('Making doctor_id nullable...');
      await pool.query(`
        ALTER TABLE temporary_booking 
        ALTER COLUMN doctor_id DROP NOT NULL
      `);
      console.log('✅ Made doctor_id nullable');
    } else {
      console.log('✅ doctor_id is already nullable');
    }
    
    // Verify the final structure
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'temporary_booking' 
      ORDER BY ordinal_position
    `);
    
    console.log('\nFinal temporary_booking table structure:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
      hint: err.hint
    });
    process.exit(1);
  }
}

addCounselorIdToTemporaryBooking();