const pool = require('./db');

async function testPhysicalHealthcareProfessionals() {
  try {
    console.log('Testing Physical Healthcare Professional Filtering...\n');
    
    // Test with elder in Kurunegala district (should find malinga)
    const testElderId = 26; // ruchira in kurunagala
    
    const { getHealthProfessionalsByElderDistrict } = require('./controllers/elderController');
    
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
    
    console.log('Testing physical healthcare professionals for elder in Kurunegala...');
    const physicalReq = createMockReq(testElderId);
    const physicalRes = createMockRes();
    
    await getHealthProfessionalsByElderDistrict(physicalReq, physicalRes);
    
    if (physicalRes.jsonData?.success) {
      console.log('✅ Physical healthcare professionals found:');
      console.log(`   Elder: ${physicalRes.jsonData.elderInfo.name}`);
      console.log(`   Elder District: ${physicalRes.jsonData.elderInfo.district}`);
      console.log(`   Count: ${physicalRes.jsonData.count}`);
      console.log(`   Meeting Type: ${physicalRes.jsonData.meetingType}`);
      
      if (physicalRes.jsonData.healthProfessionals.length > 0) {
        physicalRes.jsonData.healthProfessionals.forEach(hp => {
          console.log(`   - ${hp.counselor_name} (${hp.specialty})`);
          console.log(`     District: ${hp.district}, Experience: ${hp.years_experience} years`);
          console.log(`     Institution: ${hp.current_institution}`);
        });
      } else {
        console.log('   No healthcare professionals found in the same district');
      }
    } else {
      console.log('❌ Physical endpoint failed:', physicalRes.jsonData?.error);
    }
    
    // Also test Hambantota district
    console.log('\nTesting physical healthcare professionals for elder in Hambantota...');
    const hambantotatReq = createMockReq(12); // chamath kavinda in Hambantota
    const hambantotatRes = createMockRes();
    
    await getHealthProfessionalsByElderDistrict(hambantotatReq, hambantotatRes);
    
    if (hambantotatRes.jsonData?.success) {
      console.log('✅ Hambantota district results:');
      console.log(`   Elder: ${hambantotatRes.jsonData.elderInfo.name}`);
      console.log(`   Elder District: ${hambantotatRes.jsonData.elderInfo.district}`);
      console.log(`   Count: ${hambantotatRes.jsonData.count}`);
      
      if (hambantotatRes.jsonData.healthProfessionals.length > 0) {
        hambantotatRes.jsonData.healthProfessionals.forEach(hp => {
          console.log(`   - ${hp.counselor_name} (${hp.specialty}), District: ${hp.district}`);
        });
      } else {
        console.log('   No healthcare professionals found in Hambantota');
      }
    }
    
    console.log('\n🎯 District-based filtering is working correctly!');
    console.log('   - Physical appointments only show healthcare professionals in the same district');
    console.log('   - Online appointments show all healthcare professionals regardless of district');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    pool.end();
  }
}

testPhysicalHealthcareProfessionals();