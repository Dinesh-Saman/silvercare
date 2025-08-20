const pool = require('./db');

async function createJoinableMeeting() {
  try {
    console.log('🚀 Creating joinable meeting for Sandya Priyani and Doctor@gmail.com...\n');
    
    // Use existing IDs found from previous check
    const elderId = 4; // Sandya Priyani
    const familyId = 1; // Her family
    const doctorId = 2; // Doctor@gmail.com (Indipa)
    
    // Create appointment for RIGHT NOW (joinable immediately)
    const now = new Date();
    const appointmentTime = new Date(now.getTime() + 30 * 1000); // 30 seconds from now
    
    const appointmentResult = await pool.query(`
      INSERT INTO appointment (elder_id, family_id, doctor_id, date_time, status, appointment_type, notes)
      VALUES ($1, $2, $3, $4, 'confirmed', 'online', 'LIVE TEST: Sandya Priyani & Doctor@gmail.com - JOIN NOW!')
      RETURNING appointment_id, date_time
    `, [elderId, familyId, doctorId, appointmentTime]);
    
    const appointmentId = appointmentResult.rows[0].appointment_id;
    const scheduledTime = appointmentResult.rows[0].date_time;
    
    console.log(`✅ JOINABLE MEETING CREATED:`);
    console.log(`   📋 Appointment ID: ${appointmentId}`);
    console.log(`   👵 Elder: Sandya Priyani (ID: ${elderId})`);
    console.log(`   👨‍⚕️ Doctor: Doctor@gmail.com (ID: ${doctorId})`);
    console.log(`   🕐 Scheduled: ${scheduledTime.toLocaleString()}`);
    console.log(`   📱 Type: online`);
    console.log(`   ✅ Status: confirmed`);
    
    console.log(`\n🎯 READY TO TEST:`);
    console.log(`   1. Login as Doctor@gmail.com in doctor portal`);
    console.log(`   2. Login as Sandya Priyani in elder portal`);
    console.log(`   3. Both should see this appointment as JOINABLE NOW`);
    console.log(`   4. Click "Join Meeting" to start video call`);
    
    console.log(`\n⏰ Meeting time: ${scheduledTime.toLocaleTimeString()}`);
    console.log(`📞 Meeting should be available for joining immediately!`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating meeting:', error);
    process.exit(1);
  }
}

createJoinableMeeting();
