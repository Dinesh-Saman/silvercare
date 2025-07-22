const pool = require('./db');

async function createTestData() {
  try {
    // Get an elder ID
    const elderResult = await pool.query('SELECT elder_id FROM elder LIMIT 1');
    const elderId = elderResult.rows[0]?.elder_id;
    console.log('Using elder ID:', elderId);
    
    // Get a caregiver ID
    const caregiverResult = await pool.query('SELECT caregiver_id FROM caregiver LIMIT 1');
    const caregiverId = caregiverResult.rows[0]?.caregiver_id;
    console.log('Using caregiver ID:', caregiverId);
    
    // Get family ID from elder
    const elderDetailResult = await pool.query('SELECT family_id FROM elder WHERE elder_id = $1', [elderId]);
    const familyId = elderDetailResult.rows[0]?.family_id;
    console.log('Using family ID:', familyId);
    
    if (elderId && caregiverId && familyId) {
      // Create a test care request for this week
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 2); // Started 2 days ago
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 5); // Ends in 5 days
      
      console.log('Creating test data with dates:', startDate.toISOString(), 'to', endDate.toISOString());
      
      const insertResult = await pool.query(`
        INSERT INTO carerequest (family_id, caregiver_id, elder_id, start_date, end_date, status, duration)
        VALUES ($1, $2, $3, $4, $5, 'approved', '1 week')
        RETURNING *
      `, [familyId, caregiverId, elderId, startDate, endDate]);
      
      console.log('Created test care request:', insertResult.rows[0]);
    } else {
      console.log('Missing required IDs');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestData();
