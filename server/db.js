process.env.TZ = 'Asia/Colombo';
const { Pool } = require('pg');
const cron = require('node-cron');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
// Set timezone for all new connections
pool.on('connect', (client) => {
  client.query('SET timezone TO "Asia/Colombo"');
});

cron.schedule('0 * * * *', async () => {
  try {
    console.log('🕐 Checking for expired appointments at:', new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' }));
    
    const result = await pool.query(`
      UPDATE appointment 
      SET status = 'completed', 
          updated_at = CURRENT_TIMESTAMP
      WHERE status = 'confirmed' 
      AND date_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Colombo' < CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Colombo'
      RETURNING 
        appointment_id, 
        date_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Colombo' as appointment_time,
        elder_id,
        doctor_id
    `);
    
    if (result.rows.length > 0) {
      console.log(`✅ Updated ${result.rows.length} expired appointments to completed:`);
      result.rows.forEach(apt => {
        console.log(`  📅 Appointment ID: ${apt.appointment_id} | Elder ID: ${apt.elder_id} | Doctor ID: ${apt.doctor_id} | Was scheduled: ${apt.appointment_time}`);
      });
    } else {
      console.log('ℹ️  No expired appointments found to update');
    }
  } catch (error) {
    console.error('❌ Error updating expired appointments:', error);
  }
});

console.log('📅 Appointment status updater scheduled to run every hour');


module.exports = pool;