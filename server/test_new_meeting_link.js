const meetingService = require('./services/meetingService');

// Test the new meeting link generation
console.log('🧪 Testing new meeting link generation...\n');

// Generate a test meeting link
const testMeeting = meetingService.generateMeetingLink(
  999, // test appointment ID
  2,   // doctor ID 
  3,   // elder ID
  'Dr. Indipa',
  'Test Patient'
);

console.log('🔗 Generated meeting details:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Room ID:', testMeeting.roomId);
console.log('Meeting URL:', testMeeting.meetingUrl);
console.log('Doctor Join URL:', testMeeting.doctorJoinUrl);
console.log('Elder Join URL:', testMeeting.elderJoinUrl);
console.log('Platform:', testMeeting.platform);
console.log('Created:', testMeeting.createdAt);

console.log('\n✅ Features of the new meeting links:');
console.log('• Unique room ID format: sc-{doctorId}-{elderId}-{hash}');
console.log('• No authentication required (config parameters added)');
console.log('• Prejoin page disabled for faster access');
console.log('• Display name not required');
console.log('• Profile features disabled to reduce complexity');
console.log('• Each meeting gets a completely unique room');

console.log('\n🎯 Ready to test with Doctor@gmail.com!');
console.log('Login and check the dashboard for join buttons.');

process.exit();
