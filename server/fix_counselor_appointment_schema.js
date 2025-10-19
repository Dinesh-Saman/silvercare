const pool = require('./db');

async function fixCounselorAppointmentSchema() {
  try {
    console.log('Fixing counselor_appointment table schema...\n');

    // Drop the old constraints
    await pool.query(`
      ALTER TABLE counselor_appointment 
      DROP CONSTRAINT IF EXISTS counselor_appointment_appointment_type_check
    `);
    console.log('✓ Dropped old appointment_type constraint');

    await pool.query(`
      ALTER TABLE counselor_appointment 
      DROP CONSTRAINT IF EXISTS counselor_appointment_session_type_check
    `);
    console.log('✓ Dropped old session_type constraint');

    // Add new constraint for appointment_type (online/physical)
    await pool.query(`
      ALTER TABLE counselor_appointment
      ADD CONSTRAINT counselor_appointment_appointment_type_check 
      CHECK (appointment_type IN ('online', 'physical'))
    `);
    console.log('✓ Added new appointment_type constraint (online/physical)');

    // Make session_type nullable (we won't use it)
    await pool.query(`
      ALTER TABLE counselor_appointment
      ALTER COLUMN session_type DROP NOT NULL
    `).catch(() => console.log('  (session_type already nullable)'));

    console.log('\n✅ Schema fixed! counselor_appointment now accepts online/physical for appointment_type');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixCounselorAppointmentSchema();
