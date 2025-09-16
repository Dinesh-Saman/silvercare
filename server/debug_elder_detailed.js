const http = require('http');

// Test the appointments API with detailed analysis
function debugAppointmentsData(elderId = 1) {
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
      try {
        const result = JSON.parse(data);
        console.log(`\n=== Elder ID ${elderId} Appointments Debug ===`);
        console.log('API Response Success:', result.success);
        console.log('Total Count:', result.count);
        
        if (result.appointments && result.appointments.length > 0) {
          // Detailed analysis of each appointment
          const now = new Date();
          console.log(`\nCurrent time: ${now.toISOString()}`);
          console.log(`Current time (local): ${now.toString()}`);
          
          let upcomingCount = 0;
          let pastCount = 0;
          let cancelledCount = 0;
          let nullDateCount = 0;
          let invalidDateCount = 0;
          
          console.log('\nDetailed Appointment Analysis:');
          result.appointments.forEach((apt, i) => {
            if (!apt.date_time) {
              nullDateCount++;
              console.log(`${i + 1}. NULL DATE - Appointment ${apt.appointment_id}: status=${apt.status}`);
              return;
            }
            
            const aptDate = new Date(apt.date_time);
            
            if (isNaN(aptDate.getTime())) {
              invalidDateCount++;
              console.log(`${i + 1}. INVALID DATE - Appointment ${apt.appointment_id}: date_time="${apt.date_time}"`);
              return;
            }
            
            const isUpcoming = aptDate > now && apt.status !== 'cancelled';
            const isPast = aptDate < now || apt.status === 'completed';
            const isCancelled = apt.status === 'cancelled';
            
            if (isUpcoming) upcomingCount++;
            else if (isCancelled) cancelledCount++;
            else pastCount++;
            
            if (i < 5 || isUpcoming) { // Show first 5 and all upcoming
              console.log(`${i + 1}. Appointment ${apt.appointment_id}:`);
              console.log(`   Date: ${apt.date_time}`);
              console.log(`   Parsed: ${aptDate.toISOString()}`);
              console.log(`   Status: ${apt.status}`);
              console.log(`   Provider: ${apt.provider_name} (${apt.provider_type})`);
              console.log(`   Is Future: ${aptDate > now}`);
              console.log(`   Is Not Cancelled: ${apt.status !== 'cancelled'}`);
              console.log(`   Is Upcoming: ${isUpcoming}`);
              console.log('');
            }
          });
          
          console.log('\nSummary:');
          console.log(`Total appointments: ${result.appointments.length}`);
          console.log(`Upcoming (calculated): ${upcomingCount}`);
          console.log(`Past appointments: ${pastCount}`);
          console.log(`Cancelled appointments: ${cancelledCount}`);
          console.log(`Null dates: ${nullDateCount}`);
          console.log(`Invalid dates: ${invalidDateCount}`);
          
          // Test the exact logic from frontend
          const frontendUpcomingCount = result.appointments.filter(apt => {
            if (!apt.date_time) return false;
            const aptDate = new Date(apt.date_time);
            const now2 = new Date();
            return aptDate > now2 && apt.status !== 'cancelled';
          }).length;
          
          console.log(`Frontend logic result: ${frontendUpcomingCount}`);
          
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

// Test Elder ID 3 (anura samarasinghe with 4 upcoming appointments)
debugAppointmentsData(3);