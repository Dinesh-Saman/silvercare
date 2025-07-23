const pool = require('./db');
const meetingService = require('./services/meetingService');

async function createCurrentTimeTest() {
  try {
    console.log('Creating appointments with correct timing for immediate testing...\n');

    // Clear previous test data for doctor 2
    await pool.query("DELETE FROM appointment WHERE doctor_id = 2 AND notes LIKE '%CURRENT_TEST%'");

    // Create appointments with proper timing
    console.log('Creating new test appointments...');

    // 1. Online appointment starting in 5 minutes (will get meeting link)
    const apt1 = await pool.query(`
      INSERT INTO appointment (elder_id, doctor_id, date_time, status, appointment_type, notes)
      VALUES (3, 2, NOW() + INTERVAL '5 minutes', 'confirmed', 'online', 'CURRENT_TEST: Online in 5min')
      RETURNING *
    `);

    // 2. Online appointment starting in 10 minutes (will get meeting link)
    const apt2 = await pool.query(`
      INSERT INTO appointment (elder_id, doctor_id, date_time, status, appointment_type, notes)
      VALUES (4, 2, NOW() + INTERVAL '10 minutes', 'confirmed', 'online', 'CURRENT_TEST: Online in 10min')
      RETURNING *
    `);

    // 3. Physical appointment starting in 7 minutes (will NOT get meeting link)
    const apt3 = await pool.query(`
      INSERT INTO appointment (elder_id, doctor_id, date_time, status, appointment_type, notes)
      VALUES (5, 2, NOW() + INTERVAL '7 minutes', 'confirmed', 'physical', 'CURRENT_TEST: Physical in 7min')
      RETURNING *
    `);

    // 4. Online appointment that started 2 minutes ago (ongoing, add meeting link manually)
    const apt4 = await pool.query(`
      INSERT INTO appointment (elder_id, doctor_id, date_time, status, appointment_type, notes)
      VALUES (3, 2, NOW() - INTERVAL '2 minutes', 'confirmed', 'online', 'CURRENT_TEST: Ongoing online')
      RETURNING *
    `);

    console.log('✅ Created 4 test appointments');

    // Generate meeting link for the ongoing appointment manually
    const ongoingApt = apt4.rows[0];
    const meetingDetails = meetingService.generateMeetingLink(
      ongoingApt.appointment_id,
      2,
      ongoingApt.elder_id,
      'Dr. Indipa',
      'Test Patient'
    );

    await meetingService.updateAppointmentMeetingLink(
      ongoingApt.appointment_id,
      meetingDetails.meetingUrl
    );

    console.log('✅ Added meeting link to ongoing appointment');

    // Generate meeting links for upcoming appointments
    console.log('\nGenerating meeting links for upcoming appointments...');
    const generated = await meetingService.generateLinksForUpcomingAppointments();
    console.log(`Generated ${generated.length} meeting links`);

    // Show current status
    const currentAppointments = await pool.query(`
      SELECT 
        appointment_id, 
        appointment_type, 
        meeting_link, 
        date_time,
        NOW() as current_time,
        EXTRACT(EPOCH FROM (date_time - NOW()))/60 as minutes_from_now
      FROM appointment 
      WHERE doctor_id = 2 AND notes LIKE '%CURRENT_TEST%'
      ORDER BY date_time
    `);

    console.log('\n📅 Current test appointments for Doctor 2:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    currentAppointments.rows.forEach(apt => {
      const minutesFromNow = Math.round(apt.minutes_from_now);
      const hasLink = apt.meeting_link ? '🔗' : '❌';
      const joinable = apt.appointment_type === 'online' && apt.meeting_link && 
                      minutesFromNow >= -15 && minutesFromNow <= 120;
      const status = joinable ? '🎥 JOINABLE' : '⏸️  Not joinable';
      
      console.log(`${hasLink} ${apt.appointment_type.toUpperCase()} | ID: ${apt.appointment_id} | ${minutesFromNow > 0 ? '+' : ''}${minutesFromNow}min | ${status}`);
      if (apt.meeting_link) {
        console.log(`   🔗 ${apt.meeting_link.substring(0, 80)}...`);
      }
    });

    // Test joinable appointments
    const joinable = await meetingService.getJoinableAppointments(2);
    console.log(`\n🎯 Joinable appointments found: ${joinable.length}`);

    console.log('\n🧪 Test with Doctor@gmail.com now!');
    console.log('Expected results:');
    console.log('✅ Online appointments with meeting links should show green "Join Meeting" buttons');
    console.log('❌ Physical appointments should show normal "Start Consultation" buttons');
    console.log('🔗 Each meeting link should be unique and not require authentication');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

createCurrentTimeTest();
