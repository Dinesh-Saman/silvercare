const pool = require('./db');

async function testElderJoin() {
  try {
    console.log('🧪 Testing elder join for appointment 150...\n');
    
    // Simulate the elder join request (elderId = 4, appointmentId = 150)
    const elderId = 4;
    const appointmentId = 150;
    
    // Check if appointment exists, belongs to elder, and is online
    const appointmentCheck = await pool.query(
      "SELECT * FROM appointment WHERE appointment_id = $1 AND elder_id = $2 AND appointment_type = 'online'",
      [appointmentId, elderId]
    );

    if (appointmentCheck.rows.length === 0) {
      console.log('❌ Online appointment not found');
      return;
    }

    const appointment = appointmentCheck.rows[0];
    console.log(`📋 Found appointment: ${appointment.appointment_id}`);
    console.log(`🔗 Database meeting_link: ${appointment.meeting_link || 'NULL'}`);

    // Check time window
    const appointmentTime = new Date(appointment.date_time);
    const now = new Date();
    const timeDiff = appointmentTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    console.log(`⏰ Time check: ${minutesDiff.toFixed(1)} minutes from now`);
    
    if (minutesDiff > 30) {
      console.log('❌ Too early to join (more than 30 minutes)');
      return;
    }

    if (minutesDiff < -60) {
      console.log('❌ Too late to join (more than 60 minutes past)');
      return;
    }

    // Use the actual meeting link from the database
    let meetingLink = appointment.meeting_link;
    
    if (!meetingLink) {
      console.log('⚠️  No meeting link in database');
      return;
    }

    // Get elder information for the meeting
    const elderInfo = await pool.query(
      "SELECT name, email FROM elder WHERE elder_id = $1",
      [elderId]
    );
    
    const elderName = elderInfo.rows[0]?.name || 'Patient';
    const elderEmail = elderInfo.rows[0]?.email || 'patient@silvercare.com';
    
    console.log(`👵 Elder info: ${elderName} (${elderEmail})`);
    
    // Create meeting URL with elder parameters for Jitsi Meet (same as doctor does)
    const meetingUrl = new URL(meetingLink);
    meetingUrl.searchParams.set('userInfo.displayName', elderName);
    meetingUrl.searchParams.set('userInfo.email', elderEmail);
    meetingUrl.searchParams.set('config.prejoinPageEnabled', 'false');

    console.log(`\n✅ ELDER SHOULD GET THIS LINK:`);
    console.log(`${meetingUrl.toString()}`);
    
    console.log(`\n🔧 If elder is still getting https://meet.silvercare.com/appointment/150`);
    console.log(`   Then the backend changes didn't take effect or there's caching`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testElderJoin();
