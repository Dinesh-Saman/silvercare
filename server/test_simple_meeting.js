const pool = require('./db');
const meetingService = require('./services/meetingService');

async function simpleTest() {
  try {
    // Create appointment using a simple SQL timestamp
    console.log('Creating appointment with SQL timestamp...');
    
    const result = await pool.query(`
      INSERT INTO appointment (elder_id, doctor_id, date_time, status, appointment_type, notes)
      VALUES (3, 5, NOW() + INTERVAL '8 minutes', 'confirmed', 'online', 'TEST: Simple meeting test')
      RETURNING *, NOW() as current_db_time
    `);

    console.log('Created appointment:', result.rows[0]);

    // Now test the query directly
    console.log('\nTesting query directly...');
    const queryResult = await pool.query(`
      SELECT 
        a.appointment_id,
        a.date_time,
        a.appointment_type,
        a.meeting_link,
        NOW() as db_now,
        NOW() + INTERVAL '15 minutes' as window_end
      FROM appointment a
      WHERE a.status = 'confirmed'
      AND a.appointment_type = 'online'
      AND a.date_time BETWEEN NOW() AND NOW() + INTERVAL '15 minutes'
      AND (a.meeting_link IS NULL OR a.meeting_link = '')
      ORDER BY a.date_time
    `);

    console.log(`Found ${queryResult.rows.length} appointments:`);
    queryResult.rows.forEach(row => {
      console.log(`- ID: ${row.appointment_id}, Time: ${row.date_time}`);
      console.log(`  DB Now: ${row.db_now}`);
      console.log(`  Window End: ${row.window_end}`);
    });

    // Generate meeting link
    if (queryResult.rows.length > 0) {
      console.log('\nGenerating meeting links...');
      const generated = await meetingService.generateLinksForUpcomingAppointments();
      console.log('Generated:', generated.length);
      
      if (generated.length > 0) {
        console.log('First generated link:', generated[0].meeting_link);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit();
}

simpleTest();
