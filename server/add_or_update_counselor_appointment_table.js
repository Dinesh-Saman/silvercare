const pool = require('./db');

async function ensureCounselorAppointmentTable() {
  try {
    console.log('Ensuring counselor_appointment table and required columns exist...');

    // Create table if it does not exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS counselor_appointment (
        appointment_id SERIAL PRIMARY KEY,
        elder_id INTEGER REFERENCES elder(elder_id),
        family_id INTEGER,
        counselor_id INTEGER REFERENCES counselor(counselor_id),
        date_time TIMESTAMP NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
        appointment_type VARCHAR(20) NOT NULL, -- 'online' or 'physical'
        meeting_link TEXT,
        notes TEXT,
        patient_name TEXT,
        contact_number TEXT,
        emergency_contact TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure required columns exist (idempotent alters)
    const ensureColumn = async (name, type) => {
      await pool.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'counselor_appointment' AND column_name = '${name}'
          ) THEN
            EXECUTE 'ALTER TABLE counselor_appointment ADD COLUMN ${name} ${type}';
          END IF;
        END $$;
      `);
    };

    await ensureColumn('meeting_link', 'TEXT');
    await ensureColumn('patient_name', 'TEXT');
    await ensureColumn('contact_number', 'TEXT');
    await ensureColumn('emergency_contact', 'TEXT');
    await ensureColumn('family_id', 'INTEGER');

    // Helpful indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_counselor_appt_counselor_datetime
        ON counselor_appointment (counselor_id, date_time);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_counselor_appt_elder_datetime
        ON counselor_appointment (elder_id, date_time);
    `);

    console.log('✅ counselor_appointment table is ready.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed ensuring counselor_appointment table:', err);
    process.exit(1);
  }
}

ensureCounselorAppointmentTable();
