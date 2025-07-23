const pool = require('./db');
const meetingService = require('./services/meetingService');

async function debugDoctor2() {
  try {
    console.log('🔍 Debugging Doctor ID 2 appointments and meeting functionality...\n');

    // Check current appointments for doctor 2
    const appointments = await pool.query(`
      SELECT 
        a.appointment_id,
        a.appointment_type,
        a.meeting_link,
        a.date_time,
        a.status,
        a.notes,
        e.name as elder_name,
        NOW() as current_db_time,
        EXTRACT(EPOCH FROM (a.date_time - NOW()))/60 as minutes_from_now
      FROM appointment a
      LEFT JOIN elder e ON a.elder_id = e.elder_id
      WHERE a.doctor_id = 2
      ORDER BY a.date_time DESC
      LIMIT 15
    `);

    console.log('📅 Current appointments for Doctor ID 2:');
    console.log('Current database time:', appointments.rows[0]?.current_db_time);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    appointments.rows.forEach(apt => {
      const minutesFromNow = Math.round(apt.minutes_from_now || 0);
      const hasLink = apt.meeting_link ? '🔗' : '❌';
      const status = minutesFromNow < -120 ? '(Old)' :
                    minutesFromNow < -15 ? '(Ended)' :
                    minutesFromNow < 0 ? '(Ongoing)' :
                    minutesFromNow <= 15 ? '(Soon)' :
                    '(Future)';
      
      console.log(`${hasLink} ${apt.appointment_type?.toUpperCase() || 'NULL'} | ID: ${apt.appointment_id} | ${minutesFromNow > 0 ? '+' : ''}${minutesFromNow}min ${status}`);
      console.log(`   Elder: ${apt.elder_name || 'Unknown'} | Status: ${apt.status}`);
      if (apt.meeting_link) {
        console.log(`   🔗 Link: ${apt.meeting_link.substring(0, 60)}...`);
      }
      if (apt.notes) {
        console.log(`   📝 Notes: ${apt.notes}`);
      }
      console.log('');
    });

    // Test joinable appointments
    console.log('🎯 Testing joinable appointments...');
    const joinable = await meetingService.getJoinableAppointments(2);
    console.log(`Found ${joinable.length} joinable appointments:`);
    
    joinable.forEach(apt => {
      console.log(`   🎥 ID: ${apt.appointment_id} | ${apt.appointment_type} | Elder: ${apt.elder_name}`);
      console.log(`      🔗 ${apt.meeting_link.substring(0, 60)}...`);
    });

    // Create fresh test appointments that should definitely work
    console.log('\n🚀 Creating fresh test appointments for immediate testing...');
    
    // Clear old test data
    await pool.query("DELETE FROM appointment WHERE doctor_id = 2 AND notes LIKE '%FRESH_TEST%'");

    // Create appointments at perfect timing
    const freshAppointments = [
      // Online appointment starting exactly now (should be joinable)
      {
        query: "INSERT INTO appointment (elder_id, doctor_id, date_time, status, appointment_type, notes) VALUES (3, 2, NOW(), 'confirmed', 'online', 'FRESH_TEST: Online now') RETURNING *"
      },
      // Online appointment starting in 3 minutes (should get link and be joinable)
      {
        query: "INSERT INTO appointment (elder_id, doctor_id, date_time, status, appointment_type, notes) VALUES (4, 2, NOW() + INTERVAL '3 minutes', 'confirmed', 'online', 'FRESH_TEST: Online 3min') RETURNING *"
      },
      // Physical appointment starting in 3 minutes (should NOT get link)
      {
        query: "INSERT INTO appointment (elder_id, doctor_id, date_time, status, appointment_type, notes) VALUES (5, 2, NOW() + INTERVAL '3 minutes', 'confirmed', 'physical', 'FRESH_TEST: Physical 3min') RETURNING *"
      }
    ];

    for (const apt of freshAppointments) {
      const result = await pool.query(apt.query);
      const created = result.rows[0];
      console.log(`✅ Created appointment ID: ${created.appointment_id} (${created.appointment_type})`);
      
      // If it's online, manually add meeting link
      if (created.appointment_type === 'online') {
        const meetingDetails = meetingService.generateMeetingLink(
          created.appointment_id,
          2,
          created.elder_id,
          'Dr. Indipa',
          'Test Patient'
        );
        
        await meetingService.updateAppointmentMeetingLink(
          created.appointment_id,
          meetingDetails.meetingUrl
        );
        
        console.log(`   🔗 Added meeting link: ${meetingDetails.meetingUrl.substring(0, 60)}...`);
      }
    }

    // Final check of joinable appointments
    console.log('\n🎪 Final check - joinable appointments:');
    const finalJoinable = await meetingService.getJoinableAppointments(2);
    console.log(`Found ${finalJoinable.length} joinable appointments:`);
    
    finalJoinable.forEach(apt => {
      console.log(`   🎥 ID: ${apt.appointment_id} | ${apt.appointment_type} | ${apt.elder_name}`);
      console.log(`      Time: ${apt.date_time}`);
      console.log(`      🔗 ${apt.meeting_link}`);
      console.log('');
    });

    console.log('✅ Debug complete. Fresh test data created.');
    console.log('💡 Refresh the doctor dashboard to see the new join buttons.');

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    process.exit();
  }
}

debugDoctor2();
