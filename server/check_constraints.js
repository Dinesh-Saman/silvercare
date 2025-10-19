const pool = require('./db');

async function checkConstraints() {
  const result = await pool.query(`
    SELECT constraint_name, check_clause 
    FROM information_schema.check_constraints 
    WHERE constraint_name LIKE '%counselor%'
  `);
  console.log('Constraints:', result.rows);
  process.exit(0);
}

checkConstraints().catch(err => { console.error(err); process.exit(1); });
