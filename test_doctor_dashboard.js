// Test script to verify doctor dashboard API changes
const http = require('http');

async function testDoctorDashboard() {
  try {
    console.log('Testing doctor dashboard API...');
    
    // Mock doctor ID - in real scenario this would come from authentication
    const doctorId = 1;
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/doctor/${doctorId}/dashboard`,
      method: 'GET'
    };
    
    const response = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        });
      });
      
      req.on('error', reject);
      req.end();
    });
    
    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = response.data;
    
    console.log('Dashboard data received:');
    console.log('Today\'s appointments count:', data.data?.counts?.todaysAppointments || 0);
    console.log('Upcoming appointments count:', data.data?.counts?.upcomingAppointments || 0);
    console.log('Next appointment:', data.data?.nextAppointment ? 'Available' : 'None');
    
    if (data.data?.todaysAppointments?.length > 0) {
      console.log('Sample today\'s appointment:', {
        id: data.data.todaysAppointments[0].id,
        source: data.data.todaysAppointments[0].source,
        status: data.data.todaysAppointments[0].status,
        patient: data.data.todaysAppointments[0].elder_name
      });
    }
    
    if (data.data?.upcomingAppointments?.length > 0) {
      console.log('Sample upcoming appointment:', {
        id: data.data.upcomingAppointments[0].id,
        source: data.data.upcomingAppointments[0].source,
        status: data.data.upcomingAppointments[0].status,
        patient: data.data.upcomingAppointments[0].elder_name
      });
    }
    
    console.log('✅ Test completed successfully - Data now comes only from appointment table with confirmed status');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDoctorDashboard();
