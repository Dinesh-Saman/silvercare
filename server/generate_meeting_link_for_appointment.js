const pool = require('./db');
const MeetingService = require('./services/meetingService');

async function generateMeetingLinkForAppointment() {
  try {
    console.log('🔗 Generating meeting link for Sandya Priyani appointment...\n');
    
    // First, check if the appointment table has the meeting_link column
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'appointment' 
      AND column_name = 'meeting_link'
    `);
    
    if (columnCheck.rows.length === 0) {
      console.log('⚠️  meeting_link column does not exist. Adding it...');
      await pool.query(`
        ALTER TABLE appointment 
        ADD COLUMN meeting_link VARCHAR(500)
      `);
      console.log('✅ Added meeting_link column to appointment table');
    }
    
    // Find the most recent appointment we created (should be appointment ID 148)
    const appointmentResult = await pool.query(`
      SELECT a.*, u.name as doctor_name, u.email as doctor_email, 
             e.name as elder_name
      FROM appointment a
      JOIN doctor d ON a.doctor_id = d.doctor_id
      JOIN "User" u ON d.user_id = u.user_id
      JOIN elder e ON a.elder_id = e.elder_id
      WHERE a.notes LIKE '%Sandya Priyani%' 
      AND a.notes LIKE '%Doctor@gmail.com%'
      AND a.status = 'confirmed'
      ORDER BY a.appointment_id DESC
      LIMIT 1
    `);
    
    if (appointmentResult.rows.length === 0) {
      console.log('❌ No matching appointment found');
      return;
    }
    
    const appointment = appointmentResult.rows[0];
    console.log(`📋 Found appointment ID: ${appointment.appointment_id}`);
    console.log(`👵 Elder: ${appointment.elder_name}`);
    console.log(`👨‍⚕️ Doctor: ${appointment.doctor_name} (${appointment.doctor_email})`);
    
    // Generate meeting link using the service
    const updatedAppointment = await MeetingService.ensureMeetingLink(appointment.appointment_id);
    
    console.log(`\n✅ MEETING LINK GENERATED:`);
    console.log(`🔗 Meeting URL: ${updatedAppointment.meeting_link}`);
    
    // Get full meeting info
    const meetingInfo = await MeetingService.getMeetingInfo(appointment.appointment_id);
    
    console.log(`\n🎯 READY TO JOIN:`);
    console.log(`👨‍⚕️ Doctor URL: ${meetingInfo.doctorUrl}`);
    console.log(`👵 Patient URL: ${meetingInfo.patientUrl}`);
    
    console.log(`\n📱 Test Instructions:`);
    console.log(`1. Login as Doctor@gmail.com in doctor portal`);
    console.log(`2. Login as Sandya Priyani in elder portal`);
    console.log(`3. Both should now see "Join Meeting" button`);
    console.log(`4. Click to join the video call`);
    
    console.log(`\n⏰ Meeting scheduled: ${new Date(appointment.date_time).toLocaleString()}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error generating meeting link:', error);
    process.exit(1);
  }
}

generateMeetingLinkForAppointment();
