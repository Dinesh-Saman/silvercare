const pool = require("../db");

// Get upcoming sessions for an elder (limited to 2 for dashboard)
const getUpcomingSessions = async (req, res) => {
  const { elderId } = req.params;
  const { limit } = req.query; // Add limit parameter for dashboard
  console.log("Fetching upcoming sessions for elder ID:", elderId);

  try {
    // Check if elder exists
    const elderCheck = await pool.query(
      "SELECT * FROM elder WHERE elder_id = $1",
      [elderId]
    );
    if (elderCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Elder not found"
      });
    }

    // Query to get upcoming sessions with counselor details
    const limitClause = limit ? `LIMIT ${parseInt(limit)}` : '';
    const upcomingSessionsResult = await pool.query(
      `
      SELECT 
        s.session_id,
        s.elder_id,
        s.family_id,
        s.counselor_id,
        s.date_time,
        s.session_notes,
        s.status,
        s.session_type,
        c.specialization,
        c.years_of_experience,
        c.current_institution,
        c.district as counselor_district,
        u.name as counselor_name,
        u.email as counselor_email,
        u.phone as counselor_phone
      FROM session s
      INNER JOIN counselor c ON s.counselor_id = c.counselor_id
      INNER JOIN "User" u ON c.user_id = u.user_id
      WHERE s.elder_id = $1 
      AND s.date_time > NOW()
      AND s.status IN ('confirmed','completed')
      AND s.status != 'cancelled'
      ORDER BY s.date_time ASC
      ${limitClause}
    `,
      [elderId]
    );

    console.log("Upcoming sessions found:", upcomingSessionsResult.rows.length);

    res.json({
      success: true,
      sessions: upcomingSessionsResult.rows,
      count: upcomingSessionsResult.rows.length
    });

  } catch (err) {
    console.error("Error fetching upcoming sessions:", err);
    res.status(500).json({
      success: false,
      error: "Server error while fetching upcoming sessions"
    });
  }
};

// Get past sessions for an elder (limited to 2 for dashboard)
const getPastSessions = async (req, res) => {
  const { elderId } = req.params;
  const { limit } = req.query; // Add limit parameter for dashboard
  console.log("Fetching past sessions for elder ID:", elderId);

  try {
    // Check if elder exists
    const elderCheck = await pool.query(
      "SELECT * FROM elder WHERE elder_id = $1",
      [elderId]
    );
    if (elderCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Elder not found"
      });
    }

    // Query to get past sessions with counselor details
    const limitClause = limit ? `LIMIT ${parseInt(limit)}` : '';
    const pastSessionsResult = await pool.query(
      `
      SELECT 
        s.session_id,
        s.elder_id,
        s.family_id,
        s.counselor_id,
        s.date_time,
        s.session_notes,
        s.status,
        s.session_type,
        c.specialization,
        c.years_of_experience,
        c.current_institution,
        c.district as counselor_district,
        u.name as counselor_name,
        u.email as counselor_email,
        u.phone as counselor_phone
      FROM session s
      INNER JOIN counselor c ON s.counselor_id = c.counselor_id
      INNER JOIN "User" u ON c.user_id = u.user_id
      WHERE s.elder_id = $1 
      AND (s.date_time <= NOW() OR s.status IN ('completed', 'cancelled'))
      ORDER BY s.date_time DESC
      ${limitClause}
    `,
      [elderId]
    );

    console.log("Past sessions found:", pastSessionsResult.rows.length);

    res.json({
      success: true,
      sessions: pastSessionsResult.rows,
      count: pastSessionsResult.rows.length
    });

  } catch (err) {
    console.error("Error fetching past sessions:", err);
    res.status(500).json({
      success: false,
      error: "Server error while fetching past sessions"
    });
  }
};

// Get all sessions for an elder
const getAllSessions = async (req, res) => {
  const { elderId } = req.params;
  console.log("Fetching all sessions for elder ID:", elderId);

  try {
    // Check if elder exists
    const elderCheck = await pool.query(
      "SELECT * FROM elder WHERE elder_id = $1",
      [elderId]
    );
    if (elderCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Elder not found"
      });
    }

    // Query to get all sessions with counselor details
    const allSessionsResult = await pool.query(
      `
      SELECT 
        s.session_id,
        s.elder_id,
        s.family_id,
        s.counselor_id,
        s.date_time,
        s.session_notes,
        s.status,
        s.session_type,
        c.specialization,
        c.years_of_experience,
        c.current_institution,
        c.district as counselor_district,
        u.name as counselor_name,
        u.email as counselor_email,
        u.phone as counselor_phone
      FROM session s
      INNER JOIN counselor c ON s.counselor_id = c.counselor_id
      INNER JOIN "User" u ON c.user_id = u.user_id
      WHERE s.elder_id = $1 
      ORDER BY s.date_time DESC
    `,
      [elderId]
    );

    console.log("All sessions found:", allSessionsResult.rows.length);

    res.json({
      success: true,
      sessions: allSessionsResult.rows,
      count: allSessionsResult.rows.length
    });

  } catch (err) {
    console.error("Error fetching all sessions:", err);
    res.status(500).json({
      success: false,
      error: "Server error while fetching sessions"
    });
  }
};

// Get specific session by ID
const getSessionById = async (req, res) => {
  const { elderId, sessionId } = req.params;
  console.log("Fetching session details for elder ID:", elderId, "session ID:", sessionId);

  try {
    const sessionResult = await pool.query(
      `
      SELECT 
        s.session_id,
        s.elder_id,
        s.family_id,
        s.counselor_id,
        s.date_time,
        s.session_notes,
        s.status,
        s.session_type,
        c.specialization,
        c.years_of_experience,
        c.current_institution,
        c.district as counselor_district,
        u.name as counselor_name,
        u.email as counselor_email,
        u.phone as counselor_phone
      FROM session s
      INNER JOIN counselor c ON s.counselor_id = c.counselor_id
      INNER JOIN "User" u ON c.user_id = u.user_id
      WHERE s.elder_id = $1 AND s.session_id = $2
    `,
      [elderId, sessionId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Session not found"
      });
    }

    console.log("Session found:", sessionResult.rows[0]);

    res.json({
      success: true,
      session: sessionResult.rows[0]
    });

  } catch (err) {
    console.error("Error fetching session by ID:", err);
    res.status(500).json({
      success: false,
      error: "Server error while fetching session details"
    });
  }
};

// Join session (for online sessions)
const joinSession = async (req, res) => {
  const { elderId, sessionId } = req.params;

  console.log("Joining session for elder ID:", elderId, "session ID:", sessionId);

  try {
    // Check if session exists and belongs to the elder
    const sessionCheck = await pool.query(
      `
      SELECT 
        s.*,
        u.name as counselor_name
      FROM session s
      INNER JOIN counselor c ON s.counselor_id = c.counselor_id
      INNER JOIN "User" u ON c.user_id = u.user_id
      WHERE s.session_id = $1 AND s.elder_id = $2
    `,
      [sessionId, elderId]
    );

    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Session not found"
      });
    }

    const session = sessionCheck.rows[0];

    // Check if session is online
    if (session.session_type !== 'online') {
      return res.status(400).json({
        success: false,
        error: "Only online sessions can be joined"
      });
    }

    // Check if session is scheduled for today or is starting soon
    const sessionTime = new Date(session.date_time);
    const now = new Date();
    const timeDiff = sessionTime.getTime() - now.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    // Allow joining 15 minutes before the session starts
    if (minutesDiff > 15) {
      return res.status(400).json({
        success: false,
        error: "Session can only be joined 15 minutes before the scheduled time"
      });
    }

    // Generate meeting URL (in a real app, this would integrate with video conferencing service)
    const meetingUrl = `https://meet.silvercare.com/session/${sessionId}?elder=${elderId}&counselor=${session.counselor_id}`;

    console.log("Session join successful, meeting URL generated");

    res.json({
      success: true,
      message: "Session joined successfully",
      meetingUrl: meetingUrl,
      session: {
        session_id: session.session_id,
        counselor_name: session.counselor_name,
        date_time: session.date_time,
        session_type: session.session_type
      }
    });

  } catch (err) {
    console.error("Error joining session:", err);
    res.status(500).json({
      success: false,
      error: "Server error while joining session"
    });
  }
};

module.exports = {
  getUpcomingSessions,
  getPastSessions,
  getAllSessions,
  getSessionById,
  joinSession
};
