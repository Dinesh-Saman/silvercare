const pool = require('./db');
const meetingService = require('./services/meetingService');

async function testMeetingLinks() {
  try {
    console.log('Testing meeting link generation...');
    
    // Create a test appointment that starts in 10 minutes
    const tenMinutesFromNow = new Date(Date.now() + 10 * 60 * 1000);
    
    console.log('1. Creating test appointment for:', tenMinutesFromNow);
    
    // Insert test appointment
    const appointmentResult = await pool.query(`
      INSERT INTO appointment (elder_id, doctor_id, date_time, status, appointment_type, notes)
      VALUES (1, 2, $1, 'confirmed', 'consultation', 'Test appointment for meeting links')
      RETURNING *
    `, [tenMinutesFromNow]);
    
    const appointment = appointmentResult.rows[0];
    console.log('Created appointment:', appointment);
    
    // Generate meeting link manually
    console.log('2. Generating meeting link...');
    const meetingDetails = meetingService.generateMeetingLink(
      appointment.appointment_id,
      appointment.doctor_id,
      appointment.elder_id,
      'Dr. Test Doctor',
      'Test Patient'
    );
    
    console.log('Meeting details:', meetingDetails);
    
    // Update appointment with meeting link
    const updatedAppointment = await meetingService.updateAppointmentMeetingLink(
      appointment.appointment_id,
      meetingDetails.meetingUrl
    );
    
    console.log('3. Updated appointment with meeting link:', updatedAppointment);
    
    // Test the scheduler
    console.log('4. Testing scheduler for upcoming appointments...');
    const generatedLinks = await meetingService.generateLinksForUpcomingAppointments();
    console.log('Scheduler generated links for:', generatedLinks.length, 'appointments');
    
    // Test join window
    console.log('5. Testing join window...');
    const isJoinable = meetingService.isWithinJoinWindow(tenMinutesFromNow);
    console.log('Appointment is joinable:', isJoinable);
    
    console.log('\n✅ Meeting link testing completed successfully!');
    console.log('Meeting URL:', meetingDetails.meetingUrl);
    console.log('Doctor Join URL:', meetingDetails.doctorJoinUrl);
    console.log('Elder Join URL:', meetingDetails.elderJoinUrl);
    
  } catch (error) {
    console.error('Error testing meeting links:', error);
  } finally {
    process.exit();
  }
}

testMeetingLinks();
