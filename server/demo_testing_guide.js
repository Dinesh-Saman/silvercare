const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function createDemoGuide() {
  try {
    console.log('🎭 SilverCare Meeting Testing Guide\n');
    console.log('='.repeat(50));
    
    // Get current appointments with meeting URLs
    const appointments = await pool.query(`
      SELECT appointment_id, elder_id, date_time, zoom_join_url, notes
      FROM appointment 
      WHERE doctor_id = 2 
        AND appointment_type = 'online' 
        AND status = 'confirmed'
        AND DATE(date_time) = CURRENT_DATE
      ORDER BY date_time
    `);
    
    console.log('\n📋 AVAILABLE TEST APPOINTMENTS:\n');
    
    appointments.rows.forEach((apt, index) => {
      const time = new Date(apt.date_time);
      const meetingUrl = apt.zoom_join_url;
      
      console.log(`${index + 1}. Appointment ${apt.appointment_id}:`);
      console.log(`   Time: ${time.toLocaleString()}`);
      console.log(`   Patient ID: ${apt.elder_id}`);
      console.log(`   Doctor Meeting URL: ${meetingUrl || 'Not generated yet'}`);
      
      if (meetingUrl) {
        // Extract meeting ID from URL
        const meetingIdMatch = meetingUrl.match(/consultation\/([^?]+)/);
        if (meetingIdMatch) {
          const meetingId = meetingIdMatch[1];
          const patientJoinUrl = `http://localhost:3000/patient-join/${meetingId}?doctor=2&patient=${apt.elder_id}&type=consultation`;
          console.log(`   Patient Join URL: ${patientJoinUrl}`);
        }
      }
      console.log(`   Notes: ${apt.notes || 'No notes'}`);
      console.log('');
    });
    
    console.log('\n🚀 TESTING WORKFLOW:\n');
    console.log('Step 1: Doctor Login & Join Meeting');
    console.log('   → Open Browser 1 (Chrome): http://localhost:3000');
    console.log('   → Login with: Doctor@gmail.com');
    console.log('   → Go to Doctor Dashboard');
    console.log('   → Click "Join Meeting" on any appointment');
    console.log('   → This will open the virtual meeting room');
    console.log('');
    
    console.log('Step 2: Patient Join Meeting (Same Time)');
    console.log('   → Open Browser 2 (Firefox/Edge): Use Patient Join URL from above');
    console.log('   → Or manually navigate to:');
    console.log('     http://localhost:3000/patient-join/MEETING_ID?doctor=2&patient=PATIENT_ID&type=consultation');
    console.log('   → Click "Join Consultation" button');
    console.log('   → This will open the same meeting room');
    console.log('');
    
    console.log('Step 3: Test Meeting Features');
    console.log('   → Both browsers should show video/audio controls');
    console.log('   → Test mute/unmute microphone');
    console.log('   → Test turn on/off camera');  
    console.log('   → Test chat functionality');
    console.log('   → Verify both users can see each other\'s video');
    console.log('');
    
    console.log('📱 QUICK TEST URLs:\n');
    
    // Generate quick test URLs for easy copy-paste
    if (appointments.rows.length > 0) {
      const firstApt = appointments.rows[0];
      const meetingUrl = firstApt.zoom_join_url;
      
      if (meetingUrl) {
        const meetingIdMatch = meetingUrl.match(/consultation\/([^?]+)/);
        if (meetingIdMatch) {
          const meetingId = meetingIdMatch[1];
          
          console.log('🩺 Doctor Dashboard:');
          console.log('   http://localhost:3000/doctor/dashboard');
          console.log('');
          
          console.log('👤 Patient Join (Copy & Paste in second browser):');
          console.log(`   http://localhost:3000/patient-join/${meetingId}?doctor=2&patient=${firstApt.elder_id}&type=consultation`);
          console.log('');
          
          console.log('🏥 Direct Meeting Room (Both users):');
          console.log(`   http://localhost:3000/consultation/${meetingId}?doctor=2&patient=${firstApt.elder_id}&type=consultation`);
        }
      }
    }
    
    console.log('\n💡 TIPS FOR TESTING:\n');
    console.log('• Use different browsers (Chrome + Firefox) or incognito modes');
    console.log('• Allow camera/microphone permissions when prompted');
    console.log('• Both users should join within a few seconds of each other');
    console.log('• Check browser console for any errors');
    console.log('• Test on different devices if available');
    console.log('');
    
    console.log('🔧 TROUBLESHOOTING:\n');
    console.log('• If meeting URL not generated: Doctor must click "Join Meeting" first');
    console.log('• If camera not working: Check browser permissions');
    console.log('• If audio issues: Check system audio settings');
    console.log('• If page not loading: Ensure both servers are running');
    console.log('  - Backend: http://localhost:5000 ✓');
    console.log('  - Frontend: http://localhost:3000 ✓');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createDemoGuide();
