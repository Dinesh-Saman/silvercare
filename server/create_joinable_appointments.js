const pool = require('./db');
const meetingService = require('./services/meetingService');

async function createJoinableAppointments() {
  try {
    console.log('🎯 Creating appointments that should have active join buttons...\n');

    // Clear all test appointments for doctor 2
    await pool.query("DELETE FROM appointment WHERE doctor_id = 2 AND notes LIKE '%JOINABLE_TEST%'");

    const now = new Date();
    
    // Create appointments at perfect timing for join buttons
    const joinableAppointments = [
      // 1. Online appointment that started 2 minutes ago (currently ongoing)
      {
        elder_id: 3,
        time_offset: -2, // 2 minutes ago
        type: 'online',
        description: 'Ongoing online appointment'
      },
      // 2. Online appointment starting right now
      {
        elder_id: 4,
        time_offset: 0, // right now
        type: 'online',
        description: 'Starting now online appointment'
      },
      // 3. Online appointment starting in 5 minutes
      {
        elder_id: 5,
        time_offset: 5, // 5 minutes from now
        type: 'online',
        description: 'Starting soon online appointment'
      },
      // 4. Physical appointment starting in 3 minutes (should NOT have join button)
      {
        elder_id: 3,
        time_offset: 3, // 3 minutes from now
        type: 'physical',
        description: 'Starting soon physical appointment'
      }
    ];

    console.log('📅 Creating appointments with meeting links...');

    for (let i = 0; i < joinableAppointments.length; i++) {
      const apt = joinableAppointments[i];
      const appointmentTime = new Date(now.getTime() + apt.time_offset * 60 * 1000);
      
      // Create the appointment
      const result = await pool.query(`
        INSERT INTO appointment (elder_id, doctor_id, date_time, status, appointment_type, notes)
        VALUES ($1, 2, $2, 'confirmed', $3, $4)
        RETURNING *
      `, [apt.elder_id, appointmentTime, apt.type, `JOINABLE_TEST: ${apt.description}`]);

      const createdApt = result.rows[0];
      console.log(`✅ Created ${apt.type} appointment ID: ${createdApt.appointment_id} (${apt.time_offset > 0 ? '+' : ''}${apt.time_offset}min)`);

      // If it's online, add meeting link
      if (apt.type === 'online') {
        const meetingDetails = meetingService.generateMeetingLink(
          createdApt.appointment_id,
          2,
          apt.elder_id,
          'Dr. Indipa',
          'Test Patient'
        );

        await meetingService.updateAppointmentMeetingLink(
          createdApt.appointment_id,
          meetingDetails.meetingUrl
        );

        console.log(`   🔗 Added meeting link: ${meetingDetails.meetingUrl.substring(0, 60)}...`);
      }
    }

    // Test the join window logic
    console.log('\n⏰ Testing join window logic...');
    const testTimes = [-10, -2, 0, 5, 10, 120, 130];
    
    testTimes.forEach(minutes => {
      const testTime = new Date(now.getTime() + minutes * 60 * 1000);
      const isJoinable = meetingService.isWithinJoinWindow(testTime);
      const status = isJoinable ? '✅ JOINABLE' : '❌ Not joinable';
      console.log(`   ${minutes > 0 ? '+' : ''}${minutes}min: ${status}`);
    });

    // Check what's joinable for doctor 2
    console.log('\n🎪 Current joinable appointments for doctor 2:');
    const joinable = await meetingService.getJoinableAppointments(2);
    
    joinable.forEach(apt => {
      const timeFromNow = Math.round((new Date(apt.date_time) - new Date()) / (1000 * 60));
      console.log(`🎥 ID: ${apt.appointment_id} | ${apt.appointment_type} | ${timeFromNow > 0 ? '+' : ''}${timeFromNow}min | ${apt.elder_name}`);
      console.log(`   🔗 ${apt.meeting_link.substring(0, 80)}...`);
    });

    console.log('\n✅ Created appointments that should show join buttons!');
    console.log('💡 Refresh the doctor dashboard to see green "Join Meeting" buttons.');
    console.log('🔍 Check browser console for debugging information.');

  } catch (error) {
    console.error('❌ Error creating joinable appointments:', error);
  } finally {
    process.exit();
  }
}

createJoinableAppointments();
