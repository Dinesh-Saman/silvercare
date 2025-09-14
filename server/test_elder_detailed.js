const http = require('http');

// Test the appointments API with detailed analysis
function testAppointmentsDetailed(elderId) {
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
      console.log(`\nElders ${elderId} Detailed Analysis:`);
      console.log('===============================');
      
      try {
        const result = JSON.parse(data);
        
        if (result.appointments && result.appointments.length > 0) {
          const now = new Date();
          console.log('Current time:', now.toISOString());
          console.log('Current time (local):', now.toString());
          
          // Analyze all appointments
          const analysis = {
            total: result.appointments.length,
            upcoming: 0,
            past: 0,
            cancelled: 0,
            completed: 0,
            confirmed: 0,
            upcomingDetails: []
          };
          
          result.appointments.forEach(apt => {
            const appointmentDate = new Date(apt.date_time);
            const isUpcoming = appointmentDate > now && apt.status !== 'cancelled';
            
            if (isUpcoming) {
              analysis.upcoming++;
              analysis.upcomingDetails.push({
                id: apt.appointment_id,
                provider: apt.provider_name,
                type: apt.provider_type,
                date: apt.date_time,
                status: apt.status,
                minutesFromNow: Math.round((appointmentDate - now) / 60000)
              });
            } else if (appointmentDate < now) {
              analysis.past++;
            }
            
            if (apt.status === 'cancelled') analysis.cancelled++;
            if (apt.status === 'completed') analysis.completed++;
            if (apt.status === 'confirmed') analysis.confirmed++;
          });
          
          console.log('\nAppointment Analysis:');
          console.log('Total appointments:', analysis.total);
          console.log('Upcoming appointments:', analysis.upcoming);
          console.log('Past appointments:', analysis.past);
          console.log('Cancelled appointments:', analysis.cancelled);
          console.log('Completed appointments:', analysis.completed);
          console.log('Confirmed appointments:', analysis.confirmed);
          
          if (analysis.upcomingDetails.length > 0) {
            console.log('\nUpcoming Appointments Details:');
            analysis.upcomingDetails.forEach((apt, i) => {
              console.log(`${i + 1}. ID ${apt.id}: ${apt.provider} (${apt.type})`);
              console.log(`   Date: ${apt.date} (${apt.minutesFromNow > 0 ? `in ${apt.minutesFromNow} min` : `${Math.abs(apt.minutesFromNow)} min ago`})`);
              console.log(`   Status: ${apt.status}`);
            });
          } else {
            console.log('\nNo upcoming appointments found.');
          }
          
        } else {
          console.log('No appointments found for this elder.');
        }
        
      } catch (error) {
        console.error('Error parsing JSON:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request error:', error.message);
  });

  req.end();
}

// Test Elder ID 1 specifically
testAppointmentsDetailed(1);