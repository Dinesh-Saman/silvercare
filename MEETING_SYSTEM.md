# 📞 Silvercare Meeting System

## Overview
This system automatically creates global meeting links whenever an appointment is confirmed, enabling seamless video consultations between doctors and patients.

## How It Works

### 1. Appointment Confirmation → Meeting Link Creation
When an appointment status is updated to **'confirmed'** and the appointment type is **'online'**, the system automatically:
- Generates a unique meeting ID using UUID
- Creates a Jitsi Meet room with format: `silvercare-{uuid}`
- Stores the meeting link in the appointment table
- Provides both general and role-specific URLs

### 2. Doctor Dashboard Integration
The doctor dashboard displays:
- **Join Meeting** buttons for confirmed online appointments
- Time-based availability (can join 15 minutes before to 60 minutes after)
- Loading states and proper error handling
- Automatic opening in new tab with doctor identification

### 3. Meeting Link Generation Points
Meeting links are created at these points:
- ✅ **Payment confirmation** (elderController.js)
- ✅ **Manual status update** (appointmentController.js)
- ✅ **Doctor status update** (doctormodel.js)

## Files Modified

### Backend
- `server/services/meetingService.js` - New service for meeting management
- `server/controllers/appointmentController.js` - Auto-generate links on confirmation
- `server/controllers/elderController.js` - Generate links during payment confirmation
- `server/models/doctormodel.js` - Generate links in doctor status updates
- `server/routes/appointmentRoutes.js` - Added meeting info endpoint

### Frontend
- `client/src/pages/doctor/dashboard.js` - Already has join meeting functionality

## API Endpoints

### Get Meeting Information
```
GET /api/appointments/:appointmentId/meeting
```
Returns meeting details including room URLs for doctor and patient.

## Database Schema
The `appointment` table includes:
- `meeting_link` - Stores the Jitsi Meet URL
- `appointment_type` - 'online' or 'in-person'
- `status` - 'confirmed', 'cancelled', 'completed'

## Testing
Run the test script:
```bash
node test_meeting_system.js
```

## Meeting URL Format
- **General**: `https://meet.jit.si/silvercare-{uuid}`
- **Doctor**: `https://meet.jit.si/silvercare-{uuid}?userInfo.displayName=Dr.{name}&userInfo.email={email}`
- **Patient**: `https://meet.jit.si/silvercare-{uuid}?userInfo.displayName={name}&userInfo.email={email}`

## Security Features
- Unique room names prevent unauthorized access
- Room names include 'silvercare' branding
- Automatic cleanup after 24 hours (meeting-server.js)
- Role-based URL parameters for identification

## Usage Flow
1. **Patient books online appointment**
2. **Payment is processed** → Appointment status = 'confirmed'
3. **Meeting link is automatically generated** and stored
4. **Doctor sees appointment** in dashboard with "Join Meeting" button
5. **Doctor clicks button** → Opens Jitsi Meet with doctor identification
6. **Patient receives meeting link** (via email/notification - to be implemented)
7. **Both join the same room** for consultation

## Next Steps
- [ ] Implement patient notification with meeting link
- [ ] Add meeting link to appointment emails
- [ ] Create patient dashboard with join meeting functionality
- [ ] Add meeting history and recording features
