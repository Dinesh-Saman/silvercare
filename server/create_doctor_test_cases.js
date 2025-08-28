const pool = require('./db');
const { v4: uuidv4 } = require('uuid');

async function createDoctorTestCases() {
    try {
        console.log('🧪 Creating Test Cases for doctor@gmail.com\n');
        
        // First, let's find the doctor ID for doctor@gmail.com
        console.log('1. Finding doctor account...');
        const doctorUserResult = await pool.query(`
            SELECT u.user_id, u.name, u.email, d.doctor_id 
            FROM "User" u
            JOIN doctor d ON u.user_id = d.user_id
            WHERE u.email = 'doctor@gmail.com'
        `);
        
        if (doctorUserResult.rows.length === 0) {
            console.log('❌ Doctor with email doctor@gmail.com not found');
            return;
        }
        
        const doctor = doctorUserResult.rows[0];
        console.log(`✅ Found doctor: ${doctor.name} (ID: ${doctor.doctor_id})`);
        
        // Find some elders to create appointments with
        console.log('\n2. Finding available elders...');
        const eldersResult = await pool.query(`
            SELECT elder_id, name, email, contact 
            FROM elder 
            LIMIT 3
        `);
        
        if (eldersResult.rows.length === 0) {
            console.log('❌ No elders found in database');
            return;
        }
        
        console.log(`✅ Found ${eldersResult.rows.length} elders for testing`);
        eldersResult.rows.forEach((elder, index) => {
            console.log(`   ${index + 1}. ${elder.name} (ID: ${elder.elder_id})`);
        });
        
        // Create test appointments for the doctor
        console.log('\n3. Creating test appointments...');
        const testAppointments = [];
        
        for (let i = 0; i < eldersResult.rows.length; i++) {
            const elder = eldersResult.rows[i];
            
            // Create online appointment with meeting link
            const meetingId = uuidv4();
            const meetingLink = `http://localhost:3001/jitsi-meeting/${meetingId}`;
            
            // Different appointment times
            const appointmentTime = new Date();
            appointmentTime.setHours(appointmentTime.getHours() + (i + 1) * 2); // 2, 4, 6 hours from now
            
            const appointmentResult = await pool.query(`
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
                RETURNING *
            `, [
                doctor.doctor_id,
                elder.elder_id,
                appointmentTime,
                'online',
                'confirmed',
                meetingLink,
                `Test online consultation ${i + 1} for doctor testing`
            ]);
            
            testAppointments.push({
                appointment: appointmentResult.rows[0],
                elder: elder
            });
            
            console.log(`   ✅ Created appointment ${i + 1}:`);
            console.log(`      - Patient: ${elder.name}`);
            console.log(`      - Time: ${appointmentTime.toLocaleString()}`);
            console.log(`      - Meeting Link: ${meetingLink}`);
        }
        
        // Create one physical appointment (should not have meeting link)
        console.log('\n4. Creating physical appointment (no meeting link)...');
        const physicalAppointmentTime = new Date();
        physicalAppointmentTime.setHours(physicalAppointmentTime.getHours() + 8);
        
        const physicalAppointment = await pool.query(`
            INSERT INTO appointment (
                doctor_id,
                elder_id,
                date_time,
                appointment_type,
                status,
                notes,
                created_at,
                updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *
        `, [
            doctor.doctor_id,
            eldersResult.rows[0].elder_id,
            physicalAppointmentTime,
            'physical',
            'confirmed',
            'Physical consultation at clinic'
        ]);
        
        console.log(`   ✅ Created physical appointment:`);
        console.log(`      - Patient: ${eldersResult.rows[0].name}`);
        console.log(`      - Time: ${physicalAppointmentTime.toLocaleString()}`);
        console.log(`      - Type: Physical (no meeting link)`);
        
        // Generate doctor dashboard test URLs
        console.log('\n5. Generating test URLs for doctor dashboard...');
        console.log('\n🩺 Doctor Dashboard URLs:');
        testAppointments.forEach((test, index) => {
            const meetingUrl = new URL(test.appointment.meeting_link);
            meetingUrl.searchParams.set('role', 'doctor');
            meetingUrl.searchParams.set('name', encodeURIComponent(`Dr. ${doctor.name}`));
            
            console.log(`\n   Meeting ${index + 1} - Patient: ${test.elder.name}`);
            console.log(`   Doctor Join URL: ${meetingUrl.toString()}`);
        });
        
        // Generate patient test URLs
        console.log('\n🧑‍🦳 Patient Join URLs:');
        testAppointments.forEach((test, index) => {
            const meetingUrl = new URL(test.appointment.meeting_link);
            meetingUrl.searchParams.set('role', 'patient');
            meetingUrl.searchParams.set('name', encodeURIComponent(test.elder.name));
            
            console.log(`\n   Meeting ${index + 1} - Patient: ${test.elder.name}`);
            console.log(`   Patient Join URL: ${meetingUrl.toString()}`);
        });
        
        // Create test summary
        console.log('\n📋 Test Summary for doctor@gmail.com:');
        console.log('========================================');
        console.log(`✅ Doctor Account: ${doctor.name} (${doctor.email})`);
        console.log(`✅ Online Appointments Created: ${testAppointments.length}`);
        console.log(`✅ Physical Appointments Created: 1`);
        console.log(`✅ Meeting Links Generated: ${testAppointments.length}`);
        console.log(`✅ All appointments have 'confirmed' status`);
        console.log(`✅ Appointment times spread over next 8 hours`);
        
        console.log('\n🧪 Test Instructions:');
        console.log('1. Login to doctor dashboard with doctor@gmail.com');
        console.log('2. Navigate to appointments section');
        console.log('3. Look for "Join Meeting" buttons on online appointments');
        console.log('4. Click "Join Meeting" - should open Jitsi Meet with doctor role');
        console.log('5. Physical appointments should NOT have join meeting buttons');
        console.log('6. Test patient side by using patient join URLs above');
        
        console.log('\n🔍 Verification Queries:');
        console.log('Run these to verify data:');
        console.log(`
        -- Check doctor's appointments
        SELECT 
            a.appointment_id,
            a.appointment_type,
            a.status,
            a.date_time,
            a.meeting_link,
            e.name as patient_name
        FROM appointment a
        JOIN elder e ON a.elder_id = e.elder_id
        WHERE a.doctor_id = ${doctor.doctor_id}
        ORDER BY a.date_time;
        `);
        
    } catch (error) {
        console.error('❌ Error creating test cases:', error);
    } finally {
        pool.end();
    }
}

createDoctorTestCases();
