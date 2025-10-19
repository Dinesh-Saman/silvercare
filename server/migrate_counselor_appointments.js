const pool = require('./db');

async function migrateCounselorAppointments() {
  try {
    console.log('🔄 Migrating existing counselor appointments to counselor_appointment table\n');

    // Get all counselor appointments from appointment table
    const oldAppts = await pool.query(`
      SELECT 
        a.*,
        p.payment_id,
        p.amount,
        p.payment_method,
        p.transaction_id,
        p.payment_status,
        p.payment_date
      FROM appointment a
      LEFT JOIN payment p ON a.appointment_id = p.appointment_id
      WHERE a.counselor_id IS NOT NULL
      ORDER BY a.created_at DESC
    `);

    if (oldAppts.rows.length === 0) {
      console.log('✅ No counselor appointments to migrate');
      process.exit(0);
    }

    console.log(`Found ${oldAppts.rows.length} counselor appointments to migrate\n`);

    const client = await pool.connect();
    let migratedCount = 0;
    let paymentsMigratedCount = 0;

    try {
      await client.query('BEGIN');

      for (const appt of oldAppts.rows) {
        // Insert into counselor_appointment
        const newApptResult = await client.query(`
          INSERT INTO counselor_appointment (
            elder_id,
            family_id,
            counselor_id,
            date_time,
            status,
            appointment_type,
            meeting_link,
            notes,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING appointment_id
        `, [
          appt.elder_id,
          appt.family_id,
          appt.counselor_id,
          appt.date_time,
          appt.status,
          appt.appointment_type || 'online',
          appt.meeting_link,
          appt.notes,
          appt.created_at,
          appt.updated_at || appt.created_at
        ]);

        const newApptId = newApptResult.rows[0].appointment_id;
        migratedCount++;

        console.log(`✓ Migrated appointment ${appt.appointment_id} → counselor_appointment ${newApptId}`);

        // Update payment if exists
        if (appt.payment_id) {
          await client.query(`
            UPDATE payment 
            SET counselor_appointment_id = $1,
                appointment_id = NULL
            WHERE payment_id = $2
          `, [newApptId, appt.payment_id]);
          paymentsMigratedCount++;
          console.log(`  ✓ Updated payment ${appt.payment_id} to reference counselor_appointment`);
        }

        // Delete from old appointment table
        await client.query('DELETE FROM appointment WHERE appointment_id = $1', [appt.appointment_id]);
      }

      await client.query('COMMIT');

      console.log(`\n✅ Migration Complete!`);
      console.log(`   - Migrated ${migratedCount} counselor appointments`);
      console.log(`   - Updated ${paymentsMigratedCount} payment records`);
      console.log(`   - Deleted old entries from appointment table\n`);

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateCounselorAppointments();
