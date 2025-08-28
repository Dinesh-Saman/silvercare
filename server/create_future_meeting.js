const pool = require('./db');
const MeetingService = require('./services/meetingService');

async function createFutureMeeting() {
  try {
    console.log('🚀 Creating future meeting for Sandya Priyani and Doctor@gmail.com...\n');
    
    // Use existing IDs
    const elderId = 4; // Sandya Priyani
    const familyId = 1; // Her family
    const doctorId = 2; // Doctor@gmail.com (Indipa)
    
    // Create appointment for 10 minutes in the future (so it shows as "upcoming")
    const now = new Date();
    const appointmentTime = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now
    
    const appointmentResult = await pool.query(`
      INSERT INTO appointment (elder_id, family_id, doctor_id, date_time, status, appointment_type, notes)
      VALUES ($1, $2, $3, $4, 'confirmed', 'online', 'UPCOMING: Sandya Priyani & Doctor@gmail.com - JOINABLE SOON')
      RETURNING appointment_id, date_time
    `, [elderId, familyId, doctorId, appointmentTime]);
    
    const appointmentId = appointmentResult.rows[0].appointment_id;
    const scheduledTime = appointmentResult.rows[0].date_time;
    
    console.log(`📋 Created appointment ID: ${appointmentId}`);
    console.log(`🕐 Scheduled for: ${scheduledTime.toLocaleString()}`);
    
    // Generate meeting link immediately
    const updatedAppointment = await MeetingService.ensureMeetingLink(appointmentId);
    
    console.log(`\n🔗 MEETING LINK GENERATED:`);
    console.log(`   URL: ${updatedAppointment.meeting_link}`);
    
    // Check appointment shows as upcoming
    const minutesFromNow = Math.round((scheduledTime - now) / (1000 * 60));
    
    console.log(`\n🎯 UPCOMING APPOINTMENT:`);
    console.log(`   ✅ Doctor@gmail.com - Should see in upcoming appointments`);
    console.log(`   ✅ Sandya Priyani - Should see in upcoming appointments`);
    console.log(`   ⏰ Starts in: ${minutesFromNow} minutes`);
    console.log(`   🔗 Meeting link: ${updatedAppointment.meeting_link}`);
    
    console.log(`\n📱 Test Steps:`);
    console.log(`1. Login as Doctor@gmail.com - check upcoming appointments`);
    console.log(`2. Login as Sandya Priyani - check upcoming appointments`);
    console.log(`3. Both should see appointment scheduled for ${scheduledTime.toLocaleTimeString()}`);
    console.log(`4. Join meeting button should be available when time comes`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createFutureMeeting();
