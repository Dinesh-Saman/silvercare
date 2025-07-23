const pool = require('../db');

// Get family member details by user ID
const getFamilyMemberDetails = async (req, res) => {
  const { userId } = req.params;
  
  try {
    console.log('Fetching family member details for user ID:', userId);
    
    const result = await pool.query(`
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.phone,
        u.role,
        u.created_at,
        fm.family_id,
        fm.phone_fixed
      FROM "User" u
      INNER JOIN familymember fm ON u.user_id = fm.user_id
      WHERE u.user_id = $1 AND u.role = 'family_member'
    `, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Family member not found'
      });
    }
    
    const familyMember = result.rows[0];
    console.log('Family member details fetched successfully');
    
    res.json({
      success: true,
      familyMember: familyMember
    });
    
  } catch (err) {
    console.error('Error fetching family member details:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching family member details' 
    });
  }
};

// Update family member details
const updateFamilyMemberDetails = async (req, res) => {
  const { userId } = req.params;
  const { name, email, phone, phone_fixed } = req.body;
  
  try {
    console.log('Updating family member details for user ID:', userId);
    
    // Start transaction
    await pool.query('BEGIN');
    
    // Update User table
    const userUpdateResult = await pool.query(`
      UPDATE "User" 
      SET name = $1, email = $2, phone = $3
      WHERE user_id = $4 AND role = 'family_member'
      RETURNING user_id, name, email, phone, role, created_at
    `, [name, email, phone, userId]);
    
    if (userUpdateResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Family member not found'
      });
    }
    
    // Update familymember table
    const familyMemberUpdateResult = await pool.query(`
      UPDATE familymember 
      SET phone_fixed = $1
      WHERE user_id = $2
      RETURNING family_id, phone_fixed
    `, [phone_fixed, userId]);
    
    await pool.query('COMMIT');
    
    // Combine the results
    const updatedFamilyMember = {
      ...userUpdateResult.rows[0],
      family_id: familyMemberUpdateResult.rows[0].family_id,
      phone_fixed: familyMemberUpdateResult.rows[0].phone_fixed
    };
    
    console.log('Family member details updated successfully');
    
    res.json({
      success: true,
      message: 'Family member details updated successfully',
      familyMember: updatedFamilyMember
    });
    
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error updating family member details:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error updating family member details' 
    });
  }
};

module.exports = {
  getFamilyMemberDetails,
  updateFamilyMemberDetails
};
