-- Persist the event schedule end date/time (matches Event.endDate, issue #14603).
-- Column is nullable so existing rows keep the default "end == start" behavior.
ALTER TABLE events ADD COLUMN IF NOT EXISTS end_date TIMESTAMP;
