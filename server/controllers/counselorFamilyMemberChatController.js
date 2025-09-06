const db = require('../db');

// Get family members that have appointments with the counselor
const getFamilyMembersWithAppointments = async (req, res) => {
  try {
    const { counselorId } = req.params;
    
    if (!counselorId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Counselor ID is required' 
      });
    }

    const query = `
      SELECT DISTINCT 
        fm.family_id,
        fm.user_id,
        fm.phone_fixed,
        u.name as family_member_name,
        u.email as family_member_email,
        u.phone as family_member_phone,
        u.created_at as family_member_registered_at,
        COUNT(ca.appointment_id) as total_appointments,
        COUNT(CASE WHEN ca.status = 'confirmed' THEN 1 END) as confirmed_appointments,
        COUNT(CASE WHEN ca.status = 'completed' THEN 1 END) as completed_appointments,
        MAX(ca.date_time) as latest_appointment_date
      FROM familymember fm
      JOIN "User" u ON fm.user_id = u.user_id
      JOIN counselor_appointment ca ON fm.family_id = ca.family_id
      WHERE ca.counselor_id = $1 
        AND ca.status IN ('confirmed', 'completed')
      GROUP BY fm.family_id, fm.user_id, fm.phone_fixed,
               u.name, u.email, u.phone, u.created_at
      ORDER BY latest_appointment_date DESC
    `;

    const result = await db.query(query, [counselorId]);

    console.log(`Found ${result.rows.length} family members for counselor ${counselorId}`);

    res.json({
      success: true,
      familyMembers: result.rows
    });

  } catch (error) {
    console.error('Error fetching family members for counselor:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch family members' 
    });
  }
};

// Get appointment history between counselor and family member
const getAppointmentHistoryWithFamilyMember = async (req, res) => {
  try {
    const { counselorId, familyMemberId } = req.params;
    
    if (!counselorId || !familyMemberId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Counselor ID and Family Member ID are required' 
      });
    }

    const query = `
      SELECT 
        ca.*,
        u.name as family_member_name,
        u.email as family_member_email
      FROM counselor_appointment ca
      JOIN familymember fm ON ca.family_id = fm.family_id
      JOIN "User" u ON fm.user_id = u.user_id
      WHERE ca.counselor_id = $1 
        AND fm.user_id = $2
        AND ca.status IN ('confirmed', 'completed')
      ORDER BY ca.date_time DESC
    `;

    const result = await db.query(query, [counselorId, familyMemberId]);

    console.log(`Found ${result.rows.length} appointments between counselor ${counselorId} and family member ${familyMemberId}`);

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
  getFamilyMembersWithAppointments,
  getAppointmentHistoryWithFamilyMember
};
