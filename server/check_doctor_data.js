const pool = require('./db');

async function checkData() {
  try {
    console.log('Checking if doctor exists...');
    const doctorResult = await pool.query('SELECT * FROM doctor WHERE doctor_id = $1', [2]);
    console.log('Doctor data:', doctorResult.rows);
    
    console.log('\nChecking appointments for doctor_id 2...');
    const appointmentResult = await pool.query('SELECT * FROM appointment WHERE doctor_id = $1', [2]);
    console.log('Appointments:', appointmentResult.rows);
    
    console.log('\nChecking temporary_booking for doctor_id 2...');
    const tempBookingResult = await pool.query('SELECT * FROM temporary_booking WHERE doctor_id = $1', [2]);
    console.log('Temporary bookings:', tempBookingResult.rows);
    
    console.log('\nChecking user with user_id 11...');
    const userResult = await pool.query('SELECT * FROM "User" WHERE user_id = $1', [11]);
    console.log('User data:', userResult.rows);
    
    console.log('\nChecking if user_id 11 is linked to doctor_id 2...');
    const linkResult = await pool.query('SELECT * FROM doctor WHERE user_id = $1', [11]);
    console.log('Doctor link data:', linkResult.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkData();
