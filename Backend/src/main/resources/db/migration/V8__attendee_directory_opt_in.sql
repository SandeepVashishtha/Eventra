ALTER TABLE event_registrations
    ADD COLUMN IF NOT EXISTS show_profile_in_attendee_directory BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS profile_headline VARCHAR(160);

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255);

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS github_url VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_event_reg_attendee_directory
    ON event_registrations(event_id, show_profile_in_attendee_directory, registered_at);
