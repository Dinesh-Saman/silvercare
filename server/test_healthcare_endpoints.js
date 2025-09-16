const pool = require('./db');

async function testHealthcareProfessionalEndpoints() {
  try {
    console.log('Testing Healthcare Professional API Endpoints...\n');
    
    // Test data setup
    const testElderId = 3; // anura samarasinghe
    
    // Import the controller functions
    const { 
      getAllHealthProfessionalsForOnlineMeeting,
      getHealthProfessionalsByElderDistrict 
    } = require('./controllers/elderController');
    
    // Mock request and response objects
    const createMockReq = (elderId) => ({ params: { elderId } });
    const createMockRes = () => {
      const res = {};
      res.status = (statusCode) => {
        res.statusCode = statusCode;
        return res;
      };
      res.json = (data) => {
        res.jsonData = data;
        return res;
      };
      return res;
    };
    
    // Test 1: Online healthcare professionals (all districts)
    console.log('1. Testing online healthcare professionals endpoint...');
    const onlineReq = createMockReq(testElderId);
    const onlineRes = createMockRes();
    
    await getAllHealthProfessionalsForOnlineMeeting(onlineReq, onlineRes);
    
    if (onlineRes.jsonData?.success) {
      console.log('✅ Online healthcare professionals:');
      console.log(`   Count: ${onlineRes.jsonData.count}`);
      console.log(`   Meeting Type: ${onlineRes.jsonData.meetingType}`);
      console.log(`   District: ${onlineRes.jsonData.elderInfo.district}`);
      onlineRes.jsonData.healthProfessionals.forEach(hp => {
        console.log(`   - ${hp.counselor_name} (${hp.specialty}) - District: ${hp.district || 'Not specified'}`);
      });
    } else {
      console.log('❌ Online endpoint failed:', onlineRes.jsonData?.error);
    }
    
    console.log('\n2. Testing physical healthcare professionals endpoint (by district)...');
    const physicalReq = createMockReq(testElderId);
    const physicalRes = createMockRes();
    
    await getHealthProfessionalsByElderDistrict(physicalReq, physicalRes);
    
    if (physicalRes.jsonData?.success) {
      console.log('✅ Physical healthcare professionals:');
      console.log(`   Count: ${physicalRes.jsonData.count}`);
      console.log(`   Meeting Type: ${physicalRes.jsonData.meetingType}`);
      console.log(`   Elder District: ${physicalRes.jsonData.elderInfo.district}`);
      if (physicalRes.jsonData.healthProfessionals.length > 0) {
        physicalRes.jsonData.healthProfessionals.forEach(hp => {
          console.log(`   - ${hp.counselor_name} (${hp.specialty}) - District: ${hp.district}`);
        });
      } else {
        console.log('   No healthcare professionals found in the same district');
      }
    } else {
      console.log('❌ Physical endpoint failed:', physicalRes.jsonData?.error);
    }
    
    console.log('\n📊 Endpoint Comparison:');
    const onlineCount = onlineRes.jsonData?.count || 0;
    const physicalCount = physicalRes.jsonData?.count || 0;
    
    console.log(`   Online appointments: ${onlineCount} healthcare professionals (all districts)`);
    console.log(`   Physical appointments: ${physicalCount} healthcare professionals (same district only)`);
    
    if (onlineCount >= physicalCount) {
      console.log('✅ System working correctly - online shows more/equal providers than physical');
    } else {
      console.log('⚠️ Unexpected: physical showing more providers than online');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    pool.end();
  }
}

testHealthcareProfessionalEndpoints();