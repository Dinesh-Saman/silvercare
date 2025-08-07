process.env.TZ = 'Asia/Colombo';
const pool = require('../db');

// Get doctors who have confirmed/completed appointments with family member's elders
const getDoctorsWithAppointments = async (req, res) => {
  const { userId } = req.params;
  
  try {
    console.log('Getting doctors with appointments for family member:', userId);
    
    // First, get the family_id from the familymember table using the user_id
    const familyMemberResult = await pool.query(
      'SELECT family_id FROM familymember WHERE user_id = $1',
      [userId]
    );

    if (familyMemberResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Family member not found'
      });
    }

    const family_id = familyMemberResult.rows[0].family_id;
    console.log('Found family_id:', family_id);

    // Get doctors who have at least one confirmed or completed appointment with this family
    const query = `
      SELECT DISTINCT
        d.doctor_id,
        d.user_id,
        d.specialization,
        d.license_number,
        d.current_institution,
        d.years_experience,
        d.district as doctor_district,
        u.name as doctor_name,
        u.email as doctor_email,
        u.phone as doctor_phone,
        u.created_at as doctor_registered_at,
        -- Count total appointments
        COUNT(a.appointment_id) as total_appointments,
        -- Count confirmed appointments
        COUNT(CASE WHEN a.status = 'confirmed' THEN 1 END) as confirmed_appointments,
        -- Count completed appointments
        COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
        -- Latest appointment date
        MAX(a.date_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Colombo') as latest_appointment_date,
        -- Get elder names they've treated
        STRING_AGG(DISTINCT e.name, ', ') as elders_treated
      FROM doctor d
      INNER JOIN "User" u ON d.user_id = u.user_id
      INNER JOIN appointment a ON d.doctor_id = a.doctor_id
      INNER JOIN elder e ON a.elder_id = e.elder_id
      WHERE a.family_id = $1 
      AND a.status IN ('confirmed', 'completed')
      AND d.status = 'confirmed'  -- Only approved doctors
      GROUP BY 
        d.doctor_id, 
        d.user_id, 
        d.specialization, 
        d.license_number, 
        d.current_institution, 
        d.years_experience, 
        d.district,
        u.name, 
        u.email, 
        u.phone, 
        u.created_at
      ORDER BY latest_appointment_date DESC
    `;

    console.log('Executing query to get doctors with appointments');
    const result = await pool.query(query, [family_id]);

    console.log(`Found ${result.rows.length} doctors with appointments`);

    res.json({
      success: true,
      doctors: result.rows,
      count: result.rows.length
    });

  } catch (err) {
    console.error('Error fetching doctors with appointments:', err);
    res.status(500).json({
      success: false,
      error: 'Error fetching doctors with appointments'
    });
  }
};

// Get appointment history between family member and specific doctor
const getAppointmentHistoryWithDoctor = async (req, res) => {
  const { userId, doctorId } = req.params;
  
  try {
    console.log('Getting appointment history for family member:', userId, 'and doctor:', doctorId);
    
    // First, get the family_id from the familymember table
    const familyMemberResult = await pool.query(
      'SELECT family_id FROM familymember WHERE user_id = $1',
      [userId]
    );

    if (familyMemberResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Family member not found'
      });
    }

    const family_id = familyMemberResult.rows[0].family_id;

    // Get appointment history with this doctor
    const query = `
      SELECT 
        a.appointment_id,
        a.elder_id,
        a.doctor_id,
        a.date_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Colombo' as date_time,
        a.status,
        a.notes,
        a.appointment_type,
        a.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Colombo' as created_at,
        a.updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Colombo' as updated_at,
        e.name as elder_name,
        e.contact as elder_contact,
        e.gender as elder_gender,
        e.dob as elder_dob,
        d.specialization,
        u.name as doctor_name,
        u.email as doctor_email,
        u.phone as doctor_phone
      FROM appointment a
      INNER JOIN elder e ON a.elder_id = e.elder_id
      INNER JOIN doctor d ON a.doctor_id = d.doctor_id
      INNER JOIN "User" u ON d.user_id = u.user_id
      WHERE a.family_id = $1 
      AND a.doctor_id = $2
      AND a.status IN ('confirmed', 'completed')
      ORDER BY a.date_time DESC
    `;

    const result = await pool.query(query, [family_id, doctorId]);

    console.log(`Found ${result.rows.length} appointments with doctor ${doctorId}`);

    res.json({
      success: true,
      appointments: result.rows,
      count: result.rows.length
    });

  } catch (err) {
    console.error('Error fetching appointment history with doctor:', err);
    res.status(500).json({
      success: false,
      error: 'Error fetching appointment history with doctor'
    });
  }
};

module.exports = {
  getDoctorsWithAppointments,
  getAppointmentHistoryWithDoctor
};