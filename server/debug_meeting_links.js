const pool = require('./db');

async function debugMeetingLinks() {
  try {
    console.log('🔍 Debugging meeting links for doctor 2...\n');

    // Get all appointments with meeting links
    const result = await pool.query(`
      SELECT 
        appointment_id, 
        appointment_type, 
        meeting_link, 
        date_time, 
        notes,
        status
      FROM appointment 
      WHERE doctor_id = 2 
      AND meeting_link IS NOT NULL 
      ORDER BY date_time DESC 
      LIMIT 10
    `);

    console.log(`Found ${result.rows.length} appointments with meeting links:`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    result.rows.forEach((apt, idx) => {
      console.log(`${idx + 1}. ID: ${apt.appointment_id} | ${apt.appointment_type} | ${apt.status}`);
      console.log(`   Time: ${apt.date_time}`);
      console.log(`   Notes: ${apt.notes || 'No notes'}`);
      console.log(`   🔗 Link: ${apt.meeting_link}`);
      console.log('');
      
      // Test if the link is valid format
      if (apt.meeting_link) {
        const isValidJitsi = apt.meeting_link.startsWith('https://meet.jit.si/');
        const hasConfig = apt.meeting_link.includes('config.prejoinPageEnabled=false');
        console.log(`   ✅ Valid Jitsi: ${isValidJitsi}`);
        console.log(`   ✅ Has Config: ${hasConfig}`);
        console.log('');
      }
    });

    // Test a meeting link directly
    if (result.rows.length > 0) {
      const testLink = result.rows[0].meeting_link;
      console.log('🧪 Testing first meeting link:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(testLink);
      console.log('');
      console.log('💡 Copy this link and test it manually in your browser');
      console.log('   It should open directly without authentication');
    }

    // Check joinable appointments
    const meetingService = require('./services/meetingService');
    const joinable = await meetingService.getJoinableAppointments(2);
    
    console.log(`\n🎯 Currently joinable appointments: ${joinable.length}`);
    joinable.forEach((apt, idx) => {
      console.log(`${idx + 1}. ID: ${apt.appointment_id} | ${apt.appointment_type} | ${apt.elder_name}`);
      console.log(`   🔗 ${apt.meeting_link.substring(0, 80)}...`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit();
  }
}

debugMeetingLinks();
