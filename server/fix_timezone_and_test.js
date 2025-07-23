const pool = require('./db');
const meetingService = require('./services/meetingService');

async function fixTimezoneAndTest() {
  try {
    console.log('🔧 Fixing timezone issues and creating working test data...\n');

    // Clear all previous test data for doctor 2
    await pool.query("DELETE FROM appointment WHERE doctor_id = 2 AND notes LIKE '%_TEST%'");

    // Create appointments using timezone-aware SQL with explicit offset
    const appointments = [
      {
        elder_id: 3,
        // Appointment that started 2 minutes ago in Sri Lankan time
        time_sql: "(NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Colombo') - INTERVAL '2 minutes'",
        type: 'online',
        description: 'Started 2 minutes ago (LK time)'
      },
      {
        elder_id: 4,
        // Appointment starting right now in Sri Lankan time
        time_sql: "(NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Colombo')",
        type: 'online', 
        description: 'Starting now (LK time)'
      },
      {
        elder_id: 5,
        // Appointment starting in 5 minutes in Sri Lankan time
        time_sql: "(NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Colombo') + INTERVAL '5 minutes'",
        type: 'online',
        description: 'Starting in 5 minutes (LK time)'
      },
      {
        elder_id: 3,
        // Physical appointment for comparison
        time_sql: "(NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Colombo') + INTERVAL '3 minutes'",
        type: 'physical',
        description: 'Physical appointment (should not have join button)'
      }
    ];

    console.log('📅 Creating timezone-corrected appointments...');

    for (let i = 0; i < appointments.length; i++) {
      const apt = appointments[i];
      
      try {
        // Create the appointment with proper timezone handling
        const result = await pool.query(`
          INSERT INTO appointment (elder_id, doctor_id, date_time, status, appointment_type, notes)
          VALUES ($1, 2, ${apt.time_sql}, 'confirmed', $2, $3)
          RETURNING *, 
                   NOW() as current_utc,
                   (NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Colombo') as current_lk
        `, [apt.elder_id, apt.type, `TIMEZONE_FIXED_TEST: ${apt.description}`]);

        const createdApt = result.rows[0];
        console.log(`✅ Created ${apt.type} appointment ID: ${createdApt.appointment_id}`);
        console.log(`   📅 Appointment time: ${createdApt.date_time}`);
        console.log(`   🕐 Current UTC: ${createdApt.current_utc}`);
        console.log(`   🇱🇰 Current LK: ${createdApt.current_lk}`);

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

          console.log(`   🔗 Added meeting link`);
        }
        console.log('');
        
      } catch (error) {
        console.log(`❌ Failed to create appointment with timezone SQL: ${apt.time_sql}`);
        console.log('   Trying simpler approach...');
        
        // Fallback: create with current timestamp and manually adjust
        const fallbackResult = await pool.query(`
          INSERT INTO appointment (elder_id, doctor_id, date_time, status, appointment_type, notes)
          VALUES ($1, 2, NOW(), 'confirmed', $2, $3)
          RETURNING *
        `, [apt.elder_id, apt.type, `TIMEZONE_FIXED_TEST: ${apt.description} (fallback)`]);

        const createdApt = fallbackResult.rows[0];
        console.log(`✅ Created ${apt.type} appointment ID: ${createdApt.appointment_id} (fallback)`);

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
          console.log(`   🔗 Added meeting link`);
        }
        console.log('');
      }
    }

    // Test what the dashboard API would return
    console.log('🧪 Testing dashboard API...');
    const doctorModel = require('./models/doctormodel');
    const upcomingAppointments = await doctorModel.getUpcomingAppointmentsByDoctorId(2);
    
    console.log(`Found ${upcomingAppointments.length} upcoming appointments:`);
    upcomingAppointments.slice(0, 5).forEach((apt, idx) => {
      const hasLink = !!apt.meeting_link;
      const timeFromNow = Math.round((new Date(apt.date_time) - new Date()) / (1000 * 60));
      console.log(`${idx + 1}. ID: ${apt.appointment_id} | ${apt.appointment_type} | ${timeFromNow > 0 ? '+' : ''}${timeFromNow}min | Link: ${hasLink ? 'Yes' : 'No'}`);
    });

    // Test joinable appointments
    console.log('\n🎯 Testing joinable appointments...');
    const joinable = await meetingService.getJoinableAppointments(2);
    console.log(`Found ${joinable.length} joinable appointments`);

    console.log('\n🎯 FINAL TEST INSTRUCTIONS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Refresh the doctor dashboard NOW');
    console.log('2. Open browser console (F12)');
    console.log('3. Look for green "🎥 Join Meeting" buttons');
    console.log('4. Click the buttons and check console logs');
    console.log('5. If you see "Join button clicked!" in console, the onClick works');
    console.log('6. If popup is blocked, allow popups and try again');

  } catch (error) {
    console.error('❌ Error fixing timezone:', error);
  } finally {
    process.exit();
  }
}

fixTimezoneAndTest();
