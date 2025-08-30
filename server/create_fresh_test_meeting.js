const pool = require('./db');
const MeetingService = require('./services/meetingService');

async function createFreshTestMeeting() {
  try {
    console.log('🚀 Creating FRESH test meeting for Sandya Priyani and Doctor@gmail.com...\n');
    
    // Use existing IDs
    const elderId = 4; // Sandya Priyani
    const familyId = 1; // Her family
    const doctorId = 2; // Doctor@gmail.com (Indipa)
    
    // Create appointment for 15 minutes in the future
    const now = new Date();
    const appointmentTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now
    
    const appointmentResult = await pool.query(`
      INSERT INTO appointment (elder_id, family_id, doctor_id, date_time, status, appointment_type, notes)
      VALUES ($1, $2, $3, $4, 'confirmed', 'online', 'FRESH TEST: Sandya & Doctor - Both should get SAME Jitsi link')
      RETURNING appointment_id, date_time
    `, [elderId, familyId, doctorId, appointmentTime]);
    
    const appointmentId = appointmentResult.rows[0].appointment_id;
    const scheduledTime = appointmentResult.rows[0].date_time;
    
    console.log(`📋 Created NEW appointment ID: ${appointmentId}`);
    console.log(`🕐 Scheduled for: ${scheduledTime.toLocaleString()}`);
    
    // Generate meeting link immediately
    const updatedAppointment = await MeetingService.ensureMeetingLink(appointmentId);
    
    console.log(`\n🔗 BASE MEETING LINK:`);
    console.log(`   ${updatedAppointment.meeting_link}`);
    
    // Get elder info
    const elderInfo = await pool.query("SELECT name, email FROM elder WHERE elder_id = $1", [elderId]);
    const elderName = elderInfo.rows[0]?.name || 'Patient';
    const elderEmail = elderInfo.rows[0]?.email || 'patient@silvercare.com';
    
    // Create elder-specific URL
    const elderMeetingUrl = new URL(updatedAppointment.meeting_link);
    elderMeetingUrl.searchParams.set('userInfo.displayName', elderName);
    elderMeetingUrl.searchParams.set('userInfo.email', elderEmail);
    elderMeetingUrl.searchParams.set('config.prejoinPageEnabled', 'false');
    
    // Create doctor-specific URL  
    const doctorMeetingUrl = new URL(updatedAppointment.meeting_link);
    doctorMeetingUrl.searchParams.set('userInfo.displayName', 'Dr. Indipa');
    doctorMeetingUrl.searchParams.set('userInfo.email', 'Doctor@gmail.com');
    doctorMeetingUrl.searchParams.set('config.prejoinPageEnabled', 'false');
    
    console.log(`\n🎯 WHAT EACH USER SHOULD GET:`);
    console.log(`👨‍⚕️ Doctor Link:`);
    console.log(`   ${doctorMeetingUrl.toString()}`);
    console.log(`\n👵 Elder Link:`);
    console.log(`   ${elderMeetingUrl.toString()}`);
    
    console.log(`\n📱 TEST INSTRUCTIONS:`);
    console.log(`1. Restart the backend server (to apply elder.js changes)`);
    console.log(`2. Refresh doctor dashboard - should see appointment ${appointmentId}`);
    console.log(`3. Refresh elder dashboard - should see appointment ${appointmentId}`);
    console.log(`4. Both click "Join Meeting" - should get above links`);
    console.log(`5. Both join the SAME room with different display names`);
    
    const minutesFromNow = Math.round((scheduledTime - now) / (1000 * 60));
    console.log(`\n⏰ Meeting starts in: ${minutesFromNow} minutes`);
    console.log(`🚀 READY FOR TESTING!`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createFreshTestMeeting();
