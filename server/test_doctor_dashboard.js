const pool = require('./db');

async function testDoctorDashboard() {
  console.log('🧪 Testing doctor dashboard data with meeting links...\n');

  try {
    const doctorId = 2; // Test with doctor ID 2

    // Get dashboard data
    const result = await pool.query(`
      SELECT 
        a.appointment_id,
        a.elder_id,
        a.doctor_id,
        a.date_time,
        a.appointment_type,
        a.meeting_link,
        a.status,
        e.name as elder_name,
        e.dob as elder_dob,
        e.gender as elder_gender,
        e.contact as elder_contact,
        e.address as elder_address,
        e.medical_conditions,
        e.profile_photo as elder_avatar
      FROM appointment a
      LEFT JOIN elder e ON a.elder_id = e.elder_id
      WHERE a.doctor_id = $1
      AND a.status = 'confirmed'
      AND a.date_time >= NOW()
      ORDER BY a.date_time ASC
      LIMIT 10
    `, [doctorId]);

    console.log(`📊 Found ${result.rows.length} upcoming appointments for doctor ${doctorId}:`);
    console.log('');

    result.rows.forEach((apt, idx) => {
      const now = new Date();
      const appointmentDate = new Date(apt.date_time);
      const fifteenMinutesBefore = new Date(appointmentDate.getTime() - 15 * 60 * 1000);
      const twoHoursAfter = new Date(appointmentDate.getTime() + 2 * 60 * 60 * 1000);
      const isWithinJoinWindow = now >= fifteenMinutesBefore && now <= twoHoursAfter;
      
      const minutesFromNow = Math.round((appointmentDate - now) / (1000 * 60));
      const isOnline = apt.appointment_type === 'online';
      const hasLink = !!apt.meeting_link;
      const canJoin = isOnline && hasLink && isWithinJoinWindow;

      console.log(`${idx + 1}. 📋 Appointment ID: ${apt.appointment_id}`);
      console.log(`   👤 Patient: ${apt.elder_name}`);
      console.log(`   📅 Time: ${apt.date_time} (${minutesFromNow > 0 ? '+' : ''}${minutesFromNow}min from now)`);
      console.log(`   🌐 Type: ${apt.appointment_type}`);
      console.log(`   🔗 Has meeting link: ${hasLink ? 'YES' : 'NO'}`);
      console.log(`   ⏰ In join window: ${isWithinJoinWindow ? 'YES' : 'NO'}`);
      console.log(`   🎯 Can join: ${canJoin ? 'YES ✅' : 'NO ❌'}`);
      
      if (apt.meeting_link) {
        console.log(`   🔗 Link: ${apt.meeting_link.substring(0, 80)}...`);
      }
      console.log('');
    });

    // Count joinable appointments
    const joinableCount = result.rows.filter(apt => {
      const now = new Date();
      const appointmentDate = new Date(apt.date_time);
      const fifteenMinutesBefore = new Date(appointmentDate.getTime() - 15 * 60 * 1000);
      const twoHoursAfter = new Date(appointmentDate.getTime() + 2 * 60 * 60 * 1000);
      const isWithinJoinWindow = now >= fifteenMinutesBefore && now <= twoHoursAfter;
      return apt.appointment_type === 'online' && apt.meeting_link && isWithinJoinWindow;
    }).length;

    console.log(`📊 Summary:`);
    console.log(`   📅 Total upcoming appointments: ${result.rows.length}`);
    console.log(`   🌐 Online appointments: ${result.rows.filter(apt => apt.appointment_type === 'online').length}`);
    console.log(`   🔗 Online appointments with links: ${result.rows.filter(apt => apt.appointment_type === 'online' && apt.meeting_link).length}`);
    console.log(`   🎯 Currently joinable appointments: ${joinableCount}`);

    if (joinableCount > 0) {
      console.log('\n✅ Doctor dashboard should show join buttons for the joinable appointments!');
    } else {
      console.log('\n⚠️  No appointments are currently joinable (within 15 minutes of start time)');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
  } finally {
    process.exit(0);
  }
}

testDoctorDashboard();
