const pool = require('./db');

pool.query(`
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
    ) VALUES (
        2, 
        1, 
        NOW() + INTERVAL '2 hours', 
        'online', 
        'confirmed',
        'http://localhost:3001/jitsi-meeting/test-room-123',
        'Test online consultation for doctor@gmail.com',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING appointment_id, date_time, meeting_link
`).then(result => {
    console.log('✅ Test appointment created successfully!');
    console.log('Appointment ID:', result.rows[0].appointment_id);
    console.log('Meeting Link:', result.rows[0].meeting_link);
    console.log('Time:', result.rows[0].date_time);
    
    const doctorUrl = `${result.rows[0].meeting_link}?role=doctor&name=Dr.%20Test`;
    const patientUrl = `${result.rows[0].meeting_link}?role=patient&name=Test%20Patient`;
    
    console.log('\nDoctor URL:', doctorUrl);
    console.log('Patient URL:', patientUrl);
    
    console.log('\n📋 Instructions:');
    console.log('1. Login to doctor dashboard with doctor@gmail.com');
    console.log('2. Look for the test appointment in 2 hours');
    console.log('3. Click "Join Meeting" button');
    console.log('4. Should open Jitsi Meet');
    
    pool.end();
}).catch(err => {
    console.error('Error:', err.message);
    pool.end();
});
