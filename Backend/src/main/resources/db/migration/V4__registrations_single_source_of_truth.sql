-- Make event_registrations the single source of truth for attendance.
-- Backfill any join-table-only rows, resync denormalized counters, then drop event_attendees.

INSERT INTO event_registrations (event_id, user_id, registered_at, status, show_profile_in_attendee_directory)
SELECT ea.event_id,
       ea.user_id,
       CURRENT_TIMESTAMP,
       'CONFIRMED',
       FALSE
FROM event_attendees ea
WHERE NOT EXISTS (
    SELECT 1
    FROM event_registrations er
    WHERE er.event_id = ea.event_id
      AND er.user_id = ea.user_id
);

UPDATE events e
SET registered_count = (
    SELECT COUNT(*)
    FROM event_registrations r
    WHERE r.event_id = e.id
      AND r.status = 'CONFIRMED'
);

DROP TABLE IF EXISTS event_attendees;
