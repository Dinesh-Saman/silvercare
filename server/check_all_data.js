const pool = require('./db');

async function checkAllAppointments() {
  try {
    console.log('🔍 Checking all appointments in the database...\n');
    
    // Check appointment table
    console.log('=== APPOINTMENT TABLE ===');
    const appointments = await pool.query(`
      SELECT 
        a.appointment_id, 
        a.elder_id, 
        a.doctor_id, 
        a.date_time, 
        a.status, 
        a.appointment_type,
        e.name as elder_name,
        d.name as doctor_name
      FROM appointment a
      LEFT JOIN elder e ON a.elder_id = e.elder_id
      LEFT JOIN doctor doc ON a.doctor_id = doc.doctor_id
      LEFT JOIN "User" d ON doc.user_id = d.user_id
      ORDER BY a.date_time DESC
      LIMIT 10
    `);
    
    appointments.rows.forEach(apt => {
      console.log(`ID: ${apt.appointment_id}, Doctor: ${apt.doctor_name} (${apt.doctor_id}), Patient: ${apt.elder_name}, Type: ${apt.appointment_type}, Status: ${apt.status}, Date: ${apt.date_time}`);
    });
    
    // Check temporary_booking table
    console.log('\n=== TEMPORARY_BOOKING TABLE ===');
    const tempBookings = await pool.query(`
      SELECT 
        tb.temp_booking_id,
        tb.elder_id,
        tb.doctor_id,
        tb.date_time,
        tb.appointment_type,
        tb.patient_name,
        tb.expires_at,
        d.name as doctor_name
      FROM temporary_booking tb
      LEFT JOIN doctor doc ON tb.doctor_id = doc.doctor_id
      LEFT JOIN "User" d ON doc.user_id = d.user_id
      WHERE tb.expires_at > CURRENT_TIMESTAMP
      ORDER BY tb.date_time DESC
    `);
    
    tempBookings.rows.forEach(apt => {
      console.log(`Temp ID: ${apt.temp_booking_id}, Doctor: ${apt.doctor_name} (${apt.doctor_id}), Patient: ${apt.patient_name}, Type: ${apt.appointment_type}, Date: ${apt.date_time}, Expires: ${apt.expires_at}`);
    });
    
    // Check doctors
    console.log('\n=== DOCTORS ===');
    const doctors = await pool.query(`
      SELECT 
        d.doctor_id,
        u.name,
        u.user_id
      FROM doctor d
      JOIN "User" u ON d.user_id = u.user_id
    `);
    
    doctors.rows.forEach(doc => {
      console.log(`Doctor ID: ${doc.doctor_id}, Name: ${doc.name}, User ID: ${doc.user_id}`);
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAllAppointments();
