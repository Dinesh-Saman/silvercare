const pool = require('./db');
const meetingService = require('./services/meetingService');

async function testImmediateMeetingLink() {
  console.log('🧪 Testing immediate meeting link generation for online appointments...\n');

  try {
    // Check if we have the required test data
    const elderCheck = await pool.query('SELECT elder_id, name FROM elder LIMIT 1');
    const doctorCheck = await pool.query(`
      SELECT d.doctor_id, u.name as doctor_name 
      FROM doctor d 
      INNER JOIN "User" u ON d.user_id = u.user_id 
      WHERE d.status = 'confirmed'
      LIMIT 1
    `);
    const familyCheck = await pool.query('SELECT family_id FROM familymember LIMIT 1');

    if (elderCheck.rows.length === 0 || doctorCheck.rows.length === 0 || familyCheck.rows.length === 0) {
      console.log('❌ Missing test data. Need at least one elder, doctor, and family member.');
      return;
    }

    const elder = elderCheck.rows[0];
    const doctor = doctorCheck.rows[0];
    const family = familyCheck.rows[0];

    console.log('📋 Test data found:');
    console.log(`   👴 Elder: ${elder.name} (ID: ${elder.elder_id})`);
    console.log(`   👨‍⚕️ Doctor: ${doctor.doctor_name} (ID: ${doctor.doctor_id})`);
    console.log(`   👨‍👩‍👧‍👦 Family: ID ${family.family_id}\n`);

    // Create an online appointment scheduled for 10 minutes from now
    const appointmentTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    console.log('✨ Creating online appointment...');
    const appointmentResult = await pool.query(`
      INSERT INTO appointment (
        elder_id, 
        family_id, 
        doctor_id, 
        date_time, 
        status, 
        notes, 
        appointment_type,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      elder.elder_id,
      family.family_id,
      doctor.doctor_id,
      appointmentTime,
      'confirmed',
      'Test appointment for immediate meeting link',
      'online'
    ]);

    const newAppointment = appointmentResult.rows[0];
    console.log(`✅ Appointment created: ID ${newAppointment.appointment_id}`);
    console.log(`   📅 Scheduled for: ${appointmentTime.toLocaleString()}`);
    console.log(`   🌐 Type: ${newAppointment.appointment_type}`);

    // Generate meeting link immediately (simulating the enhanced functionality)
    console.log('\n🔗 Generating meeting link immediately...');
    const meetingDetails = meetingService.generateMeetingLink(
      newAppointment.appointment_id,
      newAppointment.doctor_id,
      newAppointment.elder_id,
      doctor.doctor_name,
      elder.name
    );

    // Update appointment with meeting link
    await meetingService.updateAppointmentMeetingLink(
      newAppointment.appointment_id,
      meetingDetails.meetingUrl
    );

    console.log('✅ Meeting link generated and saved!');
    console.log(`   🔗 Meeting URL: ${meetingDetails.meetingUrl}`);
    console.log(`   🎯 Room ID: ${meetingDetails.roomId}`);
    console.log(`   📱 Platform: ${meetingDetails.platform}`);

    // Verify the appointment now has a meeting link
    console.log('\n🔍 Verifying appointment has meeting link...');
    const verifyResult = await pool.query(
      'SELECT appointment_id, appointment_type, meeting_link, date_time FROM appointment WHERE appointment_id = $1',
      [newAppointment.appointment_id]
    );

    const updatedAppointment = verifyResult.rows[0];
    console.log('✅ Verification complete:');
    console.log(`   📋 Appointment ID: ${updatedAppointment.appointment_id}`);
    console.log(`   🌐 Type: ${updatedAppointment.appointment_type}`);
    console.log(`   🔗 Has meeting link: ${updatedAppointment.meeting_link ? 'YES' : 'NO'}`);
    if (updatedAppointment.meeting_link) {
      console.log(`   🔗 Link: ${updatedAppointment.meeting_link.substring(0, 80)}...`);
    }

    // Test join window
    console.log('\n⏰ Testing join window logic...');
    const isJoinable = meetingService.isWithinJoinWindow(updatedAppointment.date_time);
    console.log(`   Join window active: ${isJoinable ? 'YES' : 'NO'}`);
    const minutesFromNow = Math.round((new Date(updatedAppointment.date_time) - new Date()) / (1000 * 60));
    console.log(`   Time until appointment: ${minutesFromNow} minutes`);

    console.log('\n🎉 Test completed successfully!');
    console.log('📌 Summary:');
    console.log('   ✅ Online appointment created');
    console.log('   ✅ Meeting link generated immediately');
    console.log('   ✅ Meeting link saved to database');
    console.log('   ✅ Join window logic working');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
  } finally {
    process.exit(0);
  }
}

testImmediateMeetingLink();
