const pool = require('./db');

async function addMeetingLinkColumn() {
    try {
        // Check if column already exists
        const columnCheck = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'appointment' 
            AND column_name = 'meeting_link'
        `);
        
        if (columnCheck.rows.length > 0) {
            console.log('meeting_link column already exists');
            return;
        }
        
        // Add meeting_link column to appointment table
        await pool.query(`
            ALTER TABLE appointment 
            ADD COLUMN meeting_link VARCHAR(500)
        `);
        
        console.log('✅ Successfully added meeting_link column to appointment table');
        
        // Check the table structure
        const columns = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'appointment'
            ORDER BY ordinal_position
        `);
        
        console.log('\nUpdated appointment table structure:');
        columns.rows.forEach(col => {
            console.log(`- ${col.column_name}: ${col.data_type}`);
        });
        
    } catch (error) {
        console.error('❌ Error adding meeting_link column:', error);
    } finally {
        pool.end();
    }
}

addMeetingLinkColumn();
