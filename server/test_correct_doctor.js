const axios = require('axios');

async function testCorrectDoctor() {
  try {
    console.log('🧪 Testing with correct doctor ID...\n');
    
    // Test with doctor ID 2 (Indipa) and appointment ID 121
    const doctorId = 2;
    const appointmentId = 121;
    
    console.log(`Testing doctor ${doctorId} joining appointment ${appointmentId}...`);
    
    const response = await axios.post(`http://localhost:5000/api/doctor/${doctorId}/appointments/${appointmentId}/join`);
    
    console.log('✅ Success!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      console.log('ℹ️  Time window restriction - this is expected behavior');
      console.log('   Appointment is scheduled for tomorrow, so you can only join 15 minutes before');
    }
  }
}

testCorrectDoctor();
