const axios = require('axios');

// Test the doctor join meeting endpoint
async function testDoctorJoinMeeting() {
  try {
    console.log('Testing doctor join meeting endpoint...');
    
    // Test with sample data - you can replace these with actual IDs from your database
    const doctorId = 1;
    const appointmentId = 1;
    
    const response = await axios.post(
      `http://localhost:5000/api/doctor/${doctorId}/appointments/${appointmentId}/join`,
      {},
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Doctor join meeting test successful:');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Doctor join meeting test failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

// Test the elder join meeting endpoint
async function testElderJoinMeeting() {
  try {
    console.log('\nTesting elder join meeting endpoint...');
    
    // Test with sample data
    const elderId = 1;
    const appointmentId = 1;
    
    const response = await axios.post(
      `http://localhost:5000/api/elder/${elderId}/appointments/${appointmentId}/join`,
      {},
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Elder join meeting test successful:');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Elder join meeting test failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

// Test getting doctor dashboard with meeting data
async function testDoctorDashboard() {
  try {
    console.log('\nTesting doctor dashboard endpoint...');
    
    const doctorId = 1;
    
    const response = await axios.get(
      `http://localhost:5000/api/doctor/${doctorId}/dashboard`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Doctor dashboard test successful:');
    console.log('Appointments found:', response.data.data.todaysAppointments?.length || 0);
    
    // Check for online appointments
    const onlineAppointments = response.data.data.todaysAppointments?.filter(
      app => app.appointment_type === 'online' && app.status === 'confirmed'
    ) || [];
    
    console.log('Online confirmed appointments:', onlineAppointments.length);
    
  } catch (error) {
    console.log('❌ Doctor dashboard test failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Meeting System Tests...\n');
  
  await testDoctorDashboard();
  await testDoctorJoinMeeting();
  await testElderJoinMeeting();
  
  console.log('\n✨ Tests completed!');
}

// Check if axios is available
try {
  runTests();
} catch (error) {
  console.log('Please install axios first: npm install axios');
  console.log('Error:', error.message);
}
