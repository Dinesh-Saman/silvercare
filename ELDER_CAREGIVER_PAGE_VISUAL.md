# Elder Caregiver Page - Visual Structure

## Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│                         NAVBAR                              │
└─────────────────────────────────────────────────────────────┘
┌──────────┬──────────────────────────────────────────────────┐
│          │                                                  │
│  ELDER   │  ╔════════════════════════════════════════════╗ │
│ SIDEBAR  │  ║   👨‍⚕️ My Caregivers                        ║ │
│          │  ║   View and manage your care assignments    ║ │
│  - Home  │  ╚════════════════════════════════════════════╝ │
│  - Prof  │                                                  │
│  - Appt  │  ┌──────────────────────────────────────────┐  │
│  - Care  │  │ 📅 UPCOMING CARE SCHEDULE                │  │
│  - Chat  │  │ Your scheduled care sessions...          │  │
│  - etc   │  ├──────────────────────────────────────────┤  │
│          │  │ ┌────────────┐  ┌────────────┐          │  │
│          │  │ │ 👨‍⚕️        │  │ 👨‍⚕️        │          │  │
│          │  │ │ John Doe   │  │ Jane Smith │          │  │
│          │  │ │ Approved   │  │ Approved   │          │  │
│          │  │ │            │  │            │          │  │
│          │  │ │ 📞 Phone   │  │ 📞 Phone   │          │  │
│          │  │ │ 📍 District│  │ 📍 District│          │  │
│          │  │ │ 📆 Dates   │  │ 📆 Dates   │          │  │
│          │  │ │ 🎓 Certs   │  │ 🎓 Certs   │          │  │
│          │  │ └────────────┘  └────────────┘          │  │
│          │  └──────────────────────────────────────────┘  │
│          │                                                  │
│          │  ┌──────────────────────────────────────────┐  │
│          │  │ 📆 MY CARE ASSIGNMENTS                   │  │
│          │  │ Monthly calendar view...                 │  │
│          │  ├──────────────────────────────────────────┤  │
│          │  │  ◀ Prev Month  │ November 2025 │ Next ▶ │  │
│          │  ├──────────────────────────────────────────┤  │
│          │  │ Sun  Mon  Tue  Wed  Thu  Fri  Sat       │  │
│          │  ├──────────────────────────────────────────┤  │
│          │  │  1    2    3    4    5    6    7        │  │
│          │  │  8    9   10   11   12   13   14        │  │
│          │  │ 15   16   17   18   19   20   21        │  │
│          │  │ 22   23   24   25   26   27   28        │  │
│          │  │ 29   30                                  │  │
│          │  │                                          │  │
│          │  │ Days with caregivers = Blue highlight   │  │
│          │  │ Today's date = Green highlight          │  │
│          │  │ Click any day to see details            │  │
│          │  └──────────────────────────────────────────┘  │
└──────────┴──────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Page Header (Blue Gradient)
```
╔════════════════════════════════════════════╗
║ 👨‍⚕️ My Caregivers                          ║
║ View and manage your care assignments     ║
╚════════════════════════════════════════════╝
```

### 2. Upcoming Care Schedule Section
```
┌─────────────────────────────────────────────┐
│ 📅 Upcoming Care Schedule                   │
│ Your scheduled care sessions in coming days │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────┐           │
│  │ ╔═════╗                     │           │
│  │ ║ 👨‍⚕️ ║ Caregiver Name      │           │
│  │ ╚═════╝ [Approved]          │           │
│  ├─────────────────────────────┤           │
│  │ 📞 Phone: 0771234567        │           │
│  │ ☎️ Fixed: 0112345678        │           │
│  │ 📍 District: Colombo        │           │
│  │ 📆 Start: Nov 1, 2025       │           │
│  │ 📆 End: Nov 30, 2025        │           │
│  │ ⏱️ Duration: 1 month        │           │
│  │ 🎓 Certifications: ...      │           │
│  └─────────────────────────────┘           │
└─────────────────────────────────────────────┘
```

### 3. Monthly Calendar Grid
```
┌──────────────────────────────────────────────────┐
│ 📆 My Care Assignments                           │
│ Monthly calendar view of your care schedule      │
├──────────────────────────────────────────────────┤
│                                                  │
│  ◀ Previous Month │ November 2025 │ Next Month ▶│
│                                                  │
├──────────────────────────────────────────────────┤
│  Sun    Mon    Tue    Wed    Thu    Fri    Sat  │
├──────────────────────────────────────────────────┤
│  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐│
│  │ 1 │  │ 2 │  │ 3 │  │ 4 │  │ 5 │  │ 6 │  │ 7 ││
│  │   │  │   │  │👤 │  │👤 │  │   │  │   │  │   ││
│  └───┘  └───┘  └───┘  └───┘  └───┘  └───┘  └───┘│
│                 John   John                      │
│                                                  │
│  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐│
│  │ 8 │  │ 9 │  │10 │  │11 │  │12 │  │13 │  │14 ││
│  │   │  │   │  │👤 │  │👤 │  │   │  │   │  │   ││
│  └───┘  └───┘  └───┘  └───┘  └───┘  └───┘  └───┘│
│                 John   John                      │
│  ...                                             │
└──────────────────────────────────────────────────┘

Legend:
- Blue background = Has caregiver assignment
- Green background = Today's date
- "Today" badge = Current day indicator
- Click to view details
```

### 4. Day Details Modal (When clicking a day)
```
┌─────────────────────────────────────────┐
│ Care Assignments                    [×] │
│ November 3, 2025                        │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ ╔═══╗                             │ │
│  │ ║👨‍⚕️║ John Doe                    │ │
│  │ ╚═══╝ [Approved]                  │ │
│  ├───────────────────────────────────┤ │
│  │ 📞 Phone: 0771234567              │ │
│  │ ☎️ Fixed Line: 0112345678         │ │
│  │ 📍 District: Colombo              │ │
│  │ 📧 Email: john@example.com        │ │
│  │ 📆 Start Date: November 1, 2025   │ │
│  │ 📆 End Date: November 30, 2025    │ │
│  │ ⏱️ Duration: 1 month              │ │
│  │ 🎓 Certifications:                │ │
│  │    First Aid, CPR Certified       │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

## Color Scheme

- **Primary Blue**: #3b82f6 (Action buttons, highlights)
- **Success Green**: #10b981 (Today indicator, approved status)
- **Background**: #f8fafc (Page background)
- **White**: #ffffff (Cards, modals)
- **Text Dark**: #1e293b (Primary text)
- **Text Gray**: #64748b (Secondary text)
- **Border**: #e2e8f0 (Card borders)

## Interactive Elements

1. **Month Navigation**
   - "◀ Previous Month" button
   - "Next Month ▶" button
   - "This Month" quick jump button (appears when not on current month)

2. **Calendar Days**
   - Clickable if has assignments
   - Hover effect (slight elevation)
   - Different styling for today vs regular days

3. **Modal**
   - Click outside to close
   - X button to close
   - Smooth fade-in animation
   - Scrollable content if many assignments

## Responsive Behavior

### Desktop (> 1024px)
- Upcoming cards: 2-3 per row
- Full calendar grid visible
- Larger text and spacing

### Tablet (768px - 1024px)
- Upcoming cards: 2 per row
- Slightly condensed calendar
- Medium text size

### Mobile (< 768px)
- Upcoming cards: 1 per row (full width)
- Calendar grid with smaller days
- Navigation stacks vertically
- Modal fills 95% of screen

## Data Flow

```
User Action → Frontend Component → API Call → Backend Controller
                                                    ↓
User sees result ← React State ← API Response ← Database Query
```

Example:
1. User navigates to /elder/caregivers
2. useEffect triggers on mount
3. Fetches elder details by email
4. Fetches upcoming assignments
5. Fetches monthly assignments for current month
6. Renders UI with data
7. User clicks a day
8. Modal opens with detailed assignment info

## Status Badges

```
[Approved]   = Green gradient badge
[Completed]  = Green gradient badge
[Cancelled]  = Gray badge (if shown)
[Pending]    = Yellow badge (if shown)
```

## Empty States

### No Upcoming Assignments
```
┌─────────────────────────────────┐
│         📋                      │
│  No Upcoming Care Sessions      │
│                                 │
│  You don't have any care        │
│  sessions scheduled at the      │
│  moment.                        │
└─────────────────────────────────┘
```

### Calendar Day with No Assignment
```
┌─────┐
│  15 │
│     │
│  No │
│ care│
│giver│
└─────┘
```

## Loading States

```
┌─────────────────────────────────┐
│         ⏳                      │
│   (spinning animation)          │
│                                 │
│  Loading your care              │
│  information...                 │
└─────────────────────────────────┘
```
