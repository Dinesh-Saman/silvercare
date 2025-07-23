const pool = require('./db');

async function createTestData() {
  try {
    console.log('Creating comprehensive test data for meeting functionality...\n');

    // First, let's check existing data
    console.log('1. Checking existing data...');
    const existingElders = await pool.query('SELECT elder_id, name FROM elder LIMIT 3');
    const existingDoctors = await pool.query('SELECT doctor_id, user_id FROM doctor LIMIT 3');
    
    console.log('Existing elders:', existingElders.rows);
    console.log('Existing doctors:', existingDoctors.rows);

    if (existingElders.rows.length === 0 || existingDoctors.rows.length === 0) {
      console.log('⚠️  No existing elders or doctors found. Please ensure basic data exists first.');
      process.exit(1);
    }

    const elderId = existingElders.rows[0].elder_id;
    const doctorId = existingDoctors.rows[0].doctor_id;

    console.log(`Using Elder ID: ${elderId}, Doctor ID: ${doctorId}\n`);

    // Clear existing test appointments
    console.log('2. Clearing existing test appointments...');
    await pool.query(`DELETE FROM appointment WHERE notes LIKE '%TEST%'`);

    // Create test appointments with different scenarios
    const now = new Date();
    
    const testAppointments = [
      // 1. Online appointment starting in 5 minutes (should get meeting link automatically)
      {
        elder_id: elderId,
        doctor_id: doctorId,
        date_time: new Date(now.getTime() + 5 * 60 * 1000),
        status: 'confirmed',
        appointment_type: 'online',
        notes: 'TEST: Online appointment in 5 minutes'
      },
      // 2. Online appointment starting in 10 minutes
      {
        elder_id: elderId,
        doctor_id: doctorId,
        date_time: new Date(now.getTime() + 10 * 60 * 1000),
        status: 'confirmed',
        appointment_type: 'online',
        notes: 'TEST: Online appointment in 10 minutes'
      },
      // 3. Physical appointment starting in 8 minutes (should NOT get meeting link)
      {
        elder_id: elderId,
        doctor_id: doctorId,
        date_time: new Date(now.getTime() + 8 * 60 * 1000),
        status: 'confirmed',
        appointment_type: 'physical',
        notes: 'TEST: Physical appointment in 8 minutes'
      },
      // 4. Online appointment starting in 30 minutes (too early for meeting link)
      {
        elder_id: elderId,
        doctor_id: doctorId,
        date_time: new Date(now.getTime() + 30 * 60 * 1000),
        status: 'confirmed',
        appointment_type: 'online',
        notes: 'TEST: Online appointment in 30 minutes'
      },
      // 5. Online appointment that started 5 minutes ago (should have join button)
      {
        elder_id: elderId,
        doctor_id: doctorId,
        date_time: new Date(now.getTime() - 5 * 60 * 1000),
        status: 'confirmed',
        appointment_type: 'online',
        notes: 'TEST: Online appointment started 5 minutes ago',
        meeting_link: 'https://meet.jit.si/silvercare-test-ongoing'
      },
      // 6. Physical appointment for tomorrow
      {
        elder_id: elderId,
        doctor_id: doctorId,
        date_time: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        status: 'confirmed',
        appointment_type: 'physical',
        notes: 'TEST: Physical appointment tomorrow'
      },
      // 7. Online appointment for tomorrow
      {
        elder_id: elderId,
        doctor_id: doctorId,
        date_time: new Date(now.getTime() + 25 * 60 * 60 * 1000),
        status: 'confirmed',
        appointment_type: 'online',
        notes: 'TEST: Online appointment tomorrow'
      }
    ];

    console.log('3. Creating test appointments...');
    const createdAppointments = [];

    for (const appointment of testAppointments) {
      const query = `
        INSERT INTO appointment (elder_id, doctor_id, date_time, status, appointment_type, notes, meeting_link)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const values = [
        appointment.elder_id,
        appointment.doctor_id,
        appointment.date_time,
        appointment.status,
        appointment.appointment_type,
        appointment.notes,
        appointment.meeting_link || null
      ];

      const result = await pool.query(query, values);
      createdAppointments.push(result.rows[0]);
      
      console.log(`✅ Created: ${appointment.appointment_type} appointment at ${appointment.date_time.toLocaleString()}`);
    }

    console.log('\n4. Test data summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    for (const apt of createdAppointments) {
      const timeFromNow = Math.round((new Date(apt.date_time) - now) / (1000 * 60));
      const status = timeFromNow < -60 ? '(Past)' : 
                    timeFromNow < -15 ? '(Ended)' : 
                    timeFromNow < 0 ? '(Ongoing - should have join button)' :
                    timeFromNow <= 15 ? '(Should get meeting link soon)' :
                    '(Future)';
      
      console.log(`📅 ID: ${apt.appointment_id} | ${apt.appointment_type.toUpperCase()} | ${timeFromNow > 0 ? '+' : ''}${timeFromNow}min ${status}`);
      console.log(`   📝 ${apt.notes}`);
      if (apt.meeting_link) {
        console.log(`   🔗 Meeting: ${apt.meeting_link}`);
      }
      console.log('');
    }

    console.log('5. Testing scenarios:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🟢 ONLINE appointments within 15 minutes → Should get meeting links automatically');
    console.log('🔴 PHYSICAL appointments → Should NOT get meeting links');
    console.log('🟡 ONGOING online appointments → Should show "Join Meeting" button');
    console.log('⚫ FUTURE online appointments → Should show normal "Start Consultation" button');
    
    console.log('\n6. Next steps:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Wait for the scheduler to run (every 5 minutes) OR trigger manually:');
    console.log('   curl -X POST http://localhost:5000/api/meetings/scheduler/trigger');
    console.log('');
    console.log('2. Check the doctor dashboard to see:');
    console.log('   - Join buttons for online appointments within the time window');
    console.log('   - No join buttons for physical appointments');
    console.log('');
    console.log('3. Test meeting link generation:');
    console.log('   curl -X POST http://localhost:5000/api/meetings/generate-links');

    console.log('\n✅ Test data created successfully!');

  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    process.exit();
  }
}

createTestData();
