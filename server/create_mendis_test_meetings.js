const pool = require('./db');
const MeetingService = require('./services/meetingService');

async function createTestMeetings() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 Creating test meetings for mendis@gmail.com...\n');

    // Step 1: Find the doctor with email mendis@gmail.com
    const doctorResult = await client.query(`
      SELECT d.doctor_id, d.user_id, u.name, u.email 
      FROM doctor d
      JOIN "User" u ON d.user_id = u.user_id
      WHERE u.email = 'mendis@gmail.com'
    `);

    const doctor = doctorResult.rows[0];
    console.log(`✅ Found doctor: ${doctor.name} (${doctor.email}) - ID: ${doctor.doctor_id}\n`);

    // Step 2: Find an elder to create appointments with
    const elderResult = await client.query(`
      SELECT elder_id, name, email
      FROM elder 
      LIMIT 1
    `);

    if (elderResult.rows.length === 0) {
      console.log('❌ No elders found in database!');
      return;
    }

    const elder = elderResult.rows[0];
    console.log(`✅ Using elder: ${elder.name} - ID: ${elder.elder_id}\n`);

    // Step 3: Create test appointments with different times
    const now = new Date();
    const testAppointments = [
      {
        dateTime: new Date(now.getTime() + 30 * 60 * 1000), // 30 minutes from now
        notes: 'URGENT: Test online consultation - Chest pain follow-up'
      },
      {
        dateTime: new Date(now.getTime() + 90 * 60 * 1000), // 1.5 hours from now
        notes: 'Test online consultation - Routine blood pressure check'
      },
      {
        dateTime: new Date(now.getTime() + 4 * 60 * 60 * 1000), // 4 hours from now
        notes: 'Test online consultation - Medication review'
      },
      {
        dateTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow same time
        notes: 'Test online consultation - General wellness check'
      }
    ];

    console.log('📅 Creating test appointments...\n');

    const createdAppointments = [];

    for (let i = 0; i < testAppointments.length; i++) {
      const testAppt = testAppointments[i];
      
      // Generate meeting link
      const meetingData = MeetingService.generateMeetingLink(
        null, // will be set after creation
        doctor.doctor_id,
        elder.elder_id
      );

      // Create appointment
      const appointmentResult = await client.query(`
        INSERT INTO appointment (
          elder_id,
          doctor_id,
          date_time,
          status,
          notes,
          appointment_type,
          meeting_link,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `, [
        elder.elder_id,
        doctor.doctor_id,
        testAppt.dateTime,
        'confirmed',
        testAppt.notes,
        'online',
        meetingData.meetingLink
      ]);

      const appointment = appointmentResult.rows[0];
      createdAppointments.push({
        ...appointment,
        meetingData
      });

      console.log(`✅ Created appointment ${i + 1}:`);
      console.log(`   ID: ${appointment.appointment_id}`);
      console.log(`   Date: ${new Date(appointment.date_time).toLocaleString()}`);
      console.log(`   Status: ${appointment.status}`);
      console.log(`   Type: ${appointment.appointment_type}`);
      console.log(`   Meeting Link: ${appointment.meeting_link}`);
      console.log(`   Notes: ${appointment.notes}\n`);
    }

    // Step 4: Display summary for testing
    console.log('🎯 TEST MEETINGS READY FOR DR. MENDIS!\n');
    console.log('=' .repeat(60));
    console.log(`Doctor: ${doctor.name} (${doctor.email})`);
    console.log(`Patient: ${elder.name}`);
    console.log(`Total Test Appointments: ${createdAppointments.length}`);
    console.log('=' .repeat(60));

    console.log('\n🎥 MEETING ROOMS CREATED:\n');
    createdAppointments.forEach((appt, index) => {
      const timeFromNow = Math.round((new Date(appt.date_time) - now) / (1000 * 60));
      console.log(`${index + 1}. Appointment ID: ${appt.appointment_id}`);
      console.log(`   📅 Scheduled: ${new Date(appt.date_time).toLocaleString()}`);
      console.log(`   ⏰ Time from now: ${timeFromNow} minutes`);
      console.log(`   🔗 Meeting Room: ${appt.meeting_link}`);
      console.log(`   📝 ${appt.notes}\n`);
    });

    // Step 5: Testing instructions
    console.log('🧪 HOW TO TEST:\n');
    console.log('1. 🔐 Login to the system as mendis@gmail.com');
    console.log('2. 📱 Navigate to the doctor dashboard');
    console.log('3. 👀 Look for these appointments in your schedule');
    console.log('4. 🎥 Click "Join Meeting" button on any appointment');
    console.log('5. 🚀 Jitsi Meet should open with your doctor profile\n');

    // Step 6: Direct meeting links for testing
    console.log('🔗 DIRECT MEETING LINKS (for immediate testing):\n');
    createdAppointments.forEach((appt, index) => {
      console.log(`Meeting ${index + 1}:`);
      console.log(`Doctor Link: ${appt.meetingData.doctorUrl}`);
      console.log(`Patient Link: ${appt.meetingData.patientUrl}`);
      console.log('');
    });

    // Step 7: Create a companion test script for easy access
    const testScript = `
-- Quick SQL to check the created appointments:
SELECT 
  a.appointment_id,
  TO_CHAR(a.date_time, 'YYYY-MM-DD HH24:MI') as scheduled_time,
  a.status,
  a.appointment_type,
  CASE 
    WHEN a.meeting_link IS NOT NULL THEN '✅ Has Meeting Link'
    ELSE '❌ No Meeting Link'
  END as meeting_status,
  a.notes
FROM appointment a
JOIN doctor d ON a.doctor_id = d.doctor_id
JOIN "User" u ON d.user_id = u.user_id
WHERE u.email = 'mendis@gmail.com'
AND a.status = 'confirmed'
AND a.appointment_type = 'online'
ORDER BY a.date_time;
    `;

    console.log('📊 VERIFICATION SQL:\n');
    console.log(testScript);

    console.log('✅ All test meetings created successfully!');
    console.log('🎉 Ready for testing the join meeting functionality!\n');

  } catch (error) {
    console.error('❌ Error creating test meetings:', error);
    console.error('Stack:', error.stack);
  } finally {
    client.release();
  }
}

// Run the test
createTestMeetings().catch(console.error);
