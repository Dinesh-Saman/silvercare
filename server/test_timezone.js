const pool = require('./db');

async function testTimezone() {
  try {
    console.log('🕐 Testing timezone configuration...\n');

    // Check Node.js timezone
    console.log('Node.js timezone info:');
    console.log('- process.env.TZ:', process.env.TZ);
    console.log('- new Date():', new Date());
    console.log('- Date.now():', Date.now());
    console.log('- Local time string:', new Date().toLocaleString());
    console.log('- UTC time string:', new Date().toUTCString());
    console.log('');

    // Check database timezone
    console.log('Database timezone info:');
    const result = await pool.query('SELECT NOW() as db_now, CURRENT_TIMESTAMP as db_current, timezone(\'Asia/Colombo\', NOW()) as colombo_time');
    console.log('- Database NOW():', result.rows[0].db_now);
    console.log('- Database CURRENT_TIMESTAMP:', result.rows[0].db_current);
    console.log('- Database Asia/Colombo time:', result.rows[0].colombo_time);
    console.log('');

    // Test appointment time handling
    console.log('Testing appointment time handling:');
    
    // Create a test appointment for "right now" and see what happens
    const testResult = await pool.query(`
      INSERT INTO appointment (elder_id, doctor_id, date_time, status, appointment_type, notes)
      VALUES (3, 2, NOW(), 'confirmed', 'online', 'TIMEZONE_TEST: Right now')
      RETURNING *, NOW() as insertion_time
    `);

    const testApt = testResult.rows[0];
    console.log('- Created appointment time:', testApt.date_time);
    console.log('- Database insertion time:', testApt.insertion_time);
    console.log('- JavaScript Date from appointment:', new Date(testApt.date_time));
    console.log('- Time difference (minutes):', Math.round((new Date(testApt.date_time) - new Date()) / (1000 * 60)));
    console.log('');

    // Test the meeting service isWithinJoinWindow function
    const meetingService = require('./services/meetingService');
    const isJoinable = meetingService.isWithinJoinWindow(testApt.date_time);
    console.log('Meeting service join window test:');
    console.log('- Is appointment joinable?', isJoinable);
    console.log('');

    // Clean up test appointment
    await pool.query('DELETE FROM appointment WHERE notes = \'TIMEZONE_TEST: Right now\'');

    console.log('💡 If times don\'t match, there\'s a timezone configuration issue!');

  } catch (error) {
    console.error('❌ Error testing timezone:', error);
  } finally {
    process.exit();
  }
}

testTimezone();
