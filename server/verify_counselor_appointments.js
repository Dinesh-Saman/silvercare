const pool = require('./db');

async function verify() {
  try {
    console.log('Verifying counselor_appointment entries and meeting links...');
    const res = await pool.query(`
      SELECT ca.appointment_id, ca.elder_id, ca.counselor_id, ca.date_time, ca.status, ca.appointment_type, ca.meeting_link
      FROM counselor_appointment ca
      ORDER BY ca.created_at DESC
      LIMIT 10
    `);
    console.table(res.rows);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

verify();
