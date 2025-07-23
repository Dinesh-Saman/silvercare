const pool = require('./db');
const meetingService = require('./services/meetingService');

async function testMeetingGeneration() {
  try {
    console.log('Testing meeting generation with precise timing...\n');

    // Create an online appointment exactly 10 minutes from now
    const now = new Date();
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
    
    console.log('Current time:', now.toLocaleString());
    console.log('Creating appointment for:', tenMinutesFromNow.toLocaleString());

    // Create the appointment
    const result = await pool.query(`
      INSERT INTO appointment (elder_id, doctor_id, date_time, status, appointment_type, notes)
      VALUES (3, 5, $1, 'confirmed', 'online', 'TEST: Meeting generation test')
      RETURNING *
    `, [tenMinutesFromNow]);

    const appointment = result.rows[0];
    console.log('✅ Created appointment ID:', appointment.appointment_id);

    // Check what's in the window
    console.log('\n🔍 Checking appointments in 15-minute window...');
    const windowCheck = await pool.query(`
      SELECT 
        appointment_id, 
        date_time, 
        appointment_type, 
        status, 
        meeting_link,
        NOW() as current_time,
        date_time - NOW() as time_diff
      FROM appointment 
      WHERE status = 'confirmed' 
      AND appointment_type = 'online'
      AND date_time BETWEEN NOW() AND NOW() + INTERVAL '15 minutes'
      AND (meeting_link IS NULL OR meeting_link = '')
      ORDER BY date_time
    `);

    console.log(`Found ${windowCheck.rows.length} appointments in window:`);
    windowCheck.rows.forEach(row => {
      console.log(`- ID: ${row.appointment_id}, Time: ${row.date_time}, Type: ${row.appointment_type}`);
    });

    // Generate meeting links
    console.log('\n🔗 Generating meeting links...');
    const generatedLinks = await meetingService.generateLinksForUpcomingAppointments();
    
    console.log(`Generated links for ${generatedLinks.length} appointments:`);
    generatedLinks.forEach(apt => {
      console.log(`✅ Appointment ${apt.appointment_id}: ${apt.meeting_link}`);
    });

    // Check if our appointment got a link
    const updatedAppointment = await pool.query(
      'SELECT * FROM appointment WHERE appointment_id = $1',
      [appointment.appointment_id]
    );

    console.log('\n📋 Final appointment status:');
    console.log('Meeting link:', updatedAppointment.rows[0].meeting_link || 'No link generated');

    // Test joinable appointments
    console.log('\n🎯 Testing joinable appointments for doctor 5...');
    const joinableAppointments = await meetingService.getJoinableAppointments(5);
    console.log(`Found ${joinableAppointments.length} joinable appointments:`);
    joinableAppointments.forEach(apt => {
      console.log(`- ID: ${apt.appointment_id}, Time: ${apt.date_time}, Link: ${apt.meeting_link ? 'Yes' : 'No'}`);
    });

  } catch (error) {
    console.error('Error in test:', error);
  } finally {
    process.exit();
  }
}

testMeetingGeneration();
