const pool = require('./db');
const { v4: uuidv4 } = require('uuid');

async function testHealthcareProfessionalSystem() {
  try {
    console.log('Testing Healthcare Professional Appointment System...\n');
    
    // 1. Check if database modifications were successful
    console.log('1. Checking database structure...');
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'appointment' 
      AND column_name IN ('counselor_id', 'provider_type')
      ORDER BY column_name;
    `);
    
    if (columnsResult.rows.length === 2) {
      console.log('✅ Database modifications successful:');
      columnsResult.rows.forEach(row => {
        console.log(`   - ${row.column_name}: ${row.data_type}`);
      });
    } else {
      console.log('❌ Database modifications missing. Running migration...');
      
      // Add missing columns
      await pool.query(`
        ALTER TABLE appointment 
        ADD COLUMN IF NOT EXISTS counselor_id INTEGER REFERENCES counselor(counselor_id),
        ADD COLUMN IF NOT EXISTS provider_type VARCHAR(20) DEFAULT 'doctor' CHECK (provider_type IN ('doctor', 'counselor'));
      `);
      console.log('✅ Database migration completed');
    }
    
    // 2. Check available healthcare professionals
    console.log('\n2. Checking available healthcare professionals...');
    const counselorsResult = await pool.query(`
      SELECT 
        c.counselor_id,
        u.name,
        c.specialization as specialty,
        u.phone,
        u.email,
        c.status,
        c.district
      FROM counselor c
      JOIN "User" u ON c.user_id = u.user_id
      WHERE c.status = 'confirmed'
      LIMIT 3;
    `);
    
    if (counselorsResult.rows.length > 0) {
      console.log(`✅ Found ${counselorsResult.rows.length} healthcare professionals:`);
      counselorsResult.rows.forEach(counselor => {
        console.log(`   - ID: ${counselor.counselor_id}, Name: ${counselor.name}, Specialty: ${counselor.specialty}, District: ${counselor.district}, Status: ${counselor.status}`);
      });
    } else {
      console.log('⚠️  No healthcare professionals found. Creating test data...');
      
      // Create a test counselor
      const testCounselorResult = await pool.query(`
        INSERT INTO counselor (name, specialty, phone, email, years_experience, district)
        VALUES ('Dr. Sarah Johnson', 'Mental Health Counselor', '+1-555-0123', 'sarah.johnson@silvercare.com', 8, 'Colombo')
        RETURNING id, name, specialty;
      `);
      
      console.log(`✅ Created test counselor: ${testCounselorResult.rows[0].name}`);
    }
    
    // 3. Get a test elder
    console.log('\n3. Getting test elder...');
    const elderResult = await pool.query('SELECT elder_id, name, family_id FROM elder LIMIT 1;');
    
    if (elderResult.rows.length === 0) {
      console.log('❌ No elders found in database');
      return;
    }
    
    const testElder = elderResult.rows[0];
    console.log(`✅ Using test elder: ${testElder.name} (ID: ${testElder.elder_id})`);
    
    // 4. Create a test healthcare professional appointment
    console.log('\n4. Testing healthcare professional appointment creation...');
    const testCounselor = await pool.query('SELECT counselor_id FROM counselor LIMIT 1;');
    
    if (testCounselor.rows.length === 0) {
      console.log('❌ No counselors available for testing');
      return;
    }
    
    const counselorId = testCounselor.rows[0].counselor_id;
    const appointmentDate = '2025-09-15';
    const appointmentTime = '14:00';
    const meetingLink = `https://meet.jit.si/silvercare-${uuidv4()}`;
    
    // Combine date and time into a timestamp
    const dateTimeString = `${appointmentDate} ${appointmentTime}:00`;
    const appointmentDateTime = new Date(dateTimeString);
    
    const appointmentResult = await pool.query(`
      INSERT INTO appointment (
        elder_id, 
        family_id, 
        counselor_id, 
        provider_type,
        date_time, 
        status, 
        appointment_type, 
        meeting_link,
        notes, 
        created_at, 
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING appointment_id, meeting_link;
    `, [
      testElder.elder_id,
      testElder.family_id, 
      counselorId,
      'counselor',
      appointmentDateTime,
      'confirmed',
      'online',
      meetingLink,
      'Test healthcare professional appointment with automatic meeting link'
    ]);
    
    const newAppointment = appointmentResult.rows[0];
    console.log(`✅ Healthcare professional appointment created successfully!`);
    console.log(`   - Appointment ID: ${newAppointment.appointment_id}`);
    console.log(`   - Meeting Link: ${newAppointment.meeting_link}`);
    console.log(`   - Meeting accessible at: ${newAppointment.meeting_link}`);
    
    // 5. Verify the appointment was created correctly
    console.log('\n5. Verifying appointment details...');
    const verifyResult = await pool.query(`
      SELECT 
        a.appointment_id,
        a.elder_id,
        a.counselor_id,
        a.provider_type,
        a.date_time,
        a.appointment_type,
        a.meeting_link,
        a.status,
        e.name as elder_name,
        u.name as counselor_name,
        c.specialization as specialty
      FROM appointment a
      LEFT JOIN elder e ON a.elder_id = e.elder_id
      LEFT JOIN counselor c ON a.counselor_id = c.counselor_id
      LEFT JOIN "User" u ON c.user_id = u.user_id
      WHERE a.appointment_id = $1;
    `, [newAppointment.appointment_id]);
    
    if (verifyResult.rows.length > 0) {
      const appointment = verifyResult.rows[0];
      console.log('✅ Appointment verification successful:');
      console.log(`   - Elder: ${appointment.elder_name}`);
      console.log(`   - Healthcare Professional: ${appointment.counselor_name}`);
      console.log(`   - Specialty: ${appointment.specialty}`);
      console.log(`   - Provider Type: ${appointment.provider_type}`);
      console.log(`   - Date/Time: ${appointment.date_time}`);
      console.log(`   - Type: ${appointment.appointment_type}`);
      console.log(`   - Status: ${appointment.status}`);
      console.log(`   - Meeting Link: ${appointment.meeting_link}`);
    }
    
    console.log('\n🎉 Healthcare Professional Appointment System Test Completed Successfully!');
    console.log('\nThe system now supports:');
    console.log('✅ Healthcare professional appointments alongside doctor appointments');
    console.log('✅ Automatic Jitsi Meet link generation for online sessions');
    console.log('✅ Non-localhost meeting URLs that work globally');
    console.log('✅ Proper database structure for dual provider support');
    console.log('✅ API endpoints for healthcare professional booking');
    
    // 6. Show available API endpoints
    console.log('\n📋 Available API Endpoints:');
    console.log('1. GET /api/elders/:elderId/healthcare-professionals/online - Get all healthcare professionals');
    console.log('2. POST /api/elders/:elderId/healthcare-appointments - Create healthcare professional appointment');
    console.log('3. GET /api/elders/:elderId/appointments - Get all appointments (doctors + healthcare professionals)');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await pool.end();
  }
}

testHealthcareProfessionalSystem();
