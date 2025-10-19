const pool = require('./db');

async function testDashboardStats() {
  try {
    const elderId = 28;
    
    console.log('Testing dashboard stats queries for elder', elderId, '\n');
    
    // Check if elder exists
    console.log('1. Checking if elder exists...');
    const elderCheck = await pool.query(
      "SELECT * FROM elder WHERE elder_id = $1",
      [elderId]
    );
    console.log('   Elder found:', elderCheck.rows.length > 0);
    if (elderCheck.rows.length > 0) {
      console.log('   Elder:', elderCheck.rows[0].name, elderCheck.rows[0].email);
    }
    console.log('');
    
    // Get upcoming appointments count
    console.log('2. Checking upcoming appointments...');
    const upcomingAppointmentsResult = await pool.query(
      `
      SELECT COUNT(*) as count
      FROM appointment 
      WHERE elder_id = $1 
      AND date_time > NOW()
      AND status IN ('confirmed')
      AND status != 'cancelled'
    `,
      [elderId]
    );
    console.log('   Count:', upcomingAppointmentsResult.rows[0].count);
    console.log('');
    
    // Get upcoming sessions count (from counselor_appointment table)
    console.log('3. Checking upcoming counselor sessions...');
    try {
      const upcomingSessionsResult = await pool.query(
        `
        SELECT COUNT(*) as count
        FROM counselor_appointment 
        WHERE elder_id = $1 
        AND date_time > NOW()
        AND status IN ('confirmed')
        AND status != 'cancelled'
      `,
        [elderId]
      );
      console.log('   Count:', upcomingSessionsResult.rows[0].count);
    } catch (error) {
      console.log('   ERROR:', error.message);
    }
    console.log('');
    
    // Get upcoming campaigns count
    console.log('4. Checking upcoming campaigns...');
    try {
      const upcomingCampaignsResult = await pool.query(
        `
        SELECT COUNT(*) as count
        FROM campaignbooking cb
        INNER JOIN campaignevent c ON cb.campaign_id = c.campaign_id
        WHERE cb.elder_id = $1 
        AND c.start_date > NOW()
      `,
        [elderId]
      );
      console.log('   Count:', upcomingCampaignsResult.rows[0].count);
    } catch (error) {
      console.log('   ERROR:', error.message);
    }
    console.log('');
    
    // Get active caregivers count
    console.log('5. Checking active caregivers...');
    try {
      const activeCaregiversResult = await pool.query(
        `
        SELECT COUNT(DISTINCT caregiver_id) as count
        FROM carelog 
        WHERE elder_id = $1
      `,
        [elderId]
      );
      console.log('   Count:', activeCaregiversResult.rows[0].count);
    } catch (error) {
      console.log('   ERROR:', error.message);
    }
    console.log('');
    
    console.log('✅ All queries completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

testDashboardStats();
