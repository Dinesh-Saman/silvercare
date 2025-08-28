console.log('🧪 Creating Test Cases for doctor@gmail.com...\n');

const pool = require('./db');

// Simple test case creation
async function createTestCases() {
    console.log('Creating 3 test appointments with meeting links...');
    
    const appointments = [];
    
    for (let i = 1; i <= 3; i++) {
        const meetingId = `doctor-test-${i}-${Date.now()}`;
        const meetingLink = `http://localhost:3001/jitsi-meeting/${meetingId}`;
        
        // Create appointment for different times today
        const appointmentTime = new Date();
        appointmentTime.setHours(15 + i, 0, 0, 0); // 4 PM, 5 PM, 6 PM
        
        try {
            const result = await pool.query(`
                INSERT INTO appointment (
                    doctor_id, elder_id, date_time, appointment_type, status, meeting_link, notes
                ) VALUES (2, 1, $1, 'online', 'confirmed', $2, $3)
                RETURNING appointment_id, date_time, meeting_link
            `, [
                appointmentTime,
                meetingLink,
                `Test appointment ${i} for doctor@gmail.com testing`
            ]);
            
            appointments.push(result.rows[0]);
            console.log(`✅ Appointment ${i} created: ID ${result.rows[0].appointment_id}`);
            
        } catch (error) {
            console.log(`❌ Error creating appointment ${i}:`, error.message);
        }
    }
    
    console.log('\n📋 Test Summary:');
    console.log(`✅ Created ${appointments.length} test appointments`);
    console.log('✅ All have meeting links');
    console.log('✅ All have confirmed status');
    console.log('✅ All are online appointments');
    
    console.log('\n🎯 Testing Instructions:');
    console.log('1. Login to http://localhost:3001 with doctor@gmail.com');
    console.log('2. Go to doctor dashboard');
    console.log('3. Look for today\'s appointments');
    console.log('4. You should see 3 appointments with "Join Meeting" buttons');
    console.log('5. Click any "Join Meeting" button to test');
    
    appointments.forEach((apt, index) => {
        const doctorUrl = `${apt.meeting_link}?role=doctor&name=Dr.%20Test`;
        console.log(`\nAppointment ${index + 1} Doctor URL: ${doctorUrl}`);
    });
    
    pool.end();
}

createTestCases().catch(console.error);
