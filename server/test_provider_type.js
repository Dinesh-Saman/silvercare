const pool = require('./db');

async function testProviderType() {
  try {
    console.log('Testing provider_type constraint...');
    
    // Try to insert with 'counselor' provider_type
    const result = await pool.query(`
      INSERT INTO appointment (elder_id, provider_type, status) 
      VALUES (3, 'counselor', 'confirmed') 
      RETURNING appointment_id, provider_type;
    `);
    
    console.log('✅ Successfully inserted with provider_type:', result.rows[0].provider_type);
    
    // Cleanup
    await pool.query('DELETE FROM appointment WHERE appointment_id = $1', [result.rows[0].appointment_id]);
    console.log('✅ Cleanup completed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Check the constraint definition
    try {
      const constraintResult = await pool.query(`
        SELECT conname, pg_get_constraintdef(oid) AS definition 
        FROM pg_constraint 
        WHERE conrelid = (SELECT oid FROM pg_class WHERE relname = 'appointment') 
        AND contype = 'c' AND consrc IS NOT NULL OR pg_get_constraintdef(oid) LIKE '%provider_type%';
      `);
      
      console.log('Constraint definitions:', constraintResult.rows);
    } catch (err) {
      console.error('Failed to get constraint info:', err.message);
    }
  } finally {
    pool.end();
  }
}

testProviderType();