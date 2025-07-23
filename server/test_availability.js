const StatusUpdateService = require('./services/statusUpdateService');

// Test function to verify availability updates
async function testAvailabilityUpdate() {
  try {
    console.log('Testing caregiver availability update...');
    
    // Test updating all caregivers availability
    const results = await StatusUpdateService.updateAllCaregiversAvailability();
    console.log('Update results:', results);
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testAvailabilityUpdate();
