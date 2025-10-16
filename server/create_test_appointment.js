const pool = require('./db');

async function createTestAppointment() {
  try {
    console.log('🧪 Creating a test appointment for immediate joining...\n');
    
    // Create an appointment for today, 5 minutes from now
    const now = new Date();
    const appointmentTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
    
    const result = await pool.query(`
      INSERT INTO appointment (elder_id, family_id, doctor_id, date_time, status, appointment_type, notes)
      VALUES (1, 1, 2, $1, 'confirmed', 'online', 'Test appointment for immediate joining')
      RETURNING appointment_id, date_time
    `, [appointmentTime]);
    
    const appointmentId = result.rows[0].appointment_id;
    const scheduledTime = result.rows[0].date_time;
    
    console.log(`✅ Created test appointment:`)
    console.log(`   - ID: ${appointmentId}`);
    console.log(`   - Doctor: 2 (Indipa)`);
    console.log(`   - Time: ${scheduledTime}`);
    console.log(`   - Type: online`);
    console.log(`   - Status: confirmed`);
    
    console.log(`\n🚀 You can now test joining this appointment in your UI!`);
    console.log(`   The appointment should be joinable now (within time window).`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestAppointment();
