const pool = require('./db');
const meetingService = require('./services/meetingService');

async function finalTest() {
  try {
    console.log('🚀 Final Meeting System Test');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 1. Create test appointments
    console.log('1. Creating test appointments...');
    
    // Clear previous test appointments
    await pool.query("DELETE FROM appointment WHERE notes LIKE '%FINAL_TEST%'");

    const appointments = [
      // Online appointment in 8 minutes - should get meeting link
      {
        query: "INSERT INTO appointment (elder_id, doctor_id, date_time, status, appointment_type, notes) VALUES (3, 5, NOW() + INTERVAL '8 minutes', 'confirmed', 'online', 'FINAL_TEST: Online 8min') RETURNING *"
      },
      // Physical appointment in 8 minutes - should NOT get meeting link
      {
        query: "INSERT INTO appointment (elder_id, doctor_id, date_time, status, appointment_type, notes) VALUES (3, 5, NOW() + INTERVAL '8 minutes', 'confirmed', 'physical', 'FINAL_TEST: Physical 8min') RETURNING *"
      },
      // Online appointment already started - should be joinable
      {
        query: "INSERT INTO appointment (elder_id, doctor_id, date_time, status, appointment_type, notes, meeting_link) VALUES (3, 5, NOW() - INTERVAL '5 minutes', 'confirmed', 'online', 'FINAL_TEST: Online ongoing', 'https://meet.jit.si/silvercare-test-ongoing') RETURNING *"
      }
    ];

    const createdAppointments = [];
    for (const apt of appointments) {
      const result = await pool.query(apt.query);
      createdAppointments.push(result.rows[0]);
    }

    console.log(`✅ Created ${createdAppointments.length} test appointments\n`);

    // 2. Test meeting link generation
    console.log('2. Testing automatic meeting link generation...');
    const generatedLinks = await meetingService.generateLinksForUpcomingAppointments();
    
    console.log(`🔗 Generated meeting links for ${generatedLinks.length} appointments:`);
    generatedLinks.forEach(apt => {
      console.log(`   ✅ Appointment ${apt.appointment_id}: ${apt.meeting_link}`);
    });
    
    if (generatedLinks.length === 0) {
      console.log('   ⚠️  No meeting links generated - this is expected if no online appointments are in the 15-minute window');
    }
    console.log('');

    // 3. Test joinable appointments
    console.log('3. Testing joinable appointments for doctor 5...');
    const joinableAppointments = await meetingService.getJoinableAppointments(5);
    
    console.log(`🎯 Found ${joinableAppointments.length} joinable appointments:`);
    joinableAppointments.forEach(apt => {
      const timeFromNow = Math.round((new Date(apt.date_time) - new Date()) / (1000 * 60));
      const status = timeFromNow < 0 ? '(Ongoing)' : '(Upcoming)';
      console.log(`   🎥 ID: ${apt.appointment_id} | ${apt.appointment_type} | ${timeFromNow > 0 ? '+' : ''}${timeFromNow}min ${status}`);
      console.log(`      🔗 ${apt.meeting_link}`);
    });
    console.log('');

    // 4. Verify appointment types
    console.log('4. Verifying appointment type filtering...');
    const allTestAppointments = await pool.query(`
      SELECT appointment_id, appointment_type, meeting_link, date_time, notes
      FROM appointment 
      WHERE notes LIKE '%FINAL_TEST%'
      ORDER BY appointment_type, date_time
    `);

    console.log('📋 All test appointments:');
    allTestAppointments.rows.forEach(apt => {
      const hasLink = apt.meeting_link ? '✅ Has meeting link' : '❌ No meeting link';
      console.log(`   ${apt.appointment_type.toUpperCase()}: ID ${apt.appointment_id} | ${hasLink}`);
    });
    console.log('');

    // 5. Test results summary
    console.log('5. Test Results Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const onlineAppointments = allTestAppointments.rows.filter(apt => apt.appointment_type === 'online');
    const physicalAppointments = allTestAppointments.rows.filter(apt => apt.appointment_type === 'physical');
    const appointmentsWithLinks = allTestAppointments.rows.filter(apt => apt.meeting_link);
    
    console.log(`📊 Online appointments: ${onlineAppointments.length}`);
    console.log(`📊 Physical appointments: ${physicalAppointments.length}`);
    console.log(`📊 Appointments with meeting links: ${appointmentsWithLinks.length}`);
    console.log(`📊 Joinable appointments: ${joinableAppointments.length}`);
    console.log('');

    // Validation
    const physicalWithLinks = physicalAppointments.filter(apt => apt.meeting_link);
    
    if (physicalWithLinks.length === 0) {
      console.log('✅ PASS: No physical appointments have meeting links');
    } else {
      console.log('❌ FAIL: Physical appointments should not have meeting links');
    }

    if (joinableAppointments.every(apt => apt.appointment_type === 'online')) {
      console.log('✅ PASS: Only online appointments are joinable');
    } else {
      console.log('❌ FAIL: Non-online appointments found in joinable list');
    }

    console.log('\n🏁 Final Test Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Next steps:');
    console.log('1. Start the server: npm start (from server directory)');
    console.log('2. Start the client: npm start (from client directory)'); 
    console.log('3. Login as doctor with ID 5');
    console.log('4. Check the dashboard for join buttons on online appointments only');
    console.log('5. Test clicking join buttons to open Jitsi Meet');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  process.exit();
}

finalTest();
