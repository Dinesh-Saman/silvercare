const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function debugFilteringIssue() {
  try {
    console.log('Debugging Elder ID 3 appointment filtering...');
    
    // Get the exact appointments for Elder ID 3
    const appointmentsQuery = `
      SELECT 
        a.appointment_id,
        a.elder_id,
        a.date_time,
        a.status,
        a.appointment_type,
        CASE 
          WHEN a.doctor_id IS NOT NULL THEN CONCAT(u_doc.name)
          WHEN a.counselor_id IS NOT NULL THEN u_couns.name
        END as provider_name,
        CASE 
          WHEN a.doctor_id IS NOT NULL THEN d.specialization
          WHEN a.counselor_id IS NOT NULL THEN c.specialization
        END as specialization,
        CASE 
          WHEN a.doctor_id IS NOT NULL THEN d.current_institution
          WHEN a.counselor_id IS NOT NULL THEN c.current_institution
        END as current_institution,
        CASE 
          WHEN a.doctor_id IS NOT NULL THEN 'doctor'
          WHEN a.counselor_id IS NOT NULL THEN 'healthcare_professional'
        END as provider_type
      FROM appointment a
      LEFT JOIN doctor d ON a.doctor_id = d.doctor_id
      LEFT JOIN "User" u_doc ON d.user_id = u_doc.user_id
      LEFT JOIN counselor c ON a.counselor_id = c.counselor_id
      LEFT JOIN "User" u_couns ON c.user_id = u_couns.user_id
      WHERE a.elder_id = 3
      ORDER BY a.date_time DESC
    `;
    
    const result = await pool.query(appointmentsQuery);
    console.log('\nAll appointments for Elder ID 3:');
    console.table(result.rows);
    
    // Now test the filtering logic
    const appointments = result.rows;
    const now = new Date();
    console.log(`\nCurrent time: ${now.toISOString()}`);
    
    // Test upcoming filter
    const upcomingFilter = appointments.filter((apt) => {
      const aptDate = new Date(apt.date_time);
      const isUpcoming = aptDate > now && apt.status !== "cancelled";
      console.log(`Appointment ${apt.appointment_id}: ${apt.date_time} > ${now.toISOString()} = ${aptDate > now}, status: ${apt.status}, upcoming: ${isUpcoming}`);
      return isUpcoming;
    });
    
    console.log('\nUpcoming appointments after filter:');
    console.table(upcomingFilter);
    
    // Test counter logic (same as in frontend)
    const counterLogic = appointments.filter(apt => {
      const aptDate = new Date(apt.date_time);
      return aptDate > now && apt.status !== "cancelled";
    });
    
    console.log(`\nCounter shows: ${counterLogic.length} upcoming appointments`);
    console.log(`Filter shows: ${upcomingFilter.length} upcoming appointments`);
    
    // Check if there are any null/undefined fields that might cause frontend issues
    console.log('\nChecking for potential frontend issues:');
    appointments.forEach(apt => {
      if (!apt.provider_name || apt.provider_name === null) {
        console.log(`⚠️  Appointment ${apt.appointment_id} has null/undefined provider_name`);
      }
      if (!apt.specialization || apt.specialization === null) {
        console.log(`⚠️  Appointment ${apt.appointment_id} has null/undefined specialization`);
      }
    });
    
  } catch (error) {
    console.error('Error in debugging:', error);
  } finally {
    await pool.end();
  }
}

debugFilteringIssue();