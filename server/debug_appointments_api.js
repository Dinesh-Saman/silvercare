const http = require('http');

// Test the appointments API
function testAppointmentsAPI(elderId = 3) {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/elders/${elderId}/appointments`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Response status:', res.statusCode);
      
      try {
        const result = JSON.parse(data);
        console.log('\nAPI Response:');
        console.log('Success:', result.success);
        console.log('Count:', result.count);
        
        if (result.appointments && result.appointments.length > 0) {
          console.log('\nFirst 3 appointments:');
          result.appointments.slice(0, 3).forEach((apt, i) => {
            const appointmentDate = new Date(apt.date_time);
            const now = new Date();
            const isUpcoming = appointmentDate > now && apt.status !== 'cancelled';
            
            console.log(`\n${i + 1}. Appointment ${apt.appointment_id}:`);
            console.log(`   Provider: ${apt.provider_name} (${apt.provider_type})`);
            console.log(`   Date: ${apt.date_time}`);
            console.log(`   Status: ${apt.status}`);
            console.log(`   Type: ${apt.appointment_type}`);
            console.log(`   Is Upcoming: ${isUpcoming}`);
            console.log(`   Specialization: ${apt.specialization}`);
          });
          
          // Count upcoming appointments
          const upcomingCount = result.appointments.filter(apt => {
            const appointmentDate = new Date(apt.date_time);
            const now = new Date();
            return appointmentDate > now && apt.status !== 'cancelled';
          }).length;
          
          console.log(`\nUpcoming appointments count: ${upcomingCount}`);
          
        } else {
          console.log('No appointments found');
        }
      } catch (error) {
        console.error('Error parsing JSON:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request error:', error.message);
  });

  req.end();
}

// Test multiple elder IDs
console.log('Testing Elder ID 1:');
console.log('==================');
testAppointmentsAPI(1);

setTimeout(() => {
  console.log('\n\nTesting Elder ID 29:');
  console.log('===================');
  testAppointmentsAPI(29);
}, 1000);