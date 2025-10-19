# Counselor Appointments in Elder Dashboard - Implementation Complete ✅

## Problem
Counselor appointments were stored in the `counselor_appointment` table but were not appearing in the elder dashboard. The dashboard was querying the old `session` table instead.

## Solution Implemented

### 1. Updated Backend Controllers

#### `server/controllers/session.js`
Modified all functions to query from `counselor_appointment` table instead of `session` table:

- **`getUpcomingSessions()`**: Now fetches from `counselor_appointment` where `date_time > NOW()` and `status = 'confirmed'`
- **`getPastSessions()`**: Now fetches from `counselor_appointment` where `date_time <= NOW()` or `status IN ('completed', 'cancelled')`
- **`getAllSessions()`**: Now fetches all records from `counselor_appointment` ordered by date
- **`getSessionById()`**: Now fetches specific appointment from `counselor_appointment` by `appointment_id`
- **`joinSession()`**: Now handles joining counselor appointments using `appointment_type` and `meeting_link` fields

**Key Changes:**
- Changed table from `session s` to `counselor_appointment ca`
- Changed field mapping:
  - `session_id` → `appointment_id as session_id`
  - `session_notes` → `notes as session_notes`
  - `session_type` → `appointment_type as session_type`
- Added `meeting_link` field from `counselor_appointment`

#### `server/controllers/elder.js`
Updated dashboard stats query:

- **`getElderDashboardStats()`**: Changed upcoming sessions count query to use `counselor_appointment` table
- Added error handling for missing `campaignbooking` table (gracefully returns 0 if table doesn't exist)

**Before:**
```sql
SELECT COUNT(*) as count
FROM session 
WHERE elder_id = $1 
AND date_time > NOW()
AND status IN ('confirmed')
```

**After:**
```sql
SELECT COUNT(*) as count
FROM counselor_appointment 
WHERE elder_id = $1 
AND date_time > NOW()
AND status IN ('confirmed')
AND status != 'cancelled'
```

### 2. API Endpoints (No Changes Needed)

The following endpoints already exist and now return counselor appointments:

- `GET /api/elders/:elderId/dashboard-stats` - Returns count of upcoming counselor appointments
- `GET /api/elders/:elderId/sessions/upcoming?limit=2` - Returns upcoming counselor appointments
- `GET /api/elders/:elderId/sessions/past?limit=2` - Returns past counselor appointments
- `GET /api/elders/:elderId/sessions` - Returns all counselor appointments
- `GET /api/elders/:elderId/sessions/:sessionId` - Returns specific counselor appointment
- `POST /api/elders/:elderId/sessions/:sessionId/join` - Joins online counselor appointment

### 3. Frontend (No Changes Needed)

The frontend code in `client/src/pages/elder/dashboard.js` already uses the correct API calls:
- `getElderDashboardStats()` - Displays count in stats card
- `getUpcomingSessions()` - Fetches upcoming sessions
- `getPastSessions()` - Fetches past sessions
- `joinSession()` - Allows joining online sessions

The UI section "Your Counselling Sessions" will now display counselor appointments correctly.

## Database Schema

### counselor_appointment Table
```sql
CREATE TABLE counselor_appointment (
  appointment_id SERIAL PRIMARY KEY,
  elder_id INTEGER REFERENCES elder(elder_id),
  family_id INTEGER REFERENCES family_member(family_id),
  counselor_id INTEGER REFERENCES counselor(counselor_id),
  date_time TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'confirmed',
  appointment_type VARCHAR(50),  -- 'online' or 'physical'
  notes TEXT,
  meeting_link VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Testing Results

### Test Elder: mahinda (ID: 28, Email: mahinda@gmail.com)

#### Database Query Results:
- Total counselor appointments: 11
- Upcoming appointments for mahinda: 1
- Upcoming appointment details:
  - Counselor: malinga
  - Date: Thu Oct 30 2025 12:00:00
  - Status: confirmed
  - Type: online
  - Meeting Link: Available

#### API Endpoint Results:
✅ `GET /api/elders/28/dashboard-stats`
```json
{
  "success": true,
  "stats": {
    "upcomingAppointments": 3,
    "upcomingSessions": 1,  // ← Counselor appointment count
    "upcomingCampaigns": 0,
    "assignedCaregivers": 0
  }
}
```

✅ `GET /api/elders/28/sessions/upcoming?limit=2`
```json
{
  "success": true,
  "sessions": [
    {
      "session_id": 25,
      "elder_id": 28,
      "counselor_id": 4,
      "date_time": "2025-10-30T06:30:00.000Z",
      "status": "confirmed",
      "session_type": "online",
      "meeting_link": "https://meet.jit.si/silvercare-...",
      "counselor_name": "malinga",
      "counselor_email": "malinga@gmail.com",
      "specialization": "Family Therapy"
    }
  ],
  "count": 1
}
```

## Verification Steps

1. ✅ Server starts without errors
2. ✅ Dashboard stats API returns correct counselor appointment count
3. ✅ Upcoming sessions API returns counselor appointments from `counselor_appointment` table
4. ✅ Past sessions API works correctly
5. ✅ All sessions API returns complete list
6. ✅ Session data includes all necessary fields (meeting_link, counselor details, etc.)

## Frontend Display

The elder dashboard will now show:

1. **Stats Card**: "Upcoming Sessions" displays count of upcoming counselor appointments
2. **Counselling Sessions Section**: 
   - "Upcoming" tab shows future counselor appointments
   - "Past" tab shows completed/cancelled counselor appointments
   - Each session card displays counselor name, date, time, type, and join button (for online sessions)
3. **"Show All Sessions" button**: Links to full session history page

## Files Modified

1. `server/controllers/session.js` - Updated all session queries to use `counselor_appointment` table
2. `server/controllers/elder.js` - Updated dashboard stats query and added error handling

## Testing Scripts Created

1. `server/test_counselor_dashboard.js` - Tests database queries for counselor appointments
2. `server/test_dashboard_api.js` - Tests API endpoints
3. `server/test_dashboard_stats_direct.js` - Tests individual stat queries

## Next Steps for User

1. **Login as an elder** who has counselor appointments (e.g., mahinda@gmail.com)
2. **Navigate to the dashboard**
3. **Verify**:
   - The "Upcoming Sessions" stat shows the correct count
   - The "Your Counselling Sessions" section displays counselor appointments
   - The "Join" button appears for online sessions
   - Past sessions appear in the "Past" tab

## Notes

- The old `session` table is no longer used for counselor appointments
- All new counselor bookings should go into the `counselor_appointment` table
- The frontend code required no changes as it was already using the correct API endpoints
- Error handling added for missing `campaignbooking` table to prevent dashboard crashes

## Status: ✅ COMPLETE

Counselor appointments from the `counselor_appointment` table now appear correctly in the elder dashboard's "Your Counselling Sessions" section.
