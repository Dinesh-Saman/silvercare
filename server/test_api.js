const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing doctor API endpoints...');
    
    // Test 1: Get doctor by user ID
    console.log('\n1. Testing GET /api/doctor/user/11');
    const doctorResponse = await fetch('http://localhost:5000/api/doctor/user/11');
    const doctorData = await doctorResponse.json();
    console.log('Doctor data:', JSON.stringify(doctorData, null, 2));
    
    if (doctorData?.doctor?.doctor_id) {
      const doctorId = doctorData.doctor.doctor_id;
      console.log(`\nFound doctor_id: ${doctorId}`);
      
      // Test 2: Get dashboard data
      console.log(`\n2. Testing GET /api/doctor/${doctorId}/dashboard`);
      const dashboardResponse = await fetch(`http://localhost:5000/api/doctor/${doctorId}/dashboard`);
      const dashboardData = await dashboardResponse.json();
      console.log('Dashboard data:', JSON.stringify(dashboardData, null, 2));
      
      // Test 3: Get today's appointments
      console.log(`\n3. Testing GET /api/doctor/${doctorId}/today`);
      const todayResponse = await fetch(`http://localhost:5000/api/doctor/${doctorId}/today`);
      const todayData = await todayResponse.json();
      console.log('Today\'s appointments:', JSON.stringify(todayData, null, 2));
      
      // Test 4: Get upcoming appointments
      console.log(`\n4. Testing GET /api/doctor/${doctorId}/upcoming`);
      const upcomingResponse = await fetch(`http://localhost:5000/api/doctor/${doctorId}/upcoming`);
      const upcomingData = await upcomingResponse.json();
      console.log('Upcoming appointments:', JSON.stringify(upcomingData, null, 2));
    }
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testAPI();
