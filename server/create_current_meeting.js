const pool = require('./db');
const MeetingService = require('./services/meetingService');

async function createCurrentMeeting() {
  try {
    console.log('🚀 Creating new meeting for RIGHT NOW...\n');
    
    // Use existing IDs
    const elderId = 4; // Sandya Priyani
    const familyId = 1; // Her family
    const doctorId = 2; // Doctor@gmail.com (Indipa)
    
    // Create appointment for RIGHT NOW + 2 minutes (to allow immediate joining)
    const now = new Date();
    const appointmentTime = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes from now
    
    const appointmentResult = await pool.query(`
      INSERT INTO appointment (elder_id, family_id, doctor_id, date_time, status, appointment_type, notes)
      VALUES ($1, $2, $3, $4, 'confirmed', 'online', 'LIVE NOW: Sandya Priyani & Doctor@gmail.com - JOIN IMMEDIATELY')
      RETURNING appointment_id, date_time
    `, [elderId, familyId, doctorId, appointmentTime]);
    
    const appointmentId = appointmentResult.rows[0].appointment_id;
    const scheduledTime = appointmentResult.rows[0].date_time;
    
    console.log(`📋 Created appointment ID: ${appointmentId}`);
    console.log(`🕐 Scheduled for: ${scheduledTime.toLocaleString()}`);
    
    // Generate meeting link immediately
    const updatedAppointment = await MeetingService.ensureMeetingLink(appointmentId);
    
    console.log(`\n🔗 MEETING LINK READY:`);
    console.log(`   URL: ${updatedAppointment.meeting_link}`);
    
    console.log(`\n🎯 BOTH CAN JOIN NOW:`);
    console.log(`   ✅ Doctor@gmail.com - Check doctor dashboard`);
    console.log(`   ✅ Sandya Priyani - Check elder portal`);
    console.log(`   ✅ Meeting link: ${updatedAppointment.meeting_link}`);
    
    console.log(`\n⏰ Appointment time: ${scheduledTime.toLocaleTimeString()}`);
    console.log(`🚀 Status: JOINABLE RIGHT NOW!`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createCurrentMeeting();
