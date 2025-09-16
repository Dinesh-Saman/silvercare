const fetch = require('node-fetch');

async function testHealthcareAPI() {
  try {
    console.log('Testing healthcare professional API endpoint...');
    
    // Test with a sample elder ID (you may need to adjust this)
    const elderId = 1;
    const url = `http://localhost:5000/api/elder/${elderId}/healthcare-professionals/online`;
    
    console.log('Making request to:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log(`✅ Found ${data.healthProfessionals.length} healthcare professionals`);
      data.healthProfessionals.forEach(prof => {
        console.log(`  - ${prof.counselor_name} (${prof.specialty}) - ${prof.district}`);
      });
    } else {
      console.log('❌ API returned error:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testHealthcareAPI();