const pool = require('./db');
const meetingService = require('./services/meetingService');

async function createJoinableTest() {
  console.log('🧪 Creating a joinable appointment for immediate testing...\n');

  try {
    // Create an online appointment starting in 5 minutes (within join window)
    const appointmentTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    console.log('✨ Creating online appointment within join window...');
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
      3, // Elder ID
      1, // Family ID  
      2, // Doctor ID
      appointmentTime,
      'confirmed',
      'Test appointment for join button testing',
      'online'
    ]);

    const newAppointment = appointmentResult.rows[0];
    console.log(`✅ Appointment created: ID ${newAppointment.appointment_id}`);
    console.log(`   📅 Scheduled for: ${appointmentTime.toLocaleString()}`);
    console.log(`   🌐 Type: ${newAppointment.appointment_type}`);

    // Generate meeting link immediately
    console.log('\n🔗 Generating meeting link...');
    
    // Get names for the meeting
    const elderResult = await pool.query('SELECT name FROM elder WHERE elder_id = $1', [3]);
    const doctorResult = await pool.query(`
      SELECT u.name as doctor_name 
      FROM doctor d 
      INNER JOIN "User" u ON d.user_id = u.user_id 
      WHERE d.doctor_id = $1
    `, [2]);

    const elderName = elderResult.rows[0]?.name || 'Patient';
    const doctorName = doctorResult.rows[0]?.doctor_name || 'Doctor';

    const meetingDetails = meetingService.generateMeetingLink(
      newAppointment.appointment_id,
      newAppointment.doctor_id,
      newAppointment.elder_id,
      doctorName,
      elderName
    );

    // Update appointment with meeting link
    await meetingService.updateAppointmentMeetingLink(
      newAppointment.appointment_id,
      meetingDetails.meetingUrl
    );

    console.log('✅ Meeting link generated and saved!');
    console.log(`   🔗 Meeting URL: ${meetingDetails.meetingUrl}`);

    // Test join window
    console.log('\n⏰ Testing join window...');
    const isJoinable = meetingService.isWithinJoinWindow(appointmentTime);
    console.log(`   Join window active: ${isJoinable ? 'YES ✅' : 'NO ❌'}`);
    const minutesFromNow = Math.round((appointmentTime - new Date()) / (1000 * 60));
    console.log(`   Time until appointment: ${minutesFromNow} minutes`);

    console.log('\n🎯 Test appointment is ready!');
    console.log('📌 Next steps:');
    console.log('   1. Go to doctor dashboard in browser');
    console.log('   2. Login as doctor (user_id = 11, which is doctor_id = 2)');
    console.log('   3. Look for the appointment with join button');
    console.log('   4. Click the join button to test functionality');
    
    console.log('\n🔗 Direct meeting link to test:');
    console.log(`   ${meetingDetails.meetingUrl}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
  } finally {
    process.exit(0);
  }
}

createJoinableTest();
