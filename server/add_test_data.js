const pool = require('./db');

async function addTestAppointments() {
  try {
    console.log('Adding test appointments for doctor_id 2...');
    
    // Add a future appointment in the appointment table
    console.log('\n1. Adding future appointment...');
    const futureAppointment = await pool.query(`
      INSERT INTO appointment (elder_id, family_id, doctor_id, date_time, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [1, 2, 2, '2025-07-21 10:00:00', 'confirmed', 'Regular consultation']);
    
    console.log('Added appointment:', futureAppointment.rows[0]);
    
    // Add today's appointment
    console.log('\n2. Adding today\'s appointment...');
    const todayAppointment = await pool.query(`
      INSERT INTO appointment (elder_id, family_id, doctor_id, date_time, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [1, 2, 2, '2025-07-20 15:00:00', 'confirmed', 'Today\'s consultation']);
    
    console.log('Added today\'s appointment:', todayAppointment.rows[0]);
    
    // Add a valid temporary booking with future expiry
    console.log('\n3. Adding valid temporary booking...');
    const futureExpiry = new Date();
    futureExpiry.setDate(futureExpiry.getDate() + 1); // Expires tomorrow
    
    const tempBooking = await pool.query(`
      INSERT INTO temporary_booking (
        elder_id, family_id, doctor_id, date_time, appointment_type, 
        patient_name, contact_number, symptoms, notes, emergency_contact, 
        preferred_platform, expires_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      16, 2, 2, '2025-07-22 11:00:00', 'online',
      'Test Patient', '0771234567', 'Test symptoms', 
      'Test booking', '0771234567', 'zoom', futureExpiry
    ]);
    
    console.log('Added temp booking:', tempBooking.rows[0]);
    
    // Test the queries again
    console.log('\n4. Testing queries after adding data...');
    
    // Test today's appointments
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
        tb.appointment_type
      FROM temporary_booking tb
      WHERE tb.doctor_id = $1 
      AND DATE(tb.date_time) = CURRENT_DATE
      AND tb.expires_at > CURRENT_TIMESTAMP)
      ORDER BY date_time ASC
    `, [2]);
    
    console.log('Today\'s appointments after update:', todayResult.rows);
    
    // Test upcoming appointments
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
        tb.appointment_type
      FROM temporary_booking tb
      WHERE tb.doctor_id = $1 AND tb.date_time >= CURRENT_TIMESTAMP
      AND tb.expires_at > CURRENT_TIMESTAMP)
      ORDER BY date_time ASC
    `, [2]);
    
    console.log('Upcoming appointments after update:', upcomingResult.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addTestAppointments();
