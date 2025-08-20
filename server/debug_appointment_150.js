const pool = require('./db');

async function debugAppointment150() {
  try {
    console.log('🔍 Debugging appointment 150 meeting link...\n');
    
    // Check what's actually in the database for appointment 150
    const result = await pool.query(`
      SELECT 
        appointment_id,
        elder_id,
        doctor_id,
        date_time,
        status,
        appointment_type,
        meeting_link,
        notes
      FROM appointment 
      WHERE appointment_id = 150
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ Appointment 150 not found');
      return;
    }
    
    const appointment = result.rows[0];
    
    console.log('📋 APPOINTMENT 150 DATABASE DATA:');
    console.log(`   ID: ${appointment.appointment_id}`);
    console.log(`   Elder ID: ${appointment.elder_id}`);
    console.log(`   Doctor ID: ${appointment.doctor_id}`);
    console.log(`   Time: ${appointment.date_time}`);
    console.log(`   Status: ${appointment.status}`);
    console.log(`   Type: ${appointment.appointment_type}`);
    console.log(`   Meeting Link: ${appointment.meeting_link || 'NULL/EMPTY'}`);
    console.log(`   Notes: ${appointment.notes}`);
    
    // Check elder details
    const elderResult = await pool.query(`
      SELECT e.name, u.email 
      FROM elder e 
      LEFT JOIN "User" u ON e.user_id = u.user_id 
      WHERE e.elder_id = $1
    `, [appointment.elder_id]);
    
    console.log(`\n👵 ELDER DETAILS:`);
    if (elderResult.rows.length > 0) {
      console.log(`   Name: ${elderResult.rows[0].name}`);
      console.log(`   Email: ${elderResult.rows[0].email || 'No email'}`);
    } else {
      console.log('   ❌ Elder not found');
    }
    
    // Test what the elder join API would return
    if (appointment.meeting_link) {
      const elderName = elderResult.rows[0]?.name || 'Patient';
      const elderEmail = elderResult.rows[0]?.email || 'patient@silvercare.com';
      
      const meetingUrl = new URL(appointment.meeting_link);
      meetingUrl.searchParams.set('userInfo.displayName', elderName);
      meetingUrl.searchParams.set('userInfo.email', elderEmail);
      meetingUrl.searchParams.set('config.prejoinPageEnabled', 'false');
      
      console.log(`\n🔗 WHAT ELDER SHOULD GET:`);
      console.log(`   ${meetingUrl.toString()}`);
    } else {
      console.log(`\n❌ NO MEETING LINK IN DATABASE - this is the problem!`);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugAppointment150();
