const pool = require('./db');

async function testCounselorAppointmentsFetch() {
  try {
    console.log('🔍 Testing Counselor Appointments in Dashboard\n');
    
    // 1. Check if counselor_appointment table has data
    console.log('1. Checking counselor_appointment table...');
    const appointmentsCount = await pool.query(
      `SELECT COUNT(*) as count FROM counselor_appointment`
    );
    console.log(`   Total counselor appointments in database: ${appointmentsCount.rows[0].count}\n`);
    
    if (appointmentsCount.rows[0].count === '0') {
      console.log('⚠️  No counselor appointments found in the database.\n');
      await pool.end();
      return;
    }
    
    // 2. Get a sample elder who has counselor appointments
    console.log('2. Finding an elder with counselor appointments...');
    const elderWithAppointment = await pool.query(
      `SELECT DISTINCT ca.elder_id, e.name as elder_name, e.email
       FROM counselor_appointment ca
       JOIN elder e ON ca.elder_id = e.elder_id
       LIMIT 1`
    );
    
    if (elderWithAppointment.rows.length === 0) {
      console.log('   No elders found with counselor appointments.\n');
      await pool.end();
      return;
    }
    
    const elder = elderWithAppointment.rows[0];
    console.log(`   Found elder: ${elder.elder_name} (ID: ${elder.elder_id}, Email: ${elder.email})\n`);
    
    // 3. Test upcoming appointments count (dashboard stats)
    console.log('3. Testing upcoming counselor appointments count...');
    const upcomingCount = await pool.query(
      `SELECT COUNT(*) as count
       FROM counselor_appointment 
       WHERE elder_id = $1 
       AND date_time > NOW()
       AND status IN ('confirmed')
       AND status != 'cancelled'`,
      [elder.elder_id]
    );
    console.log(`   Upcoming appointments: ${upcomingCount.rows[0].count}\n`);
    
    // 4. Test fetching upcoming appointments (with limit 2)
    console.log('4. Testing fetch upcoming appointments (limit 2)...');
    const upcomingAppointments = await pool.query(
      `SELECT 
        ca.appointment_id,
        ca.elder_id,
        ca.counselor_id,
        ca.date_time,
        ca.status,
        ca.appointment_type,
        ca.meeting_link,
        c.specialization,
        u.name as counselor_name,
        u.email as counselor_email
      FROM counselor_appointment ca
      INNER JOIN counselor c ON ca.counselor_id = c.counselor_id
      INNER JOIN "User" u ON c.user_id = u.user_id
      WHERE ca.elder_id = $1 
      AND ca.date_time > NOW()
      AND ca.status IN ('confirmed')
      AND ca.status != 'cancelled'
      ORDER BY ca.date_time ASC
      LIMIT 2`,
      [elder.elder_id]
    );
    
    console.log(`   Found ${upcomingAppointments.rows.length} upcoming appointments:`);
    upcomingAppointments.rows.forEach((apt, idx) => {
      console.log(`   ${idx + 1}. ${apt.counselor_name} - ${apt.date_time} (${apt.status})`);
    });
    console.log('');
    
    // 5. Test fetching past appointments (with limit 2)
    console.log('5. Testing fetch past appointments (limit 2)...');
    const pastAppointments = await pool.query(
      `SELECT 
        ca.appointment_id,
        ca.elder_id,
        ca.counselor_id,
        ca.date_time,
        ca.status,
        ca.appointment_type,
        c.specialization,
        u.name as counselor_name
      FROM counselor_appointment ca
      INNER JOIN counselor c ON ca.counselor_id = c.counselor_id
      INNER JOIN "User" u ON c.user_id = u.user_id
      WHERE ca.elder_id = $1 
      AND (ca.date_time <= NOW() OR ca.status IN ('completed', 'cancelled'))
      ORDER BY ca.date_time DESC
      LIMIT 2`,
      [elder.elder_id]
    );
    
    console.log(`   Found ${pastAppointments.rows.length} past appointments:`);
    pastAppointments.rows.forEach((apt, idx) => {
      console.log(`   ${idx + 1}. ${apt.counselor_name} - ${apt.date_time} (${apt.status})`);
    });
    console.log('');
    
    // 6. List all counselor appointments for this elder
    console.log('6. All counselor appointments for this elder:');
    const allAppointments = await pool.query(
      `SELECT 
        ca.appointment_id,
        ca.date_time,
        ca.status,
        ca.appointment_type,
        u.name as counselor_name
      FROM counselor_appointment ca
      INNER JOIN counselor c ON ca.counselor_id = c.counselor_id
      INNER JOIN "User" u ON c.user_id = u.user_id
      WHERE ca.elder_id = $1
      ORDER BY ca.date_time DESC`,
      [elder.elder_id]
    );
    
    console.log(`   Total appointments: ${allAppointments.rows.length}`);
    allAppointments.rows.forEach((apt, idx) => {
      const isPast = new Date(apt.date_time) <= new Date();
      const timeIndicator = isPast ? '(Past)' : '(Upcoming)';
      console.log(`   ${idx + 1}. [${apt.appointment_id}] ${apt.counselor_name} - ${apt.date_time} - ${apt.status} ${timeIndicator}`);
    });
    console.log('');
    
    console.log('✅ All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Total appointments in DB: ${appointmentsCount.rows[0].count}`);
    console.log(`   - Elder tested: ${elder.elder_name} (${elder.elder_id})`);
    console.log(`   - Upcoming appointments: ${upcomingCount.rows[0].count}`);
    console.log(`   - API should now show counselor appointments in elder dashboard`);
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await pool.end();
  }
}

testCounselorAppointmentsFetch();
