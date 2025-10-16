const pool = require('./db');

async function createSandyaTestMeeting() {
  try {
    console.log('🧪 Creating test meeting for Sandya Priyani and doctor@gmail.com...\n');
    
    // Create an appointment for right now (joinable immediately)
    const now = new Date();
    const appointmentTime = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes from now to allow for immediate joining
    
    // First, let's check if we have Sandya Priyani as an elder and doctor@gmail.com as a doctor
    const elderCheck = await pool.query(`
      SELECT elder_id, name FROM elder WHERE name ILIKE '%sandya%' OR name ILIKE '%priyani%'
    `);
    
    const doctorCheck = await pool.query(`
      SELECT doctor_id, name, email FROM doctor WHERE email = 'doctor@gmail.com'
    `);
    
    let elderId, familyId, doctorId;
    
    // Create Sandya Priyani if she doesn't exist
    if (elderCheck.rows.length === 0) {
      console.log('👵 Creating elder: Sandya Priyani');
      const elderResult = await pool.query(`
        INSERT INTO elder (name, age, gender, address, phone, emergency_contact, medical_history, family_id)
        VALUES ('Sandya Priyani', 78, 'Female', '123 Colombo Road, Sri Lanka', '+94771234567', 'Daughter: +94779876543', 'Diabetes, Hypertension', 1)
        RETURNING elder_id
      `);
      elderId = elderResult.rows[0].elder_id;
      familyId = 1; // Assuming family_id 1 exists
    } else {
      elderId = elderCheck.rows[0].elder_id;
      const elderDetails = await pool.query(`SELECT family_id FROM elder WHERE elder_id = $1`, [elderId]);
      familyId = elderDetails.rows[0].family_id;
      console.log(`👵 Found existing elder: ${elderCheck.rows[0].name} (ID: ${elderId})`);
    }
    
    // Create doctor@gmail.com if they don't exist
    if (doctorCheck.rows.length === 0) {
      console.log('👨‍⚕️ Creating doctor: doctor@gmail.com');
      const doctorResult = await pool.query(`
        INSERT INTO doctor (name, email, password, specialization, contact_number, address, availability)
        VALUES ('Dr. Silvercare', 'doctor@gmail.com', '$2b$10$hashedpassword', 'General Practice', '+94112345678', 'Medical Center, Colombo', 'Mon-Fri 9AM-5PM')
        RETURNING doctor_id
      `);
      doctorId = doctorResult.rows[0].doctor_id;
    } else {
      doctorId = doctorCheck.rows[0].doctor_id;
      console.log(`👨‍⚕️ Found existing doctor: ${doctorCheck.rows[0].name} (ID: ${doctorId})`);
    }
    
    // Create the appointment
    const appointmentResult = await pool.query(`
      INSERT INTO appointment (elder_id, family_id, doctor_id, date_time, status, appointment_type, notes)
      VALUES ($1, $2, $3, $4, 'confirmed', 'online', 'Test meeting - Sandya Priyani & doctor@gmail.com - JOINABLE NOW')
      RETURNING appointment_id, date_time
    `, [elderId, familyId, doctorId, appointmentTime]);
    
    const appointmentId = appointmentResult.rows[0].appointment_id;
    const scheduledTime = appointmentResult.rows[0].date_time;
    
    console.log(`\n✅ Created test appointment:`);
    console.log(`   📋 Appointment ID: ${appointmentId}`);
    console.log(`   👵 Elder: Sandya Priyani (ID: ${elderId})`);
    console.log(`   👨‍⚕️ Doctor: doctor@gmail.com (ID: ${doctorId})`);
    console.log(`   🕐 Time: ${scheduledTime}`);
    console.log(`   📱 Type: online`);
    console.log(`   ✅ Status: confirmed`);
    
    console.log(`\n🚀 READY TO JOIN:`);
    console.log(`   ⏰ Meeting is scheduled for ${scheduledTime.toLocaleTimeString()}`);
    console.log(`   🎯 Both doctor@gmail.com and Sandya Priyani can join this meeting now!`);
    console.log(`\n📱 Test Instructions:`);
    console.log(`   1. Login as doctor@gmail.com in the doctor portal`);
    console.log(`   2. Login as Sandya Priyani in the elder/patient portal`);
    console.log(`   3. Both should see this appointment as joinable`);
    console.log(`   4. Click "Join Meeting" to test the video call functionality`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating test meeting:', error);
    process.exit(1);
  }
}

createSandyaTestMeeting();
