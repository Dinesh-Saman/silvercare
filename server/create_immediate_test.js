const pool = require('./db');
const meetingService = require('./services/meetingService');

async function createImmediateTest() {
  try {
    console.log('🚀 Creating appointments for IMMEDIATE testing...\n');

    // Clear all test appointments for doctor 2
    await pool.query("DELETE FROM appointment WHERE doctor_id = 2 AND notes LIKE '%IMMEDIATE_TEST%'");

    const now = new Date();
    
    // Create appointments that should definitely show join buttons
    const immediateAppointments = [
      // 1. Online appointment that started 1 minute ago
      {
        elder_id: 3,
        time_sql: "NOW() - INTERVAL '1 minute'",
        type: 'online',
        description: 'Started 1 minute ago'
      },
      // 2. Online appointment starting exactly now
      {
        elder_id: 4,
        time_sql: "NOW()",
        type: 'online',
        description: 'Starting exactly now'
      },
      // 3. Online appointment starting in 2 minutes
      {
        elder_id: 5,
        time_sql: "NOW() + INTERVAL '2 minutes'",
        type: 'online',
        description: 'Starting in 2 minutes'
      }
    ];

    console.log('📅 Creating immediate test appointments...');

    for (let i = 0; i < immediateAppointments.length; i++) {
      const apt = immediateAppointments[i];
      
      // Create the appointment using SQL time functions
      const result = await pool.query(`
        INSERT INTO appointment (elder_id, doctor_id, date_time, status, appointment_type, notes)
        VALUES ($1, 2, ${apt.time_sql}, 'confirmed', $2, $3)
        RETURNING *, NOW() as current_db_time
      `, [apt.elder_id, apt.type, `IMMEDIATE_TEST: ${apt.description}`]);

      const createdApt = result.rows[0];
      const minutesFromNow = Math.round((new Date(createdApt.date_time) - new Date(createdApt.current_db_time)) / (1000 * 60));
      
      console.log(`✅ Created ${apt.type} appointment ID: ${createdApt.appointment_id} (${minutesFromNow > 0 ? '+' : ''}${minutesFromNow}min from now)`);
      console.log(`   📅 Time: ${createdApt.date_time}`);
      console.log(`   🕐 DB Time: ${createdApt.current_db_time}`);

      // Add meeting link immediately
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

      console.log(`   🔗 Added meeting link: ${meetingDetails.meetingUrl.substring(0, 80)}...`);
      console.log('');
    }

    // Test the meeting service join window logic
    console.log('🧪 Testing server-side join window logic...');
    const joinable = await meetingService.getJoinableAppointments(2);
    
    console.log(`Found ${joinable.length} joinable appointments:`);
    joinable.forEach(apt => {
      const timeFromNow = Math.round((new Date(apt.date_time) - new Date()) / (1000 * 60));
      console.log(`🎥 ID: ${apt.appointment_id} | ${apt.appointment_type} | ${timeFromNow > 0 ? '+' : ''}${timeFromNow}min`);
    });

    console.log('\n🎯 TESTING INSTRUCTIONS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Refresh the doctor dashboard in your browser');
    console.log('2. Open browser dev tools console (F12)');
    console.log('3. Look for green "🎥 Join Meeting" buttons');
    console.log('4. Check console for debugging information');
    console.log('5. Click join buttons and check console logs');
    console.log('6. If popup is blocked, allow popups for the site');

    console.log('\n✅ Created appointments that should DEFINITELY show join buttons!');

  } catch (error) {
    console.error('❌ Error creating immediate test:', error);
  } finally {
    process.exit();
  }
}

createImmediateTest();
