const pool = require('./db');
const MeetingService = require('./services/meetingService');

async function createTestMeetings() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 Creating test meetings for doctor@gmail.com...\n');

    // Step 1: Find the doctor with email doctor@gmail.com
    const doctorResult = await client.query(`
      SELECT d.doctor_id, d.user_id, u.name, u.email 
      FROM doctor d
      JOIN "User" u ON d.user_id = u.user_id
      WHERE u.email = 'doctor@gmail.com'
    `);

    if (doctorResult.rows.length === 0) {
      console.log('❌ Doctor with email doctor@gmail.com not found!');
      console.log('Available doctors:');
      
      const allDoctors = await client.query(`
        SELECT d.doctor_id, d.user_id, u.name, u.email 
        FROM doctor d
        JOIN "User" u ON d.user_id = u.user_id
        LIMIT 5
      `);
      
      allDoctors.rows.forEach(doc => {
        console.log(`  - ${doc.name} (${doc.email}) - Doctor ID: ${doc.doctor_id}`);
      });
      return;
    }

    const doctor = doctorResult.rows[0];
    console.log(`✅ Found doctor: ${doctor.name} (${doctor.email}) - ID: ${doctor.doctor_id}\n`);

    // Step 2: Find an elder to create appointments with
    const elderResult = await client.query(`
      SELECT elder_id, user_id, name 
      FROM elder 
      LIMIT 1
    `);

    if (elderResult.rows.length === 0) {
      console.log('❌ No elders found in database!');
      return;
    }

    const elder = elderResult.rows[0];
    console.log(`✅ Using elder: ${elder.name} - ID: ${elder.elder_id}\n`);

    // Step 3: Create test appointments
    const testAppointments = [
      {
        dateTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        notes: 'Test online consultation - General checkup'
      },
      {
        dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        notes: 'Test online consultation - Follow-up'
      },
      {
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        notes: 'Test online consultation - Routine consultation'
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
      console.log(`   Date: ${appointment.date_time}`);
      console.log(`   Status: ${appointment.status}`);
      console.log(`   Type: ${appointment.appointment_type}`);
      console.log(`   Meeting Link: ${appointment.meeting_link}`);
      console.log(`   Notes: ${appointment.notes}\n`);
    }

    // Step 4: Display summary
    console.log('📊 SUMMARY OF CREATED TEST MEETINGS:\n');
    console.log(`Doctor: ${doctor.name} (${doctor.email})`);
    console.log(`Patient: ${elder.name}`);
    console.log(`Total Appointments: ${createdAppointments.length}\n`);

    console.log('🎥 MEETING LINKS FOR TESTING:\n');
    createdAppointments.forEach((appt, index) => {
      console.log(`Meeting ${index + 1} - Appointment ID: ${appt.appointment_id}`);
      console.log(`  📅 Date: ${new Date(appt.date_time).toLocaleString()}`);
      console.log(`  🔗 Meeting URL: ${appt.meeting_link}`);
      console.log(`  👨‍⚕️ Doctor URL: ${appt.meetingData.doctorUrl}`);
      console.log(`  👴 Patient URL: ${appt.meetingData.patientUrl}`);
      console.log('');
    });

    // Step 5: Create query to verify in dashboard
    console.log('🔍 TO TEST IN DOCTOR DASHBOARD:\n');
    console.log('1. Login as doctor@gmail.com');
    console.log('2. Go to doctor dashboard');
    console.log('3. Look for "Join Meeting" buttons on these appointments');
    console.log('4. Click any "Join Meeting" button to test\n');

    // Step 6: Display SQL query to check appointments
    console.log('📝 SQL QUERY TO CHECK APPOINTMENTS:\n');
    console.log(`
SELECT 
  a.appointment_id,
  a.date_time,
  a.status,
  a.appointment_type,
  a.meeting_link,
  a.notes,
  u.name as doctor_name,
  u.email as doctor_email
FROM appointment a
JOIN doctor d ON a.doctor_id = d.doctor_id
JOIN "User" u ON d.user_id = u.user_id
WHERE u.email = 'doctor@gmail.com'
AND a.appointment_type = 'online'
AND a.status = 'confirmed'
ORDER BY a.date_time;
    `);

    console.log('✅ Test meetings created successfully!\n');
    console.log('🚀 You can now test the join meeting functionality in the doctor dashboard.');

  } catch (error) {
    console.error('❌ Error creating test meetings:', error);
  } finally {
    client.release();
  }
}

// Run the test
createTestMeetings().catch(console.error);
