const pool = require('./db');

async function testCounselorAppointmentFlow() {
  try {
    console.log('🧪 Testing Counselor Appointment Flow\n');

    // 1. Check counselor_appointment table structure
    console.log('1. Checking counselor_appointment table structure...');
    const tableCheck = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'counselor_appointment'
      ORDER BY ordinal_position
    `);
    console.log('   Columns:', tableCheck.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));

    // 2. Check payment table has counselor_appointment_id
    console.log('\n2. Checking payment table has counselor_appointment_id...');
    const paymentCheck = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'payment' 
      AND column_name IN ('appointment_id', 'counselor_appointment_id')
    `);
    console.log('   Payment columns:', paymentCheck.rows.map(r => r.column_name).join(', '));

    // 3. Check existing counselor appointments
    console.log('\n3. Checking existing counselor appointments...');
    const counselorAppts = await pool.query(`
      SELECT 
        ca.appointment_id,
        ca.elder_id,
        ca.counselor_id,
        ca.date_time,
        ca.status,
        ca.appointment_type,
        ca.meeting_link,
        e.name as elder_name,
        u.name as counselor_name
      FROM counselor_appointment ca
      LEFT JOIN elder e ON ca.elder_id = e.elder_id
      LEFT JOIN counselor c ON ca.counselor_id = c.counselor_id
      LEFT JOIN "User" u ON c.user_id = u.user_id
      ORDER BY ca.created_at DESC
      LIMIT 5
    `);
    if (counselorAppts.rows.length > 0) {
      console.table(counselorAppts.rows);
    } else {
      console.log('   ℹ️  No counselor appointments found yet (test by creating one)');
    }

    // 4. Check payments linked to counselor appointments
    console.log('\n4. Checking payments for counselor appointments...');
    const counselorPayments = await pool.query(`
      SELECT 
        p.payment_id,
        p.counselor_appointment_id,
        p.amount,
        p.payment_method,
        p.payment_status,
        ca.date_time as appointment_date
      FROM payment p
      INNER JOIN counselor_appointment ca ON p.counselor_appointment_id = ca.appointment_id
      ORDER BY p.created_at DESC
      LIMIT 5
    `);
    if (counselorPayments.rows.length > 0) {
      console.table(counselorPayments.rows);
    } else {
      console.log('   ℹ️  No payments for counselor appointments yet');
    }

    // 5. Check old appointments table for counselor_id entries (should be none after migration)
    console.log('\n5. Checking appointment table for counselor entries (should be empty)...');
    const oldCounselorAppts = await pool.query(`
      SELECT appointment_id, elder_id, counselor_id, date_time, status
      FROM appointment
      WHERE counselor_id IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 5
    `);
    if (oldCounselorAppts.rows.length > 0) {
      console.log('   ⚠️  Found old counselor appointments in appointment table:');
      console.table(oldCounselorAppts.rows);
      console.log('   💡 These should be migrated or the new flow should be used going forward');
    } else {
      console.log('   ✅ No counselor appointments in old appointment table (good!)');
    }

    console.log('\n✅ Counselor Appointment System Check Complete!');
    console.log('\nNext Steps:');
    console.log('1. Create a new mental health appointment from the UI');
    console.log('2. Re-run this script to verify it appears in counselor_appointment table');
    console.log('3. Check that meeting_link is generated for online appointments');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing counselor appointment flow:', error);
    process.exit(1);
  }
}

testCounselorAppointmentFlow();
