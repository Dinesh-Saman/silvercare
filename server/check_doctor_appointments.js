const pool = require('./db');

async function checkDoctorAppointments() {
  try {
    console.log('🔍 Checking appointments for doctor@gmail.com...\n');
    
    // First, find the doctor ID for doctor@gmail.com
    const doctorResult = await pool.query(`
      SELECT d.doctor_id, u.name, u.email 
      FROM doctor d 
      JOIN "User" u ON d.user_id = u.user_id 
      WHERE u.email = 'doctor@gmail.com'
    `);
    
    if (doctorResult.rows.length === 0) {
      console.log('❌ No doctor found with email doctor@gmail.com');
      return;
    }
    
    const doctorId = doctorResult.rows[0].doctor_id;
    console.log(`👨‍⚕️ Found doctor: ${doctorResult.rows[0].name} (ID: ${doctorId})`);
    
    // Check all appointments for this doctor
    const appointmentsResult = await pool.query(`
      SELECT 
        a.appointment_id,
        a.date_time,
        a.status,
        a.appointment_type,
        a.notes,
        e.name as elder_name,
        f.family_head_name
      FROM appointment a
      LEFT JOIN elder e ON a.elder_id = e.elder_id
      LEFT JOIN family f ON a.family_id = f.family_id
      WHERE a.doctor_id = $1
      ORDER BY a.date_time DESC
    `, [doctorId]);
    
    console.log(`\n📋 Total appointments found: ${appointmentsResult.rows.length}\n`);
    
    if (appointmentsResult.rows.length === 0) {
      console.log('❌ No appointments found for doctor@gmail.com');
    } else {
      appointmentsResult.rows.forEach((apt, index) => {
        const now = new Date();
        const aptTime = new Date(apt.date_time);
        const timeDiff = aptTime - now;
        const minutesFromNow = Math.round(timeDiff / (1000 * 60));
        
        console.log(`${index + 1}. 📅 Appointment ID: ${apt.appointment_id}`);
        console.log(`   👵 Elder: ${apt.elder_name || 'Unknown'}`);
        console.log(`   🕐 Time: ${aptTime.toLocaleString()}`);
        console.log(`   ⏰ From now: ${minutesFromNow > 0 ? `${minutesFromNow} minutes future` : `${Math.abs(minutesFromNow)} minutes ago`}`);
        console.log(`   📱 Type: ${apt.appointment_type}`);
        console.log(`   ✅ Status: ${apt.status}`);
        console.log(`   📝 Notes: ${apt.notes || 'None'}`);
        console.log('');
      });
    }
    
    // Also check if Sandya Priyani exists
    console.log('\n🔍 Checking for Sandya Priyani...');
    const sandyaResult = await pool.query(`
      SELECT elder_id, name, family_id FROM elder WHERE name ILIKE '%sandya%' OR name ILIKE '%priyani%'
    `);
    
    if (sandyaResult.rows.length > 0) {
      console.log(`👵 Found elder(s):`);
      sandyaResult.rows.forEach(elder => {
        console.log(`   - ${elder.name} (ID: ${elder.elder_id}, Family: ${elder.family_id})`);
      });
    } else {
      console.log('❌ No elder named Sandya Priyani found');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error checking appointments:', error);
    process.exit(1);
  }
}

checkDoctorAppointments();
