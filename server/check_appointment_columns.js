const pool = require('./db');

async function checkColumns() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'appointment' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Appointment table columns:');
    result.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type}`);
    });
    
    // Check if meeting columns exist
    const hasZoomColumns = result.rows.some(row => 
      ['zoom_meeting_id', 'zoom_join_url', 'zoom_host_url'].includes(row.column_name)
    );
    
    console.log('\nMeeting columns exist:', hasZoomColumns);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkColumns();
