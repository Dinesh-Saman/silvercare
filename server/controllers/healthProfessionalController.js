const pool = require('../db');

// Get health professional by user ID
exports.getByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    console.log('Fetching health professional for user ID:', userId);

    const result = await pool.query(
      `
      SELECT 
        c.user_id,
        u.name,
        u.email,
        u.phone,
        c.specialization,
        c.license_number,
        c.alternative_number,
        c.current_institution,
        c.proof,
        c.years_of_experience,
        c.status,
        c.district,
        u.created_at
      FROM counselor c
      INNER JOIN "User" u ON c.user_id = u.user_id
      WHERE c.user_id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Health professional not found' });
    }

    const hp = {
      user_id: result.rows[0].user_id,
      name: result.rows[0].name,
      email: result.rows[0].email,
      phone: result.rows[0].phone,
      specialization: result.rows[0].specialization,
      license_number: result.rows[0].license_number,
      alternative_number: result.rows[0].alternative_number,
      current_institution: result.rows[0].current_institution,
      proof: result.rows[0].proof,
      years_experience: result.rows[0].years_of_experience,
      status: result.rows[0].status,
      district: result.rows[0].district,
      created_at: result.rows[0].created_at
    };

    res.json({ healthprofessional: hp });
  } catch (err) {
    console.error('Error fetching health professional:', err);
    res.status(500).json({ error: 'Server error while fetching health professional' });
  }
};

// Get all elders assigned to a specific counselor
exports.getAssignedEldersForCounselor = async (req, res) => {
  const { counselorId } = req.params;
  const { status } = req.query; // Optional filter for appointment status (e.g., 'confirmed')
  console.log("cccccccccccccccc ",counselorId);
  try {
    console.log('Fetching assigned elders for counselor:', counselorId, 'with status:', status);

    // Query to get unique elders assigned to the counselor through counselor_appointment
    let query = `
      SELECT DISTINCT
        e.elder_id,
        e.family_id,
        e.name as elder_name,
        e.dob,
        e.gender,
        e.contact,
        e.address,
        e.nic,
        e.medical_conditions,
        e.profile_photo,
        e.email as elder_email,
        e.created_at as elder_created_at,
        e.district,
        e.age,
        u.user_id,
        u.name as user_name,
        u.phone as user_phone,
        u.role,
        u.created_at as user_created_at
      FROM elder e
      INNER JOIN "User" u ON LOWER(e.email) = LOWER(u.email)
      INNER JOIN counselor_appointment ca ON e.elder_id = ca.elder_id
      WHERE ca.counselor_id = $1
    `;

    const queryParams = [counselorId];
    let paramCount = 1;

    // Apply status filter if provided
    if (status) {
      paramCount++;
      query += ` AND ca.status = $${paramCount}`;
      queryParams.push(status);
    }

    query += ` ORDER BY e.created_at DESC`;

    const result = await pool.query(query, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No assigned elders found for this counselor'
      });
    }

    // Format response consistent with getElderDetails
    const elders = result.rows.map(elderData => ({
      elder_id: elderData.elder_id,
      family_id: elderData.family_id,
      name: elderData.elder_name,
      dob: elderData.dob,
      gender: elderData.gender,
      contact: elderData.contact,
      address: elderData.address,
      nic: elderData.nic,
      medical_conditions: elderData.medical_conditions,
      profile_photo: elderData.profile_photo,
      email: elderData.elder_email,
      district: elderData.district,
      age: elderData.age,
      user_details: {
        user_id: elderData.user_id,
        user_name: elderData.user_name,
        user_phone: elderData.user_phone,
        role: elderData.role,
        user_created_at: elderData.user_created_at,
      },
      created_at: elderData.elder_created_at
    }));

    res.json({
      success: true,
      elders,
      count: elders.length
    });
  } catch (err) {
    console.error('Error fetching assigned elders for counselor:', err);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching assigned elders'
    });
  }
};

exports.getSessionsForCounselor = async (req, res) => {
  const { counselorId } = req.params;
  const { status, limit = 10, offset = 0 } = req.query; // Optional filters for status, pagination

  try {
    console.log('Fetching appointments for counselor:', counselorId, 'with filters:', { status, limit, offset });

    // Query to get appointment details from counselor_appointment with additional fields
    let query = `
      SELECT 
        ca.appointment_id as session_id,
        ca.elder_id,
        ca.counselor_id,
        ca.family_id,
        ca.date_time,
        ca.status,
        ca.session_type,
        ca.notes,
        ca.session_duration,
        ca.patient_concerns,
        ca.created_at,
        ca.updated_at,
        ca.meeting_link,
        e.name as elder_name,
        e.contact as elder_contact,
        e.gender as elder_gender,
        e.dob as elder_dob,
        e.district as elder_district,
        e.medical_conditions,
        e.profile_photo as elder_photo,
        u.name as counselor_name,
        u.email as counselor_email,
        u.phone as counselor_phone,
        c.specialization,
        c.current_institution,
        c.district as counselor_district,
        c.years_of_experience,
        c.license_number
      FROM counselor_appointment ca
      INNER JOIN elder e ON ca.elder_id = e.elder_id
      INNER JOIN counselor c ON ca.counselor_id = c.counselor_id
      INNER JOIN "User" u ON c.user_id = u.user_id
      WHERE ca.counselor_id = $1
    `;

    const queryParams = [counselorId];
    let paramCount = 1;

    // Apply status filter if provided
    if (status) {
      paramCount++;
      query += ` AND ca.status = $${paramCount}`;
      queryParams.push(status);
    }

    query += ` ORDER BY ca.date_time DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, queryParams);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM counselor_appointment WHERE counselor_id = $1`;
    const countParams = [counselorId];
    let countParamCount = 1;

    if (status) {
      countParamCount++;
      countQuery += ` AND status = $${countParamCount}`;
      countParams.push(status);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      sessions: result.rows,
      count: result.rows.length,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < totalCount
      }
    });
  } catch (err) {
    console.error('Error fetching appointments for counselor:', err);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching appointments'
    });
  }
};

exports.getCounselorIdByUserId = async (req, res) => {
  const { userId } = req.params;
  
  try {
    console.log('Fetching counselor_id for user:', userId);

    const result = await pool.query(
      'SELECT counselor_id FROM counselor WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No counselor_id found for this user'
      });
    }

    res.json({
      success: true,
      counselor_id: result.rows[0].counselor_id
    });

  } catch (err) {
    console.error('Error fetching counselor_id:', err);
    res.status(500).json({
      success: false,
      error: 'Error fetching counselor_id'
    });
  }
};