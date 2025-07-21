const pool = require('../db');

// Get care assignments for an elder by week
const getCareAssignmentsByWeek = async (req, res) => {
  const { elderId } = req.params;
  const { startDate } = req.query; // Optional: specific week start date
  
  try {
    console.log('Fetching care assignments for elder:', elderId);
    
    // Calculate week start and end dates using Sri Lanka timezone
    let weekStart;
    if (startDate) {
      weekStart = new Date(startDate);
    } else {
      // Default to current week in Sri Lanka timezone
      const now = new Date();
      // Since we're already in Sri Lanka timezone due to process.env.TZ setting
      weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    }
    
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
    weekEnd.setHours(23, 59, 59, 999);
    
    console.log('Week range:', weekStart, 'to', weekEnd);
    console.log('Current time in Sri Lanka:', new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' }));
    
    // Get care assignments for the week
    const result = await pool.query(`
      SELECT 
        cr.request_id,
        cr.caregiver_id,
        cr.elder_id,
        cr.start_date,
        cr.end_date,
        cr.status,
        cr.duration,
        u.name as caregiver_name,
        u.email as caregiver_email,
        u.phone as caregiver_phone,
        c.certifications,
        c.fixed_line as caregiver_fixed_line,
        c.district as caregiver_district,
        c.availability
      FROM carerequest cr
      INNER JOIN caregiver c ON cr.caregiver_id = c.caregiver_id
      INNER JOIN "User" u ON c.user_id = u.user_id
      WHERE cr.elder_id = $3 
      AND cr.status IN ('approved', 'completed')
      AND (
        (cr.start_date <= $2 AND cr.end_date >= $1) OR
        (cr.start_date >= $1 AND cr.start_date <= $2) OR
        (cr.end_date >= $1 AND cr.end_date <= $2)
      )
      ORDER BY cr.start_date ASC
    `, [weekStart, weekEnd, elderId]);
    
    // Create daily assignments array for the week
    const dailyAssignments = [];
    
    // Get today's date in Sri Lanka timezone for proper comparison
    const today = new Date(); // Already in Sri Lanka timezone due to process.env.TZ
    const todayDateString = today.getFullYear() + '-' + 
                           String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                           String(today.getDate()).padStart(2, '0');
    
    console.log('Today in Sri Lanka:', todayDateString);
    console.log('Today day of week:', today.getDay()); // 0 = Sunday, 1 = Monday, etc.
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + i);
      
      const dayAssignments = result.rows.filter(assignment => {
        const assignmentStart = new Date(assignment.start_date);
        const assignmentEnd = new Date(assignment.end_date);
        
        return currentDate >= assignmentStart && currentDate <= assignmentEnd;
      });
      
      const currentDateString = currentDate.getFullYear() + '-' + 
                               String(currentDate.getMonth() + 1).padStart(2, '0') + '-' + 
                               String(currentDate.getDate()).padStart(2, '0');
      
      dailyAssignments.push({
        date: currentDateString,
        dayName: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
        isToday: currentDateString === todayDateString,
        assignments: dayAssignments
      });
      
      console.log(`Day ${i}: ${currentDateString} (${currentDate.toLocaleDateString('en-US', { weekday: 'long' })}), isToday: ${currentDateString === todayDateString}`);
    }
    
    res.json({
      success: true,
      weekStart: weekStart.getFullYear() + '-' + 
                String(weekStart.getMonth() + 1).padStart(2, '0') + '-' + 
                String(weekStart.getDate()).padStart(2, '0'),
      weekEnd: weekEnd.getFullYear() + '-' + 
              String(weekEnd.getMonth() + 1).padStart(2, '0') + '-' + 
              String(weekEnd.getDate()).padStart(2, '0'),
      dailyAssignments: dailyAssignments,
      totalAssignments: result.rows.length
    });
    
  } catch (err) {
    console.error('Error fetching care assignments:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching care assignments' 
    });
  }
};

// Get specific day care assignments for an elder
const getDayCareAssignments = async (req, res) => {
  const { elderId } = req.params;
  const { date } = req.query;
  
  try {
    console.log('Fetching care assignments for elder:', elderId, 'on date:', date);
    
    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Date parameter is required'
      });
    }
    
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const result = await pool.query(`
      SELECT 
        cr.request_id,
        cr.caregiver_id,
        cr.elder_id,
        cr.start_date,
        cr.end_date,
        cr.status,
        cr.duration,
        u.name as caregiver_name,
        u.email as caregiver_email,
        u.phone as caregiver_phone,
        c.certifications,
        c.fixed_line as caregiver_fixed_line,
        c.district as caregiver_district,
        c.availability,
        e.name as elder_name
      FROM carerequest cr
      INNER JOIN caregiver c ON cr.caregiver_id = c.caregiver_id
      INNER JOIN "User" u ON c.user_id = u.user_id
      INNER JOIN elder e ON cr.elder_id = e.elder_id
      WHERE cr.elder_id = $1 
      AND cr.status IN ('approved', 'completed')
      AND $2 >= cr.start_date 
      AND $2 <= cr.end_date
      ORDER BY cr.start_date ASC
    `, [elderId, targetDate]);
    
    res.json({
      success: true,
      date: date,
      assignments: result.rows,
      count: result.rows.length
    });
    
  } catch (err) {
    console.error('Error fetching day care assignments:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching day care assignments' 
    });
  }
};

// Get care assignment statistics for elder dashboard
const getCareAssignmentStats = async (req, res) => {
  const { elderId } = req.params;
  
  try {
    console.log('Fetching care assignment stats for elder:', elderId);
    
    // Get current week assignments
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    // Get this week's assignments
    const thisWeekResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM carerequest cr
      WHERE cr.elder_id = $3 
      AND cr.status IN ('approved', 'completed')
      AND (
        (cr.start_date <= $2 AND cr.end_date >= $1) OR
        (cr.start_date >= $1 AND cr.start_date <= $2)
      )
    `, [weekStart, weekEnd, elderId]);
    
    // Get total active assignments
    const activeResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM carerequest cr
      WHERE cr.elder_id = $1 
      AND cr.status = 'approved'
      AND cr.end_date >= CURRENT_DATE
    `, [elderId]);
    
    // Get assigned caregivers count
    const caregiversResult = await pool.query(`
      SELECT COUNT(DISTINCT cr.caregiver_id) as count
      FROM carerequest cr
      WHERE cr.elder_id = $1 
      AND cr.status IN ('approved', 'completed')
      AND cr.end_date >= CURRENT_DATE
    `, [elderId]);
    
    // Get pending requests count
    const pendingResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM carerequest cr
      WHERE cr.elder_id = $1 
      AND cr.status = 'pending'
    `, [elderId]);
    
    res.json({
      success: true,
      stats: {
        thisWeekAssignments: parseInt(thisWeekResult.rows[0].count),
        activeAssignments: parseInt(activeResult.rows[0].count),
        assignedCaregivers: parseInt(caregiversResult.rows[0].count),
        pendingRequests: parseInt(pendingResult.rows[0].count)
      }
    });
    
  } catch (err) {
    console.error('Error fetching care assignment stats:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching care assignment stats' 
    });
  }
};

module.exports = {
  getCareAssignmentsByWeek,
  getDayCareAssignments,
  getCareAssignmentStats
};
