-- Add sample sessions for testing
INSERT INTO session (elder_id, family_id, counselor_id, date_time, session_notes, status, session_type) VALUES
(1, 1, 2, '2025-07-25 10:00:00', 'Initial consultation session', 'confirmed', 'online'),
(1, 1, 3, '2025-07-15 14:30:00', 'Follow-up session completed', 'completed', 'physical'),
(2, 1, 4, '2025-07-28 09:00:00', 'Family therapy session', 'confirmed', 'online'),
(2, 1, 5, '2025-07-10 16:00:00', 'Geriatric psychology assessment', 'completed', 'physical'),
(3, 2, 2, '2025-07-30 11:00:00', 'CBT session for anxiety management', 'confirmed', 'online');
