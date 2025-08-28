const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function generateTestUrls() {
  try {
    console.log('🔗 Updated Test URLs for Doctor vs Patient Testing\n');
    console.log('='.repeat(60));
    
    const appointments = await pool.query(`
      SELECT appointment_id, elder_id, zoom_join_url, notes
      FROM appointment 
      WHERE doctor_id = 2 
        AND appointment_type = 'online' 
        AND status = 'confirmed'
        AND zoom_join_url IS NOT NULL
        AND DATE(date_time) = CURRENT_DATE
      ORDER BY appointment_id
      LIMIT 2
    `);
    
    if (appointments.rows.length === 0) {
      console.log('❌ No appointments with generated meeting URLs found.');
      console.log('💡 First, login as doctor and click "Join Meeting" to generate URLs.');
      return;
    }
    
    console.log('📋 READY FOR TESTING:\n');
    
    appointments.rows.forEach((apt, index) => {
      const meetingUrl = apt.zoom_join_url;
      const meetingIdMatch = meetingUrl.match(/consultation\/([^?]+)/);
      
      if (meetingIdMatch) {
        const meetingId = meetingIdMatch[1];
        
        console.log(`${index + 1}. APPOINTMENT ${apt.appointment_id} (Patient ${apt.elder_id}):`);
        console.log('   ━'.repeat(50));
        
        console.log('   🩺 DOCTOR ACCESS (Browser 1 - Chrome):');
        console.log('   → Login: http://localhost:3000');
        console.log('   → Use: Doctor@gmail.com + password');
        console.log('   → Click "Join Meeting" on dashboard');
        console.log('   → Should show: "👨‍⚕️ Joined as: Doctor"');
        console.log('');
        
        console.log('   👤 PATIENT ACCESS (Browser 2 - Firefox):');
        console.log(`   → Direct Link: http://localhost:3000/patient-join/${meetingId}?doctor=2&patient=${apt.elder_id}&type=consultation`);
        console.log('   → Click "🚀 Join Consultation"');
        console.log('   → Should show: "🧑‍🦳 Joined as: Patient"');
        console.log('');
        
        console.log('   🔗 DIRECT MEETING ROOM URLS (For testing):');
        console.log(`   → Doctor: http://localhost:3000/consultation/${meetingId}?doctor=2&patient=${apt.elder_id}&type=consultation&role=doctor`);
        console.log(`   → Patient: http://localhost:3000/consultation/${meetingId}?doctor=2&patient=${apt.elder_id}&type=consultation&role=patient`);
        console.log('\n');
      }
    });
    
    console.log('✅ WHAT TO VERIFY:\n');
    console.log('1. Doctor browser shows: "👨‍⚕️ Joined as: Doctor" in blue');
    console.log('2. Patient browser shows: "🧑‍🦳 Joined as: Patient" in green');
    console.log('3. Both have working video/audio controls');
    console.log('4. Chat messages show correct sender names');
    console.log('5. Both can interact in the same meeting room');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

generateTestUrls();
