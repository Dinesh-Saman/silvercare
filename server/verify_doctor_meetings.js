const pool = require('./db');

async function verifyDoctorMeetings() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verifying doctor meetings with join capabilities...\n');

    // Get all doctors with confirmed online appointments
    const result = await client.query(`
      SELECT 
        u.name as doctor_name,
        u.email as doctor_email,
        d.doctor_id,
        COUNT(a.appointment_id) as total_appointments,
        COUNT(CASE WHEN a.meeting_link IS NOT NULL THEN 1 END) as meetings_with_links,
        COUNT(CASE WHEN a.date_time > NOW() THEN 1 END) as upcoming_appointments
      FROM doctor d
      JOIN "User" u ON d.user_id = u.user_id
      LEFT JOIN appointment a ON d.doctor_id = a.doctor_id 
        AND a.status = 'confirmed' 
        AND a.appointment_type = 'online'
      GROUP BY u.name, u.email, d.doctor_id
      ORDER BY total_appointments DESC
    `);

    console.log('👨‍⚕️ DOCTORS WITH ONLINE APPOINTMENTS:\n');
    console.log('=' .repeat(80));

    result.rows.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.doctor_name} (${doc.doctor_email})`);
      console.log(`   📊 Total Online Appointments: ${doc.total_appointments}`);
      console.log(`   🔗 Appointments with Meeting Links: ${doc.meetings_with_links}`);
      console.log(`   ⏰ Upcoming Appointments: ${doc.upcoming_appointments}`);
      
      if (doc.meetings_with_links > 0) {
        console.log(`   ✅ Ready for testing join meeting functionality`);
      } else if (doc.total_appointments > 0) {
        console.log(`   ⚠️  Has appointments but no meeting links`);
      } else {
        console.log(`   📝 No online appointments yet`);
      }
      console.log('');
    });

    // Get specific details for doctors with upcoming meetings
    console.log('🎥 UPCOMING MEETINGS READY FOR TESTING:\n');
    console.log('=' .repeat(80));

    const upcomingMeetings = await client.query(`
      SELECT 
        u.name as doctor_name,
        u.email as doctor_email,
        a.appointment_id,
        a.date_time,
        a.meeting_link,
        a.notes,
        e.name as patient_name
      FROM appointment a
      JOIN doctor d ON a.doctor_id = d.doctor_id
      JOIN "User" u ON d.user_id = u.user_id
      JOIN elder e ON a.elder_id = e.elder_id
      WHERE a.status = 'confirmed'
      AND a.appointment_type = 'online'
      AND a.meeting_link IS NOT NULL
      AND a.date_time > NOW()
      ORDER BY a.date_time
      LIMIT 10
    `);

    if (upcomingMeetings.rows.length === 0) {
      console.log('❌ No upcoming meetings found with meeting links!');
      console.log('💡 Run create_mendis_test_meetings.js to create test meetings.');
    } else {
      upcomingMeetings.rows.forEach((meeting, index) => {
        const timeUntil = Math.round((new Date(meeting.date_time) - new Date()) / (1000 * 60));
        console.log(`${index + 1}. Dr. ${meeting.doctor_name} (${meeting.doctor_email})`);
        console.log(`   👴 Patient: ${meeting.patient_name}`);
        console.log(`   📅 Appointment: ${new Date(meeting.date_time).toLocaleString()}`);
        console.log(`   ⏰ Time until meeting: ${timeUntil} minutes`);
        console.log(`   🔗 Meeting Room: ${meeting.meeting_link}`);
        console.log(`   📝 Notes: ${meeting.notes}`);
        console.log('');
      });
    }

    // Quick testing guide
    console.log('🧪 QUICK TESTING GUIDE:\n');
    console.log('1. 🌐 Start the server: npm start');
    console.log('2. 🌐 Start the client: npm start (in client folder)');
    console.log('3. 🔐 Login as any doctor with upcoming meetings');
    console.log('4. 📱 Go to doctor dashboard');
    console.log('5. 👀 Look for "Join Meeting" buttons');
    console.log('6. 🎥 Click to test the meeting functionality\n');

    // Direct test links
    if (upcomingMeetings.rows.length > 0) {
      console.log('🔗 DIRECT TEST LINKS (click to test immediately):\n');
      upcomingMeetings.rows.slice(0, 3).forEach((meeting, index) => {
        console.log(`Meeting ${index + 1} - Dr. ${meeting.doctor_name}:`);
        console.log(`${meeting.meeting_link}?userInfo.displayName=Dr.${meeting.doctor_name}&userInfo.email=${meeting.doctor_email}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error verifying meetings:', error);
  } finally {
    client.release();
  }
}

// Run verification
verifyDoctorMeetings().catch(console.error);
