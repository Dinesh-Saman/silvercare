const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/elders';

async function testElderDashboardAPI() {
  try {
    console.log('🧪 Testing Elder Dashboard API Endpoints\n');
    
    // Test elder: mahinda@gmail.com (elder_id: 28)
    const elderId = 28;
    
    // 1. Test dashboard stats
    console.log('1. Testing /api/elders/:elderId/dashboard-stats');
    const statsResponse = await axios.get(`${API_BASE}/${elderId}/dashboard-stats`);
    console.log('   Response:', JSON.stringify(statsResponse.data, null, 2));
    console.log('');
    
    // 2. Test upcoming sessions
    console.log('2. Testing /api/elders/:elderId/sessions/upcoming?limit=2');
    const upcomingSessionsResponse = await axios.get(`${API_BASE}/${elderId}/sessions/upcoming?limit=2`);
    console.log('   Response:', JSON.stringify(upcomingSessionsResponse.data, null, 2));
    console.log('');
    
    // 3. Test past sessions
    console.log('3. Testing /api/elders/:elderId/sessions/past?limit=2');
    const pastSessionsResponse = await axios.get(`${API_BASE}/${elderId}/sessions/past?limit=2`);
    console.log('   Response:', JSON.stringify(pastSessionsResponse.data, null, 2));
    console.log('');
    
    // 4. Test all sessions
    console.log('4. Testing /api/elders/:elderId/sessions');
    const allSessionsResponse = await axios.get(`${API_BASE}/${elderId}/sessions`);
    console.log('   Response:', JSON.stringify(allSessionsResponse.data, null, 2));
    console.log('');
    
    console.log('✅ All API endpoints are working correctly!');
    console.log('\n📊 Summary:');
    console.log(`   - Upcoming Sessions Count: ${statsResponse.data.stats.upcomingSessions}`);
    console.log(`   - Upcoming Sessions Fetched: ${upcomingSessionsResponse.data.count}`);
    console.log(`   - Past Sessions Fetched: ${pastSessionsResponse.data.count}`);
    console.log(`   - Total Sessions: ${allSessionsResponse.data.count}`);
    
  } catch (error) {
    console.error('❌ Error testing API:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else if (error.request) {
      console.error('   No response received from server');
      console.error('   Error:', error.message);
    } else {
      console.error('   Error:', error.message);
    }
  }
}

testElderDashboardAPI();
