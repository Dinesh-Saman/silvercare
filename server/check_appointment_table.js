const pool = require('./db');

async function checkAppointmentTable() {
  try {
    console.log('Checking appointment table structure...');
    
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'appointment' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Appointment table columns:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}) ${row.column_default ? `default: ${row.column_default}` : ''}`);
    });
    
    console.log('\nChecking if counselor_id and provider_type columns exist...');
    const hasColumns = result.rows.some(row => row.column_name === 'counselor_id') && 
                      result.rows.some(row => row.column_name === 'provider_type');
    
    console.log(`Healthcare professional columns exist: ${hasColumns}`);
    
    if (hasColumns) {
      console.log('\nChecking counselor table...');
      const counselorResult = await pool.query('SELECT id, name, specialty FROM counselor LIMIT 5;');
      console.log('Sample counselors:');
      counselorResult.rows.forEach(counselor => {
        console.log(`- ID: ${counselor.id}, Name: ${counselor.name}, Specialty: ${counselor.specialty}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAppointmentTable();
