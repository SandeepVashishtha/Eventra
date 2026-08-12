-- Feedback table (matches Feedback.java entity exactly)
CREATE TABLE IF NOT EXISTS feedback (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id     BIGINT       NOT NULL,
    user_id      BIGINT       NOT NULL,
    rating       INT          NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment      VARCHAR(1000),
    submitted_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_feedback_event_user UNIQUE (event_id, user_id),
    CONSTRAINT fk_feedback_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE
);

-- Analytics performance indexes
CREATE INDEX IF NOT EXISTS idx_event_reg_registered_at ON event_registrations(registered_at);
CREATE INDEX IF NOT EXISTS idx_event_reg_event_id      ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reg_user_id       ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_reg_status        ON event_registrations(status);
CREATE INDEX IF NOT EXISTS idx_events_event_date       ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_feedback_event_id       ON feedback(event_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating         ON feedback(rating);
