const pool = require('./db');

async function fixProviderTypeConstraint() {
  try {
    console.log('Checking current provider_type constraint...');
    
    // Get all constraints on appointment table
    const constraintResult = await pool.query(`
      SELECT conname, pg_get_constraintdef(oid) AS definition 
      FROM pg_constraint 
      WHERE conrelid = (SELECT oid FROM pg_class WHERE relname = 'appointment') 
      AND contype = 'c'
      AND conname LIKE '%provider_type%';
    `);
    
    console.log('Current constraint:', constraintResult.rows);
    
    if (constraintResult.rows.length > 0) {
      const constraintName = constraintResult.rows[0].conname;
      console.log(`Dropping constraint: ${constraintName}`);
      
      await pool.query(`ALTER TABLE appointment DROP CONSTRAINT ${constraintName};`);
      console.log('✅ Constraint dropped');
    }
    
    // Add new constraint that allows both doctor and healthcare/counselor
    console.log('Adding new constraint...');
    await pool.query(`
      ALTER TABLE appointment 
      ADD CONSTRAINT appointment_provider_type_check 
      CHECK (provider_type IN ('doctor', 'healthcare', 'counselor'));
    `);
    console.log('✅ New constraint added: provider_type IN (\'doctor\', \'healthcare\', \'counselor\')');
    
    // Test the new constraint
    console.log('Testing new constraint...');
    const testResult = await pool.query(`
      INSERT INTO appointment (elder_id, provider_type, status) 
      VALUES (3, 'counselor', 'confirmed') 
      RETURNING appointment_id, provider_type;
    `);
    
    console.log('✅ Test successful:', testResult.rows[0]);
    
    // Cleanup
    await pool.query('DELETE FROM appointment WHERE appointment_id = $1', [testResult.rows[0].appointment_id]);
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    pool.end();
  }
}

fixProviderTypeConstraint();