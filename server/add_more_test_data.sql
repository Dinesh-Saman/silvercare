-- Add more test appointments for doctor_id 2

-- Future appointments
INSERT INTO appointment (elder_id, family_id, doctor_id, date_time, status, notes)
VALUES 
  (1, 2, 2, '2025-07-22 09:00:00', 'confirmed', 'Weekly checkup'),
  (1, 2, 2, '2025-07-23 14:00:00', 'confirmed', 'Follow-up consultation'),
  (1, 2, 2, '2025-07-25 11:30:00', 'confirmed', 'Regular appointment');

-- Add more today's appointments if needed
INSERT INTO appointment (elder_id, family_id, doctor_id, date_time, status, notes)
VALUES 
  (1, 2, 2, '2025-07-20 16:30:00', 'confirmed', 'Afternoon consultation'),
  (1, 2, 2, '2025-07-20 18:00:00', 'confirmed', 'Evening consultation');

-- Add valid temporary bookings (expires tomorrow)
INSERT INTO temporary_booking (
  elder_id, family_id, doctor_id, date_time, appointment_type, 
  patient_name, contact_number, symptoms, notes, emergency_contact, 
  preferred_platform, expires_at
)
VALUES 
  (16, 2, 2, '2025-07-23 10:00:00', 'online', 'Online Patient 1', '0771234567', 'Online consultation', 'Online booking', '0771234567', 'zoom', '2025-07-21 23:59:59'),
  (16, 2, 2, '2025-07-24 15:00:00', 'physical', 'Walk-in Patient', '0771234568', 'Physical consultation', 'Walk-in booking', '0771234568', null, '2025-07-21 23:59:59');
