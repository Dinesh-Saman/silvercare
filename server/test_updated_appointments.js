const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

console.log('Testing updated getElderAppointments function...');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const getElderAppointments = async (elderId) => {
  try {
    console.log('Getting appointments for elder ID:', elderId);
    
    // Query for both doctor and healthcare professional appointments using UNION
    const result = await pool.query(
      `SELECT 
        a.appointment_id,
        a.elder_id,
        a.family_id,
        a.doctor_id,
        a.counselor_id,
        a.date_time,
        a.status,
        a.notes,
        a.appointment_type,
        a.created_at,
        a.updated_at,
        u.name as provider_name,
        d.specialization,
        d.current_institution,
        e.name as elder_name,
        'doctor' as provider_type
      FROM appointment a 
      INNER JOIN doctor d ON a.doctor_id = d.doctor_id
      INNER JOIN "User" u ON d.user_id = u.user_id
      INNER JOIN elder e ON a.elder_id = e.elder_id
      WHERE a.elder_id = $1 AND a.doctor_id IS NOT NULL
      
      UNION ALL
      
      SELECT 
        a.appointment_id,
        a.elder_id,
        a.family_id,
        a.doctor_id,
        a.counselor_id,
        a.date_time,
        a.status,
        a.notes,
        a.appointment_type,
        a.created_at,
        a.updated_at,
        u.name as provider_name,
        c.specialization,
        c.current_institution,
        e.name as elder_name,
        'healthcare_professional' as provider_type
      FROM appointment a 
      INNER JOIN counselor c ON a.counselor_id = c.counselor_id
      INNER JOIN "User" u ON c.user_id = u.user_id
      INNER JOIN elder e ON a.elder_id = e.elder_id
      WHERE a.elder_id = $1 AND a.counselor_id IS NOT NULL
      
      ORDER BY date_time DESC`,
      [elderId]
    );
    
    console.log('Found appointments:', result.rows.length);
    console.log('Appointment types:', result.rows.map(row => `${row.provider_type}: ${row.provider_name}`));
    return result.rows;
    
  } catch (err) {
    console.error('Error fetching elder appointments:', err);
    throw err;
  }
};

// Test with a sample elder ID (let's use elder_id 1)
getElderAppointments(1).then(appointments => {
  console.log('\nTest Results:');
  console.log('=============');
  appointments.forEach((apt, index) => {
    console.log(`${index + 1}. ${apt.provider_type === 'doctor' ? 'Dr.' : ''} ${apt.provider_name} - ${apt.specialization}`);
    console.log(`   Date: ${new Date(apt.date_time).toLocaleDateString()}`);
    console.log(`   Type: ${apt.appointment_type}`);
    console.log(`   Status: ${apt.status}`);
    console.log('');
  });
  
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});