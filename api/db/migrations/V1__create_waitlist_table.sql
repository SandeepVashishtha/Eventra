-- Eventra Waitlist Migration
-- Create the event_waitlist table to manage queued registrations for full events

CREATE TABLE event_waitlist (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    event_id INT NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'waiting',
    CONSTRAINT fk_event_waitlist_event FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_event_waitlist UNIQUE(user_id, event_id)
);
