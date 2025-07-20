const pool = require('./db');

async function testQueries() {
  try {
    console.log('Testing doctor model queries directly...');
    
    const doctorId = 2;
    
    // Test today's appointments query
    console.log('\n1. Testing today\'s appointments query...');
    const todayResult = await pool.query(`
      (SELECT 
        a.appointment_id as id,
        'appointment' as source,
        a.elder_id,
        a.doctor_id,
        a.date_time,
        a.status,
        a.notes,
        e.name as elder_name,
        e.email as elder_email,
        e.dob as elder_dob,
        e.gender as elder_gender,
        e.contact as elder_contact,
        e.address as elder_address,
        e.medical_conditions,
        e.profile_photo as elder_avatar,
        'consultation' as appointment_type
      FROM appointment a
      LEFT JOIN elder e ON a.elder_id = e.elder_id
      WHERE a.doctor_id = $1 
      AND DATE(a.date_time) = CURRENT_DATE)
      UNION ALL
      (SELECT 
        tb.temp_booking_id as id,
        'temporary_booking' as source,
        tb.elder_id,
        tb.doctor_id,
        tb.date_time,
        'confirmed' as status,
        tb.notes,
        tb.patient_name as elder_name,
        null as elder_email,
        null as elder_dob,
        null as elder_gender,
        tb.contact_number as elder_contact,
        null as elder_address,
        tb.symptoms as medical_conditions,
        null as elder_avatar,
        tb.appointment_type
      FROM temporary_booking tb
      WHERE tb.doctor_id = $1 
      AND DATE(tb.date_time) = CURRENT_DATE
      AND tb.expires_at > CURRENT_TIMESTAMP)
      ORDER BY date_time ASC
    `, [doctorId]);
    
    console.log('Today\'s appointments result:', todayResult.rows);
    console.log('Current date:', new Date().toISOString().split('T')[0]);
    
    // Test upcoming appointments query
    console.log('\n2. Testing upcoming appointments query...');
    const upcomingResult = await pool.query(`
      (SELECT 
        a.appointment_id as id,
        'appointment' as source,
        a.elder_id,
        a.doctor_id,
        a.date_time,
        a.status,
        a.notes,
        e.name as elder_name,
        e.email as elder_email,
        e.dob as elder_dob,
        e.gender as elder_gender,
        e.contact as elder_contact,
        e.address as elder_address,
        e.medical_conditions,
        e.profile_photo as elder_avatar,
        'consultation' as appointment_type
      FROM appointment a
      LEFT JOIN elder e ON a.elder_id = e.elder_id
      WHERE a.doctor_id = $1 AND a.date_time >= CURRENT_TIMESTAMP)
      UNION ALL
      (SELECT 
        tb.temp_booking_id as id,
        'temporary_booking' as source,
        tb.elder_id,
        tb.doctor_id,
        tb.date_time,
        'confirmed' as status,
        tb.notes,
        tb.patient_name as elder_name,
        null as elder_email,
        null as elder_dob,
        null as elder_gender,
        tb.contact_number as elder_contact,
        null as elder_address,
        tb.symptoms as medical_conditions,
        null as elder_avatar,
        tb.appointment_type
      FROM temporary_booking tb
      WHERE tb.doctor_id = $1 AND tb.date_time >= CURRENT_TIMESTAMP
      AND tb.expires_at > CURRENT_TIMESTAMP)
      ORDER BY date_time ASC
    `, [doctorId]);
    
    console.log('Upcoming appointments result:', upcomingResult.rows);
    console.log('Current timestamp:', new Date().toISOString());
    
    // Let's also check what appointments exist for this doctor regardless of date
    console.log('\n3. All appointments for doctor_id 2...');
    const allAppointments = await pool.query('SELECT *, date_time, NOW() as current_time FROM appointment WHERE doctor_id = $1', [doctorId]);
    console.log('All appointments:', allAppointments.rows);
    
    console.log('\n4. All temp bookings for doctor_id 2...');
    const allTempBookings = await pool.query('SELECT *, date_time, expires_at, NOW() as current_time FROM temporary_booking WHERE doctor_id = $1', [doctorId]);
    console.log('All temp bookings:', allTempBookings.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testQueries();
