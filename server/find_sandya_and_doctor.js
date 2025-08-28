const pool = require('./db');

async function findUsersAndCreateAppointment() {
  try {
    console.log('🔍 Finding Sandya Priyani and doctor@gmail.com...\n');
    
    // Find Sandya Priyani
    const sandyaResult = await pool.query(`
      SELECT elder_id, name, family_id FROM elder WHERE name ILIKE '%sandya%' OR name ILIKE '%priyani%'
    `);
    
    // Find all doctors to see what's available
    const doctorsResult = await pool.query(`
      SELECT d.doctor_id, u.name, u.email, d.specialization 
      FROM doctor d 
      JOIN "User" u ON d.user_id = u.user_id 
      WHERE d.status = 'confirmed'
      ORDER BY u.email
    `);
    
    console.log('👵 Elders found:');
    if (sandyaResult.rows.length === 0) {
      console.log('   ❌ No elder named Sandya Priyani found');
    } else {
      sandyaResult.rows.forEach(elder => {
        console.log(`   - ${elder.name} (ID: ${elder.elder_id}, Family: ${elder.family_id})`);
      });
    }
    
    console.log('\n👨‍⚕️ Doctors found:');
    if (doctorsResult.rows.length === 0) {
      console.log('   ❌ No confirmed doctors found');
    } else {
      doctorsResult.rows.forEach(doctor => {
        console.log(`   - ${doctor.name} (ID: ${doctor.doctor_id}, Email: ${doctor.email}, Spec: ${doctor.specialization})`);
      });
    }
    
    // Check if doctor@gmail.com exists
    const targetDoctor = doctorsResult.rows.find(d => d.email === 'doctor@gmail.com');
    if (!targetDoctor) {
      console.log('\n❌ doctor@gmail.com not found in confirmed doctors');
      console.log('💡 You may need to create this doctor or check if they need approval');
    }
    
    // If both exist, create appointment
    if (sandyaResult.rows.length > 0 && targetDoctor) {
      const elderId = sandyaResult.rows[0].elder_id;
      const familyId = sandyaResult.rows[0].family_id;
      const doctorId = targetDoctor.doctor_id;
      
      // Create appointment for right now (joinable immediately)
      const now = new Date();
      const appointmentTime = new Date(now.getTime() + 1 * 60 * 1000); // 1 minute from now
      
      const appointmentResult = await pool.query(`
        INSERT INTO appointment (elder_id, family_id, doctor_id, date_time, status, appointment_type, notes)
        VALUES ($1, $2, $3, $4, 'confirmed', 'online', 'TEST: Sandya Priyani & doctor@gmail.com - JOIN NOW')
        RETURNING appointment_id, date_time
      `, [elderId, familyId, doctorId, appointmentTime]);
      
      const appointmentId = appointmentResult.rows[0].appointment_id;
      const scheduledTime = appointmentResult.rows[0].date_time;
      
      console.log(`\n✅ Created joinable appointment:`);
      console.log(`   📋 ID: ${appointmentId}`);
      console.log(`   👵 Elder: ${sandyaResult.rows[0].name}`);
      console.log(`   👨‍⚕️ Doctor: ${targetDoctor.email}`);
      console.log(`   🕐 Time: ${scheduledTime.toLocaleString()}`);
      console.log(`   🚀 Status: JOINABLE NOW!`);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

findUsersAndCreateAppointment();
