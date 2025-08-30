const pool = require('./db');

async function updateSandyaEmail() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Looking for sandya priyani in elder table...\n');

    // First, find the elder with name containing "sandya"
    const findResult = await client.query(`
      SELECT elder_id, name, email 
      FROM elder 
      WHERE name ILIKE '%sandya%'
    `);

    if (findResult.rows.length === 0) {
      console.log('❌ Elder with name containing "sandya" not found!');
      console.log('Let me check all elders:');
      
      const allElders = await client.query('SELECT elder_id, name, email FROM elder LIMIT 10');
      allElders.rows.forEach(elder => {
        console.log(`- ID: ${elder.elder_id}, Name: ${elder.name}, Email: ${elder.email}`);
      });
      return;
    }

    const elder = findResult.rows[0];
    console.log(`✅ Found elder: ${elder.name} (ID: ${elder.elder_id})`);
    console.log(`Current email: ${elder.email || 'NULL'}\n`);

    // Update the email
    const updateResult = await client.query(`
      UPDATE elder 
      SET email = $1 
      WHERE elder_id = $2 
      RETURNING elder_id, name, email
    `, ['sandya@gmail.com', elder.elder_id]);

    if (updateResult.rows.length > 0) {
      const updatedElder = updateResult.rows[0];
      console.log('✅ Successfully updated elder email!');
      console.log(`Elder ID: ${updatedElder.elder_id}`);
      console.log(`Name: ${updatedElder.name}`);
      console.log(`New Email: ${updatedElder.email}\n`);

      // Verify the update
      const verifyResult = await client.query(`
        SELECT elder_id, name, email 
        FROM elder 
        WHERE elder_id = $1
      `, [elder.elder_id]);

      console.log('📊 Verification:');
      console.log(`✅ Email successfully set to: ${verifyResult.rows[0].email}`);
      
    } else {
      console.log('❌ Failed to update elder email');
    }

  } catch (error) {
    console.error('❌ Error updating elder email:', error);
  } finally {
    client.release();
  }
}

// Run the update
updateSandyaEmail().catch(console.error);
