const pool = require('./db');

async function addCounselorAppointmentIdToPayment() {
  try {
    console.log('Adding counselor_appointment_id column to payment table...');

    // Check if column already exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'payment' 
      AND column_name = 'counselor_appointment_id'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('✅ counselor_appointment_id column already exists in payment table');
    } else {
      // Add counselor_appointment_id column
      await pool.query(`
        ALTER TABLE payment
        ADD COLUMN counselor_appointment_id INTEGER REFERENCES counselor_appointment(appointment_id)
      `);
      console.log('✅ Successfully added counselor_appointment_id column to payment table');
    }

    // Make appointment_id nullable (since we now have counselor_appointment_id as alternative)
    await pool.query(`
      ALTER TABLE payment 
      ALTER COLUMN appointment_id DROP NOT NULL
    `).catch(err => {
      // Ignore if already nullable
      if (!err.message.includes('does not exist')) {
        console.log('Note: appointment_id column constraint adjustment:', err.message);
      }
    });

    console.log('✅ Payment table updated to support both doctor and counselor appointments');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating payment table:', error);
    process.exit(1);
  }
}

addCounselorAppointmentIdToPayment();
