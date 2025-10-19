# Counselor Appointment System - Implementation Complete ✅

## Problem Fixed
Healthcare professional (mental health) appointments were being stored in the same `appointment` table as doctor appointments, but only had `counselor_id` without a clear way to identify which professional the appointment belonged to.

## Solution Implemented

### 1. Separate Table for Counselor Appointments
- Created dedicated `counselor_appointment` table
- Stores all mental health professional appointments separately
- Includes all necessary fields: elder_id, family_id, counselor_id, date_time, status, appointment_type, meeting_link, etc.

### 2. Meeting Link Generation
- **Online appointments**: Automatically generate Jitsi meeting links (https://meet.jit.si/silvercare-{uuid})
- **Physical appointments**: meeting_link remains NULL
- Uses the same MeetingService as doctor appointments for consistency

### 3. Payment System Updates
- Added `counselor_appointment_id` column to payment table
- Payment records now link to either:
  - `appointment_id` (for doctor appointments)
  - `counselor_appointment_id` (for counselor appointments)

### 4. Unified API Responses
All appointment queries now return unified data with:
- `provider_id`: The ID of the provider (doctor_id or counselor_id)
- `provider_role`: 'doctor' or 'counselor'
- `provider_type`: 'doctor' or 'healthcare_professional'
- `provider_name`: Name of the provider
- `counselor_id`: Set for counselor appointments
- `doctor_id`: Set for doctor appointments
- `meeting_link`: Jitsi link for online sessions

## Database Schema

### counselor_appointment Table
```sql
CREATE TABLE counselor_appointment (
  appointment_id SERIAL PRIMARY KEY,
  elder_id INTEGER REFERENCES elder(elder_id),
  family_id INTEGER,
  counselor_id INTEGER REFERENCES counselor(counselor_id),
  date_time TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL,
  appointment_type VARCHAR(20) NOT NULL CHECK (appointment_type IN ('online', 'physical')),
  meeting_link TEXT,
  notes TEXT,
  patient_name TEXT,
  contact_number TEXT,
  emergency_contact TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### payment Table Updates
```sql
ALTER TABLE payment 
  ADD COLUMN counselor_appointment_id INTEGER REFERENCES counselor_appointment(appointment_id),
  ALTER COLUMN appointment_id DROP NOT NULL;
```

## API Endpoints Updated

### 1. Create Healthcare Professional Appointment
- **Endpoint**: `POST /api/elders/:elderId/healthcare-professional-confirm-payment`
- **Behavior**: Creates appointment in `counselor_appointment` table
- **Meeting Link**: Generated automatically for online appointments

### 2. Get Elder Appointments
- **Endpoint**: `GET /api/elders/:elderId/appointments`
- **Behavior**: UNION query returns both doctor and counselor appointments with provider details

### 3. Get Upcoming Appointments by Family
- **Endpoint**: (family member dashboard)
- **Behavior**: Shows both doctor and counselor appointments with provider details

## Migration Completed
- ✅ All existing counselor appointments migrated from `appointment` to `counselor_appointment`
- ✅ All associated payment records updated to reference `counselor_appointment_id`
- ✅ Old counselor entries removed from `appointment` table
- ✅ 10 appointments migrated successfully

## Testing & Verification

### Run These Scripts to Verify:
```powershell
# 1. Check system status
node server/test_counselor_appointment_system.js

# 2. View recent counselor appointments
node server/verify_counselor_appointments.js
```

### Expected Results:
1. New healthcare appointments appear in `counselor_appointment` table
2. Online appointments have Jitsi meeting links
3. Payment records link to `counselor_appointment_id`
4. Elder dashboard shows both doctor and counselor appointments
5. Each appointment clearly identifies the relevant professional

## How It Works Now

### Creating a Healthcare Appointment:
1. Family member selects counselor and appointment details
2. System creates temporary booking
3. After payment confirmation:
   - Appointment created in `counselor_appointment` table
   - Meeting link generated (if online)
   - Payment record created with `counselor_appointment_id`
   - Elder can see appointment with counselor details

### Viewing Appointments:
- Elder/Family sees unified list with:
  - Doctor appointments (from `appointment` table)
  - Counselor appointments (from `counselor_appointment` table)
- Each clearly shows:
  - Provider name
  - Provider role (doctor/counselor)
  - Meeting link (for online sessions)
  - Appointment type and status

## Files Modified/Created

### New Files:
- `server/add_or_update_counselor_appointment_table.js` - Table creation
- `server/add_counselor_appointment_id_to_payment.js` - Payment table update
- `server/fix_counselor_appointment_schema.js` - Schema fixes
- `server/migrate_counselor_appointments.js` - Data migration
- `server/test_counselor_appointment_system.js` - Testing script
- `server/verify_counselor_appointments.js` - Verification script

### Modified Files:
- `server/controllers/elderController.js`
  - Updated `createHealthProfessionalAppointment`
  - Updated `confirmPaymentAndCreateHealthcareProfessionalAppointment`
  - Updated `getElderAppointments`
  - Updated `getUpcomingAppointmentsByFamily`
- `server/services/meetingService.js`
  - Added `ensureCounselorMeetingLink` method

## Benefits
1. ✅ Clear separation between doctor and counselor appointments
2. ✅ Each appointment clearly identifies the relevant professional
3. ✅ Meeting links work for both doctors and counselors (online sessions)
4. ✅ Payment tracking for both appointment types
5. ✅ Unified user experience in the UI
6. ✅ No confusion about which provider the appointment is with

## Next Steps for UI
The frontend should now:
1. Use `provider_role` to determine if appointment is with doctor or counselor
2. Use `provider_id` + `provider_role` for provider profile links
3. Display `provider_name` for the professional's name
4. Show `meeting_link` for online sessions
5. Handle both `doctor_id` and `counselor_id` appropriately

---
**Status**: ✅ COMPLETE - Ready for testing in production
**Date**: October 18, 2025
