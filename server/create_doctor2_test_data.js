const pool = require('./db');
const meetingService = require('./services/meetingService');

async function createDoctor2TestData() {
  try {
    console.log('🚀 Creating Test Data for Doctor ID 2 (Doctor@gmail.com)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 1. Verify doctor exists
    const doctorCheck = await pool.query(`
      SELECT d.doctor_id, d.user_id, u.email, u.name 
      FROM doctor d 
      JOIN "User" u ON d.user_id = u.user_id 
      WHERE d.doctor_id = 2
    `);

    if (doctorCheck.rows.length === 0) {
      console.log('❌ Doctor ID 2 not found!');
      process.exit(1);
    }

    const doctor = doctorCheck.rows[0];
    console.log('✅ Found doctor:', doctor);
    console.log(`   📧 Email: ${doctor.email}`);
    console.log(`   👤 Name: ${doctor.name}\n`);

    // 2. Get available elders
    const eldersResult = await pool.query('SELECT elder_id, name FROM elder LIMIT 3');
    if (eldersResult.rows.length === 0) {
      console.log('❌ No elders found! Please ensure elder data exists.');
      process.exit(1);
    }

    const elders = eldersResult.rows;
    console.log('📋 Available elders:');
    elders.forEach(elder => console.log(`   • ID: ${elder.elder_id}, Name: ${elder.name}`));
    console.log('');

    // 3. Clear existing test data for doctor 2
    console.log('🧹 Clearing existing test data for doctor 2...');
    await pool.query("DELETE FROM appointment WHERE doctor_id = 2 AND notes LIKE '%DOCTOR2_TEST%'");

    // 4. Create comprehensive test scenarios
    const now = new Date();
    const testAppointments = [
      // Scenario 1: Online appointment starting in 8 minutes (should get meeting link)
      {
        elder_id: elders[0].elder_id,
        doctor_id: 2,
        query: "INSERT INTO appointment (elder_id, doctor_id, date_time, status, appointment_type, notes) VALUES ($1, 2, NOW() + INTERVAL '8 minutes', 'confirmed', 'online', 'DOCTOR2_TEST: Online appointment in 8 minutes') RETURNING *"
      },
      // Scenario 2: Physical appointment starting in 8 minutes (should NOT get meeting link)
      {
        elder_id: elders[1].elder_id,
        doctor_id: 2,
        query: "INSERT INTO appointment (elder_id, doctor_id, date_time, status, appointment_type, notes) VALUES ($1, 2, NOW() + INTERVAL '8 minutes', 'confirmed', 'physical', 'DOCTOR2_TEST: Physical appointment in 8 minutes') RETURNING *"
      },
      // Scenario 3: Online appointment currently ongoing (should show join button)
      {
        elder_id: elders[0].elder_id,
        doctor_id: 2,
        query: "INSERT INTO appointment (elder_id, doctor_id, date_time, status, appointment_type, notes) VALUES ($1, 2, NOW() - INTERVAL '5 minutes', 'confirmed', 'online', 'DOCTOR2_TEST: Ongoing online appointment') RETURNING *"
      },
      // Scenario 4: Online appointment in 30 minutes (future, no meeting link yet)
      {
        elder_id: elders[2]?.elder_id || elders[0].elder_id,
        doctor_id: 2,
        query: "INSERT INTO appointment (elder_id, doctor_id, date_time, status, appointment_type, notes) VALUES ($1, 2, NOW() + INTERVAL '30 minutes', 'confirmed', 'online', 'DOCTOR2_TEST: Future online appointment') RETURNING *"
      },
      // Scenario 5: Online appointment tomorrow
      {
        elder_id: elders[1].elder_id,
        doctor_id: 2,
        query: "INSERT INTO appointment (elder_id, doctor_id, date_time, status, appointment_type, notes) VALUES ($1, 2, NOW() + INTERVAL '1 day', 'confirmed', 'online', 'DOCTOR2_TEST: Tomorrow online appointment') RETURNING *"
      }
    ];

    console.log('📅 Creating test appointments...');
    const createdAppointments = [];

    for (let i = 0; i < testAppointments.length; i++) {
      const apt = testAppointments[i];
      const result = await pool.query(apt.query, [apt.elder_id]);
      createdAppointments.push(result.rows[0]);
      
      const timeFromNow = Math.round((new Date(result.rows[0].date_time) - now) / (1000 * 60));
      console.log(`   ✅ Created: ${result.rows[0].appointment_type} appointment (${timeFromNow > 0 ? '+' : ''}${timeFromNow}min)`);
    }

    // 5. Generate meeting links for eligible appointments
    console.log('\n🔗 Generating meeting links for upcoming online appointments...');
    const generatedLinks = await meetingService.generateLinksForUpcomingAppointments();
    
    console.log(`Generated meeting links for ${generatedLinks.length} appointments:`);
    generatedLinks.forEach(apt => {
      console.log(`   🎥 Appointment ${apt.appointment_id}: ${apt.meeting_link}`);
    });

    // 6. Manually add meeting link to the ongoing appointment
    const ongoingAppointment = createdAppointments.find(apt => 
      apt.notes.includes('Ongoing online appointment')
    );

    if (ongoingAppointment) {
      console.log('\n🎯 Adding meeting link to ongoing appointment...');
      const meetingDetails = meetingService.generateMeetingLink(
        ongoingAppointment.appointment_id,
        2,
        ongoingAppointment.elder_id,
        doctor.name,
        elders.find(e => e.elder_id === ongoingAppointment.elder_id).name
      );

      await meetingService.updateAppointmentMeetingLink(
        ongoingAppointment.appointment_id,
        meetingDetails.meetingUrl
      );

      console.log(`   ✅ Added meeting link: ${meetingDetails.meetingUrl}`);
    }

    // 7. Test joinable appointments for doctor 2
    console.log('\n🎪 Testing joinable appointments for doctor 2...');
    const joinableAppointments = await meetingService.getJoinableAppointments(2);
    
    console.log(`Found ${joinableAppointments.length} joinable appointments:`);
    joinableAppointments.forEach(apt => {
      const timeFromNow = Math.round((new Date(apt.date_time) - new Date()) / (1000 * 60));
      const status = timeFromNow < 0 ? '(Ongoing)' : '(Upcoming)';
      console.log(`   🎥 ID: ${apt.appointment_id} | ${apt.appointment_type} | ${timeFromNow > 0 ? '+' : ''}${timeFromNow}min ${status}`);
      console.log(`      🔗 ${apt.meeting_link.substring(0, 60)}...`);
    });

    // 8. Summary and testing instructions
    console.log('\n📊 Test Data Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const allTestAppointments = await pool.query(`
      SELECT appointment_id, appointment_type, meeting_link, date_time, notes
      FROM appointment 
      WHERE doctor_id = 2 AND notes LIKE '%DOCTOR2_TEST%'
      ORDER BY date_time
    `);

    allTestAppointments.rows.forEach(apt => {
      const timeFromNow = Math.round((new Date(apt.date_time) - new Date()) / (1000 * 60));
      const hasLink = apt.meeting_link ? '🔗' : '❌';
      const status = timeFromNow < -60 ? '(Past)' : 
                    timeFromNow < -15 ? '(Ended)' : 
                    timeFromNow < 0 ? '(Ongoing)' :
                    timeFromNow <= 15 ? '(Soon)' :
                    '(Future)';
      
      console.log(`   ${hasLink} ${apt.appointment_type.toUpperCase()} | ID: ${apt.appointment_id} | ${timeFromNow > 0 ? '+' : ''}${timeFromNow}min ${status}`);
    });

    console.log('\n🧪 Testing Instructions:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Start the server: npm start (from server directory)');
    console.log('2. Start the client: npm start (from client directory)');
    console.log('3. Login with: Doctor@gmail.com (password: indipa123)');
    console.log('4. Go to doctor dashboard');
    console.log('5. Look for green "🎥 Join Meeting" buttons on ONLINE appointments only');
    console.log('6. Click join buttons to test new unique meeting rooms');
    console.log('7. Verify no authentication is required in Jitsi Meet');

    console.log('\n✅ Test data for Doctor ID 2 created successfully!');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    process.exit();
  }
}

createDoctor2TestData();
