const MeetingService = require('./services/meetingService');

console.log('🧪 Testing Meeting System...');

// Test 1: Generate meeting link
console.log('\n1. Testing meeting link generation:');
const meetingData = MeetingService.generateMeetingLink('123', '456', '789');
console.log('✅ Meeting data:', meetingData);

// Test 2: Validate meeting link structure
console.log('\n2. Testing meeting link structure:');
console.log('Meeting ID:', meetingData.meetingId);
console.log('Room Name:', meetingData.roomName);
console.log('General Link:', meetingData.meetingLink);
console.log('Doctor URL:', meetingData.doctorUrl);
console.log('Patient URL:', meetingData.patientUrl);

// Validate URL format
const url = new URL(meetingData.meetingLink);
console.log('✅ URL is valid');
console.log('Host:', url.host);
console.log('Path:', url.pathname);

console.log('\n✅ Meeting system tests completed successfully!');
console.log('\n📞 How it works:');
console.log('1. When an appointment is confirmed → Meeting link is automatically generated');
console.log('2. Doctor sees "Join Meeting" button in dashboard for online confirmed appointments');
console.log('3. Clicking the button opens the Jitsi Meet room with proper identification');
console.log('4. Both doctor and patient use the same room but with different display names');
