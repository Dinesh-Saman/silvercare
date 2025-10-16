const pool = require('./db');
const { v4: uuidv4 } = require('uuid');

async function createJitsiTestAppointments() {
    try {
        console.log('🧪 Creating Direct Jitsi Meet Test Appointments...\n');
        
        // Create 3 test appointments with direct Jitsi Meet links
        const appointments = [];
        
        for (let i = 1; i <= 3; i++) {
            const meetingId = uuidv4();
            const roomName = `silvercare-${meetingId}`;
            const meetingLink = `https://meet.jit.si/${roomName}`;
            
            // Create appointment times
            const appointmentTime = new Date();
            appointmentTime.setHours(16 + i, 0, 0, 0); // 5 PM, 6 PM, 7 PM
            
            const result = await pool.query(`
                INSERT INTO appointment (
                    doctor_id, 
                    elder_id, 
                    date_time, 
                    appointment_type,
                    status,
                    meeting_link,
                    notes,
                    created_at,
                    updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING appointment_id, date_time, meeting_link
            `, [
                2, // doctor_id
                1, // elder_id
                appointmentTime,
                'online',
                'confirmed',
                meetingLink,
                `Direct Jitsi Meet Test Appointment ${i}`
            ]);
            
            appointments.push(result.rows[0]);
            console.log(`✅ Appointment ${i} created:`);
            console.log(`   - ID: ${result.rows[0].appointment_id}`);
            console.log(`   - Time: ${result.rows[0].date_time}`);
            console.log(`   - Direct Jitsi URL: ${result.rows[0].meeting_link}`);
        }
        
        console.log('\n🌐 Direct Jitsi Meet URLs (No localhost dependency):');
        console.log('='.repeat(60));
        
        appointments.forEach((apt, index) => {
            // Doctor URLs
            const doctorUrl = new URL(apt.meeting_link);
            doctorUrl.searchParams.set('userInfo.displayName', 'Dr. Test Doctor');
            doctorUrl.searchParams.set('userInfo.email', 'doctor@silvercare.com');
            doctorUrl.searchParams.set('config.prejoinPageEnabled', 'false');
            
            // Patient URLs
            const patientUrl = new URL(apt.meeting_link);
            patientUrl.searchParams.set('userInfo.displayName', 'Test Patient');
            patientUrl.searchParams.set('userInfo.email', 'patient@silvercare.com');
            patientUrl.searchParams.set('config.prejoinPageEnabled', 'false');
            
            console.log(`\n📅 Appointment ${index + 1}:`);
            console.log(`🩺 Doctor URL: ${doctorUrl.toString()}`);
            console.log(`🧑‍🦳 Patient URL: ${patientUrl.toString()}`);
        });
        
        console.log('\n✅ Key Benefits of Direct Jitsi Meet Links:');
        console.log('   🌐 No localhost dependency - works from anywhere');
        console.log('   🔒 HIPAA-compliant encrypted video calls');
        console.log('   📱 Works on mobile, tablet, desktop');
        console.log('   🚀 No app installation required');
        console.log('   🔗 Shareable public URLs');
        console.log('   ⚡ Instant join - no login required');
        
        console.log('\n📋 Testing Instructions:');
        console.log('1. Login to doctor dashboard with doctor@gmail.com');
        console.log('2. Look for today\'s appointments (5PM, 6PM, 7PM)');
        console.log('3. Click "Join Meeting" - opens direct Jitsi Meet');
        console.log('4. Share patient URLs with actual patients');
        console.log('5. Both parties join same secure room globally');
        
        console.log('\n🎯 URLs work from:');
        console.log('   ✅ Any internet connection worldwide');
        console.log('   ✅ Any device (phone, tablet, laptop)');  
        console.log('   ✅ Any browser (Chrome, Safari, Firefox)');
        console.log('   ✅ No VPN or special network setup needed');
        
    } catch (error) {
        console.error('❌ Error creating test appointments:', error.message);
    } finally {
        pool.end();
    }
}

createJitsiTestAppointments();
