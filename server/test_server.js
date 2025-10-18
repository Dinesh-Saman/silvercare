const express = require('express');
const pool = require('./db');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Test endpoint for dashboard stats
app.get('/test/stats/:elderId', async (req, res) => {
  const { elderId } = req.params;
  console.log('Testing stats for elder:', elderId);
  
  try {
    // Check elder exists
    console.log('Step 1: Check elder exists...');
    const elderCheck = await pool.query(
      "SELECT * FROM elder WHERE elder_id = $1",
      [elderId]
    );
    if (elderCheck.rows.length === 0) {
      return res.status(404).json({ error: "Elder not found" });
    }
    console.log('✅ Elder found');

    // Get upcoming appointments
    console.log('Step 2: Get upcoming appointments...');
    const upcomingAppointmentsResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM appointment 
       WHERE elder_id = $1 
       AND date_time > NOW()
       AND status IN ('confirmed')
       AND status != 'cancelled'`,
      [elderId]
    );
    console.log('✅ Appointments:', upcomingAppointmentsResult.rows[0].count);

    // Get upcoming counselor appointments
    console.log('Step 3: Get upcoming counselor appointments...');
    const upcomingSessionsResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM counselor_appointment 
       WHERE elder_id = $1 
       AND date_time > NOW()
       AND status IN ('confirmed')
       AND status != 'cancelled'`,
      [elderId]
    );
    console.log('✅ Counselor appointments:', upcomingSessionsResult.rows[0].count);

    // Get campaigns with error handling
    console.log('Step 4: Get campaigns...');
    let upcomingCampaignsCount = 0;
    try {
      const campaignResult = await pool.query(
        `SELECT COUNT(*) as count
         FROM campaignbooking cb
         INNER JOIN campaignevent c ON cb.campaign_id = c.campaign_id
         WHERE cb.elder_id = $1 
         AND c.start_date > NOW()`,
        [elderId]
      );
      upcomingCampaignsCount = parseInt(campaignResult.rows[0].count) || 0;
      console.log('✅ Campaigns:', upcomingCampaignsCount);
    } catch (err) {
      console.log('⚠️ Campaigns error (using 0):', err.message);
      upcomingCampaignsCount = 0;
    }

    // Get caregivers
    console.log('Step 5: Get caregivers...');
    const caregiverResult = await pool.query(
      `SELECT COUNT(DISTINCT caregiver_id) as count
       FROM carelog 
       WHERE elder_id = $1`,
      [elderId]
    );
    console.log('✅ Caregivers:', caregiverResult.rows[0].count);

    const stats = {
      upcomingAppointments: parseInt(upcomingAppointmentsResult.rows[0].count) || 0,
      upcomingSessions: parseInt(upcomingSessionsResult.rows[0].count) || 0,
      upcomingCampaigns: upcomingCampaignsCount,
      assignedCaregivers: parseInt(caregiverResult.rows[0].count) || 0,
    };

    console.log('Final stats:', stats);
    res.json({ success: true, stats });

  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message,
      stack: err.stack 
    });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`\n✅ Test server running on http://localhost:${PORT}`);
  console.log(`Test with: http://localhost:${PORT}/test/stats/28\n`);
});
