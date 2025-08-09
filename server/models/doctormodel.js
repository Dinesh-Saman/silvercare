const pool = require('../db');

// Get all appointments for a specific doctor
const getAppointmentsByDoctorId = async (doctorId) => {
  try {
    const result = await pool.query(`
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
      WHERE a.doctor_id = $1)
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
      AND tb.expires_at > CURRENT_TIMESTAMP)
      ORDER BY date_time ASC
    `, [doctorId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching appointments by doctor ID:', error);
    throw error;
  }
};

// Get upcoming appointments for a specific doctor
const getUpcomingAppointmentsByDoctorId = async (doctorId) => {
  try {
    const result = await pool.query(`
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
    return result.rows;
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    throw error;
  }
};

// Get today's appointments for a specific doctor
const getTodaysAppointmentsByDoctorId = async (doctorId) => {
  try {
    const result = await pool.query(`
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
    return result.rows;
  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    throw error;
  }
};

// Get next appointment for a specific doctor
const getNextAppointmentByDoctorId = async (doctorId) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.appointment_id,
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
        e.profile_photo as elder_avatar
      FROM appointment a
      LEFT JOIN elder e ON a.elder_id = e.elder_id
      WHERE a.doctor_id = $1 
      AND a.date_time >= CURRENT_TIMESTAMP
      ORDER BY a.date_time ASC
      LIMIT 1
    `, [doctorId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching next appointment:', error);
    throw error;
  }
};

// Update appointment status
const updateAppointmentStatus = async (appointmentId, status, notes = null) => {
  try {
    const result = await pool.query(`
      UPDATE appointment 
      SET status = $1, notes = COALESCE($2, notes)
      WHERE appointment_id = $3
      RETURNING *
    `, [status, notes, appointmentId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};

// Get doctor information by user ID
const getDoctorByUserId = async (userId) => {
  try {
    console.log('Fetching doctor for user ID:', userId);
    
    const result = await pool.query(`
      SELECT 
        d.doctor_id,
        d.user_id,
        d.specialization,
        d.license_number,
        d.alternative_number,
        d.current_institution,
        d.years_experience,
        d.status,
        d.district,
        u.name,
        u.email,
        u.phone,
        u.role,
        u.created_at
      FROM doctor d
      JOIN "User" u ON d.user_id = u.user_id
      WHERE d.user_id = $1
    `, [userId]);
    
    console.log('Doctor query result:', result.rows);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching doctor by user ID:', error);
    console.error('Query parameters:', { userId });
    throw error;
  }
};

// Update doctor profile
const updateDoctorProfile = async (userId, profileData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Update User table
    const userUpdateQuery = `
      UPDATE "User" 
      SET name = $1, email = $2, phone = $3
      WHERE user_id = $4
      RETURNING *
    `;
    const userResult = await client.query(userUpdateQuery, [
      profileData.name,
      profileData.email,
      profileData.phone,
      userId
    ]);

    // Update Doctor table
    const doctorUpdateQuery = `
      UPDATE doctor 
      SET specialization = $1, alternative_number = $2, current_institution = $3, 
          years_experience = $4, district = $5
      WHERE user_id = $6
      RETURNING *
    `;
    const doctorResult = await client.query(doctorUpdateQuery, [
      profileData.specialization,
      profileData.alternative_number,
      profileData.current_institution,
      profileData.years_experience,
      profileData.district,
      userId
    ]);

    await client.query('COMMIT');
    
    // Return updated doctor profile
    return {
      ...doctorResult.rows[0],
      ...userResult.rows[0]
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating doctor profile:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Get family members who have appointments with this doctor
const getFamilyMembersWithAppointments = async (doctorId) => {
  try {
    console.log('Querying family members for doctor ID:', doctorId);
    
    const result = await pool.query(`
      SELECT DISTINCT
        fm.user_id,
        u.name as family_member_name,
        u.email as family_member_email,
        u.phone as family_member_phone,
        fm.address as family_member_address,
        fm.phone_fixed as family_member_fixed_phone,
        COUNT(DISTINCT e.elder_id) as elders_count,
        STRING_AGG(DISTINCT e.name, ', ') as elders_treated,
        COUNT(DISTINCT a.appointment_id) as total_appointments,
        COUNT(DISTINCT CASE WHEN a.status = 'confirmed' THEN a.appointment_id END) as confirmed_appointments,
        COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.appointment_id END) as completed_appointments,
        MAX(a.date_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Colombo') as latest_appointment_date
      FROM familymember fm
      JOIN "User" u ON fm.user_id = u.user_id
      JOIN elder e ON fm.family_id = e.family_id
      JOIN appointment a ON e.elder_id = a.elder_id
      WHERE a.doctor_id = $1 
        AND a.status IN ('confirmed', 'completed')
      GROUP BY fm.user_id, u.name, u.email, u.phone, fm.address, fm.phone_fixed
      ORDER BY latest_appointment_date DESC
    `, [doctorId]);
    
    console.log('Query result for doctor ID', doctorId, ':', result.rows.length, 'family members found');
    console.log('Family members data:', result.rows);
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching family members with appointments:', error);
    throw error;
  }
};

// Get appointment history between doctor and specific family member
const getAppointmentHistoryWithFamilyMember = async (doctorId, familyMemberId) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.appointment_id,
        a.date_time,
        a.status,
        a.notes,
        a.appointment_type,
        e.name as elder_name,
        e.medical_conditions,
        e.profile_photo as elder_avatar
      FROM appointment a
      JOIN elder e ON a.elder_id = e.elder_id
      JOIN familymember fm ON e.family_id = fm.family_id
      WHERE a.doctor_id = $1 
        AND fm.user_id = $2
        AND a.status IN ('confirmed', 'completed')
      ORDER BY a.date_time DESC
    `, [doctorId, familyMemberId]);
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching appointment history:', error);
    throw error;
  }
};

module.exports = {
  getAppointmentsByDoctorId,
  getUpcomingAppointmentsByDoctorId,
  getTodaysAppointmentsByDoctorId,
  getNextAppointmentByDoctorId,
  updateAppointmentStatus,
  getDoctorByUserId,
  updateDoctorProfile,
  getFamilyMembersWithAppointments,
  getAppointmentHistoryWithFamilyMember
};