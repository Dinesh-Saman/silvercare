const pool = require('./db');

async function addHealthProfessionalAppointmentSupport() {
    try {
        console.log('🏥 Adding Healthcare Professional Appointment Support...\n');
        
        // Step 1: Add counselor_id column to appointment table
        console.log('1. Adding counselor_id column to appointment table...');
        try {
            await pool.query(`
                ALTER TABLE appointment 
                ADD COLUMN counselor_id INTEGER REFERENCES counselor(counselor_id)
            `);
            console.log('✅ Added counselor_id column');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('✅ counselor_id column already exists');
            } else {
                throw error;
            }
        }

        // Step 2: Add provider_type column to track if it's doctor or healthcare professional
        console.log('2. Adding provider_type column...');
        try {
            await pool.query(`
                ALTER TABLE appointment 
                ADD COLUMN provider_type VARCHAR(20) DEFAULT 'doctor' 
                CHECK (provider_type IN ('doctor', 'healthcare_professional'))
            `);
            console.log('✅ Added provider_type column');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('✅ provider_type column already exists');
            } else {
                throw error;
            }
        }

        // Step 3: Update existing appointments to have provider_type = 'doctor'
        console.log('3. Updating existing appointments...');
        const updateResult = await pool.query(`
            UPDATE appointment 
            SET provider_type = 'doctor' 
            WHERE provider_type IS NULL AND doctor_id IS NOT NULL
        `);
        console.log(`✅ Updated ${updateResult.rowCount} existing appointments`);

        // Step 4: Check the updated table structure
        console.log('4. Checking appointment table structure...');
        const columns = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'appointment'
            ORDER BY ordinal_position
        `);
        
        console.log('\nUpdated appointment table structure:');
        columns.rows.forEach(col => {
            console.log(`- ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
        });

        console.log('\n✅ Healthcare Professional appointment support added successfully!');
        console.log('\nNow appointments can be booked with:');
        console.log('- Doctor appointments: doctor_id + provider_type="doctor"');
        console.log('- Healthcare Professional appointments: counselor_id + provider_type="healthcare_professional"');

    } catch (error) {
        console.error('❌ Error adding healthcare professional support:', error);
    } finally {
        pool.end();
    }
}

addHealthProfessionalAppointmentSupport();
