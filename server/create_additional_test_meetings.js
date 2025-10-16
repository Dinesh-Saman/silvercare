const pool = require('./db');
const MeetingService = require('./services/meetingService');

async function createAdditionalTestMeetings() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 Creating additional test meetings for Doctor@gmail.com (Indipa)...\n');

    // Find the doctor with email Doctor@gmail.com (Indipa)
    const doctorResult = await client.query(`
      SELECT d.doctor_id, d.user_id, u.name, u.email 
      FROM doctor d
      JOIN "User" u ON d.user_id = u.user_id
      WHERE u.email = 'Doctor@gmail.com'
    `);

    if (doctorResult.rows.length === 0) {
      console.log('❌ Doctor with email Doctor@gmail.com not found!');
      return;
    }

    const doctor = doctorResult.rows[0];
    console.log(`✅ Found doctor: ${doctor.name} (${doctor.email}) - ID: ${doctor.doctor_id}\n`);

    // Find an elder for appointments
    const elderResult = await client.query(`
      SELECT elder_id, name, email
      FROM elder 
      WHERE name != 'anura samarasinghe'
      LIMIT 1
    `);

    const elder = elderResult.rows[0] || { elder_id: 3, name: 'anura samarasinghe' };
    console.log(`✅ Using elder: ${elder.name} - ID: ${elder.elder_id}\n`);

    // Create test appointments for the next few hours/days
    const now = new Date();
    const testAppointments = [
      {
        dateTime: new Date(now.getTime() + 45 * 60 * 1000), // 45 minutes from now
        notes: 'Test Meeting #1 - Cardiology consultation'
      },
      {
        dateTime: new Date(now.getTime() + 2.5 * 60 * 60 * 1000), // 2.5 hours from now
        notes: 'Test Meeting #2 - Follow-up diabetes check'
      },
      {
        dateTime: new Date(now.getTime() + 6 * 60 * 60 * 1000), // 6 hours from now
        notes: 'Test Meeting #3 - Hypertension review'
      }
    ];

    console.log('📅 Creating test appointments for Dr. Indipa...\n');

    const createdAppointments = [];

    for (let i = 0; i < testAppointments.length; i++) {
      const testAppt = testAppointments[i];
      
      // Generate meeting link using our service
      const meetingData = MeetingService.generateMeetingLink(
        null,
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
      console.log(`   Meeting Link: ${appointment.meeting_link}`);
      console.log(`   Notes: ${appointment.notes}\n`);
    }

    // Display summary
    console.log('🎯 TEST MEETINGS FOR DR. INDIPA (Doctor@gmail.com):\n');
    console.log('=' .repeat(70));
    console.log(`Doctor: ${doctor.name} (${doctor.email})`);
    console.log(`Patient: ${elder.name}`);
    console.log(`Total New Appointments: ${createdAppointments.length}`);
    console.log('=' .repeat(70));

    // Show testing instructions
    console.log('\n🧪 HOW TO TEST:\n');
    console.log('1. 🔐 Login as Doctor@gmail.com (password: likely "password" or "123456")');
    console.log('2. 📱 Navigate to doctor dashboard');
    console.log('3. 👀 Look for these new appointments in your schedule');
    console.log('4. 🎥 Click "Join Meeting" button to test');
    console.log('5. 🚀 Should open Jitsi Meet with Dr. Indipa profile\n');

    // Direct meeting links for immediate testing
    console.log('🔗 DIRECT MEETING LINKS FOR IMMEDIATE TESTING:\n');
    createdAppointments.forEach((appt, index) => {
      const timeFromNow = Math.round((new Date(appt.date_time) - now) / (1000 * 60));
      console.log(`Meeting ${index + 1} (${timeFromNow} minutes from now):`);
      console.log(`🔗 ${appt.meeting_link}?userInfo.displayName=Dr.Indipa&userInfo.email=Doctor@gmail.com`);
      console.log(`📝 ${appt.notes}\n`);
    });

    // Show comprehensive test data
    console.log('📊 COMPREHENSIVE TEST SCENARIO:\n');
    console.log('Now you have test meetings for BOTH doctors:');
    console.log('- 📧 mendis@gmail.com (4 meetings)');
    console.log('- 📧 Doctor@gmail.com (3 new meetings)');
    console.log('');
    console.log('Total: 7 online confirmed appointments with meeting links ready for testing!');
    
    console.log('\n✅ Additional test meetings created successfully! 🎉');

  } catch (error) {
    console.error('❌ Error creating additional test meetings:', error);
    console.error(error.stack);
  } finally {
    client.release();
  }
}

// Run the creation
createAdditionalTestMeetings().catch(console.error);
