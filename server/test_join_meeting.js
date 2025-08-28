const axios = require('axios');

async function testDoctorJoinMeeting() {
  try {
    console.log('🧪 Testing Doctor Join Meeting API...\n');
    
    // Test with a known appointment ID (from your screenshot, appointment ID 2)
    const doctorId = 1; // Assuming doctor ID 1
    const appointmentId = 2; // From your screenshot
    
    console.log(`Attempting to join appointment ${appointmentId} as doctor ${doctorId}...`);
    
    const response = await axios.post(`http://localhost:5000/api/doctor/${doctorId}/appointments/${appointmentId}/join`);
    
    console.log('✅ Success!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      console.log('ℹ️  This might be expected if the appointment is not within the allowed time window');
    }
  }
}

testDoctorJoinMeeting();
