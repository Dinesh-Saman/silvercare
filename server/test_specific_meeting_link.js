// Test a specific meeting link to ensure it works
const testUrl = 'https://meet.jit.si/sc-2-3-e4bcce8176ae753d#config.prejoinPageEnabled=false&config.requireDisplayName=false&config.disableProfile=true&config.startWithAudioMuted=false&config.startWithVideoMuted=false';

console.log('🔗 Test meeting link:');
console.log(testUrl);
console.log('\n✅ This should open directly without authentication requirements.');
console.log('💡 Copy this link and test it in a browser to verify it works.');

// Let's also check what the dashboard API returns for doctor 2
const pool = require('./db');

async function testDashboardAPI() {
  try {
    console.log('\n🔍 Testing dashboard API for doctor 2...');
    
    // Get the same data the dashboard would get
    const doctorModel = require('./models/doctormodel');
    
    const [
      todaysAppointments,
      upcomingAppointments,
      nextAppointment,
      nextAppointments
    ] = await Promise.all([
      doctorModel.getTodaysAppointmentsByDoctorId(2),
      doctorModel.getUpcomingAppointmentsByDoctorId(2),
      doctorModel.getNextAppointmentByDoctorId(2),
      doctorModel.getNextAppointmentsByDoctorId(2, 5)
    ]);

    console.log('📊 Dashboard API Results:');
    console.log('Today\'s appointments:', todaysAppointments.length);
    console.log('Upcoming appointments:', upcomingAppointments.length);
    console.log('Next appointment:', nextAppointment ? 'Found' : 'None');
    console.log('Next appointments array:', nextAppointments.length);

    console.log('\n📋 Next appointments details:');
    nextAppointments.forEach((apt, idx) => {
      console.log(`${idx + 1}. ID: ${apt.appointment_id}, Type: ${apt.appointment_type}, Link: ${apt.meeting_link ? 'Yes' : 'No'}`);
      if (apt.meeting_link) {
        console.log(`   🔗 ${apt.meeting_link.substring(0, 60)}...`);
      }
    });

    console.log('\n📋 Upcoming appointments details:');
    upcomingAppointments.slice(0, 5).forEach((apt, idx) => {
      console.log(`${idx + 1}. ID: ${apt.appointment_id}, Type: ${apt.appointment_type}, Link: ${apt.meeting_link ? 'Yes' : 'No'}`);
      if (apt.meeting_link) {
        console.log(`   🔗 ${apt.meeting_link.substring(0, 60)}...`);
      }
    });

  } catch (error) {
    console.error('❌ Error testing dashboard API:', error);
  } finally {
    process.exit();
  }
}

testDashboardAPI();
