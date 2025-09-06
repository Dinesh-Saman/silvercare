const db = require('../db');

// Get counselors that have appointments with the family member
const getCounselorsWithAppointments = async (req, res) => {
  try {
    const { userId } = req.params; // Get user_id from frontend
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    // First, get the actual family_id from the familymember table using the user_id
    const familyMemberResult = await db.query(
      'SELECT family_id FROM familymember WHERE user_id = $1',
      [userId]
    );
    
    if (familyMemberResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Family member not found'
      });
    }
    
    const actualFamilyId = familyMemberResult.rows[0].family_id;
    console.log('Found family_id:', actualFamilyId, 'for user_id:', userId);

    const query = `
      SELECT DISTINCT 
        c.counselor_id,
        c.user_id,
        c.specialization,
        c.license_number,
        c.alternative_number,
        c.years_of_experience,
        c.current_institution,
        c.district as counselor_district,
        u.name as counselor_name,
        u.email as counselor_email,
        u.phone as counselor_contact,
        u.created_at as counselor_registered_at,
        COUNT(ca.appointment_id) as total_appointments,
        COUNT(CASE WHEN ca.status = 'confirmed' THEN 1 END) as confirmed_appointments,
        COUNT(CASE WHEN ca.status = 'completed' THEN 1 END) as completed_appointments,
        MAX(ca.date_time) as latest_appointment_date
      FROM counselor c
      JOIN "User" u ON c.user_id = u.user_id
      JOIN counselor_appointment ca ON c.counselor_id = ca.counselor_id
      WHERE ca.family_id = $1 
        AND ca.status IN ('confirmed', 'completed')
        AND c.status = 'confirmed'
      GROUP BY c.counselor_id, c.user_id, c.specialization, c.license_number, 
               c.alternative_number, c.years_of_experience, c.current_institution, 
               c.district, u.name, u.email, u.phone, u.created_at
      ORDER BY latest_appointment_date DESC
    `;

    const result = await db.query(query, [actualFamilyId]);

    console.log(`Found ${result.rows.length} counselors for family member ${userId} (family_id: ${actualFamilyId})`);

    res.json({
      success: true,
      counselors: result.rows
    });

  } catch (error) {
    console.error('Error fetching counselors for family member:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch counselors' 
    });
  }
};

// Get appointment history between family member and counselor
const getAppointmentHistoryWithCounselor = async (req, res) => {
  try {
    const { userId, counselorId } = req.params; // Get user_id and counselorId from frontend
    
    if (!userId || !counselorId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and Counselor ID are required' 
      });
    }

    // First, get the actual family_id from the familymember table using the user_id
    const familyMemberResult = await db.query(
      'SELECT family_id FROM familymember WHERE user_id = $1',
      [userId]
    );
    
    if (familyMemberResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Family member not found'
      });
    }
    
    const actualFamilyId = familyMemberResult.rows[0].family_id;
    console.log('Found family_id:', actualFamilyId, 'for user_id:', userId);

    const query = `
      SELECT 
        ca.*,
        c.specialization,
        u.name as counselor_name,
        u.email as counselor_email
      FROM counselor_appointment ca
      JOIN counselor c ON ca.counselor_id = c.counselor_id
      JOIN "User" u ON c.user_id = u.user_id
      WHERE ca.family_id = $1 
        AND ca.counselor_id = $2
        AND ca.status IN ('confirmed', 'completed')
      ORDER BY ca.date_time DESC
    `;

    const result = await db.query(query, [actualFamilyId, counselorId]);

    console.log(`Found ${result.rows.length} appointments between family member ${userId} (family_id: ${actualFamilyId}) and counselor ${counselorId}`);

    res.json({
      success: true,
      appointments: result.rows
    });

  } catch (error) {
    console.error('Error fetching appointment history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch appointment history' 
    });
  }
};

module.exports = {
  getCounselorsWithAppointments,
  getAppointmentHistoryWithCounselor
};
