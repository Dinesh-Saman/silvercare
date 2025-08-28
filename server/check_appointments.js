const axios = require('axios');

async function checkAppointments() {
  try {
    console.log('🔍 Checking available appointments...\n');
    
    // Check doctor 1's appointments
    console.log('Doctor 1 appointments:');
    const response = await axios.get('http://localhost:5000/api/doctor/1/appointments');
    
    if (response.data.appointments) {
      response.data.appointments.forEach(apt => {
        console.log(`- ID: ${apt.id}, Type: ${apt.appointment_type}, Status: ${apt.status}, Patient: ${apt.elder_name}, Date: ${apt.date_time}`);
      });
    } else {
      console.log('No appointments found');
    }
    
    // Also check doctor dashboard
    console.log('\nDoctor 1 dashboard:');
    const dashResponse = await axios.get('http://localhost:5000/api/doctor/1/dashboard');
    console.log('Dashboard data:', JSON.stringify(dashResponse.data, null, 2));
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

checkAppointments();
