process.env.TZ = 'Asia/Colombo';
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
// Set timezone for all new connections
pool.on('connect', (client) => {
  client.query('SET timezone TO "Asia/Colombo"');
});

module.exports = pool;