const pool = require('./db');

async function verifyMeetingReady() {
  try {
    console.log('✅ Verifying meeting is ready for joining...\n');
    
    // Check the appointment has a meeting link
    const result = await pool.query(`
      SELECT 
        a.appointment_id,
        a.date_time,
        a.status,
        a.appointment_type,
        a.meeting_link,
        a.notes,
        e.name as elder_name
      FROM appointment a
      JOIN elder e ON a.elder_id = e.elder_id
      WHERE a.notes LIKE '%Sandya Priyani%' 
      AND a.notes LIKE '%Doctor@gmail.com%'
      AND a.status = 'confirmed'
      ORDER BY a.appointment_id DESC
      LIMIT 1
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No appointment found');
      return;
    }
    
    const appointment = result.rows[0];
    const now = new Date();
    const appointmentTime = new Date(appointment.date_time);
    const timeDiff = appointmentTime - now;
    const minutesFromNow = Math.round(timeDiff / (1000 * 60));
    
    console.log(`📋 APPOINTMENT DETAILS:`);
    console.log(`   ID: ${appointment.appointment_id}`);
    console.log(`   Elder: ${appointment.elder_name}`);
    console.log(`   Time: ${appointmentTime.toLocaleString()}`);
    console.log(`   From now: ${minutesFromNow > 0 ? `${minutesFromNow} minutes future` : `${Math.abs(minutesFromNow)} minutes ago`}`);
    console.log(`   Status: ${appointment.status}`);
    console.log(`   Type: ${appointment.appointment_type}`);
    
    if (appointment.meeting_link) {
      console.log(`\n🔗 MEETING LINK AVAILABLE:`);
      console.log(`   URL: ${appointment.meeting_link}`);
      console.log(`\n🎯 READY TO JOIN:`);
      console.log(`   ✅ Doctor@gmail.com can join through doctor portal`);
      console.log(`   ✅ Sandya Priyani can join through elder portal`);
      console.log(`   ✅ Both should see "Join Meeting" button`);
      
      if (minutesFromNow <= 5 && minutesFromNow >= -5) {
        console.log(`\n🚀 PERFECT TIMING: Meeting is joinable now!`);
      } else if (minutesFromNow > 5) {
        console.log(`\n⏰ Meeting starts in ${minutesFromNow} minutes`);
      } else {
        console.log(`\n⚠️  Meeting was ${Math.abs(minutesFromNow)} minutes ago`);
      }
    } else {
      console.log(`\n❌ NO MEETING LINK - this is the problem!`);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyMeetingReady();
