CREATE TABLE IF NOT EXISTS event_team_members (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id    BIGINT      NOT NULL,
    user_id     BIGINT      NOT NULL,
    role        VARCHAR(20) NOT NULL,
    assigned_by BIGINT,
    assigned_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_event_team_member UNIQUE (event_id, user_id),
    CONSTRAINT fk_event_team_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT fk_event_team_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_event_team_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT ck_event_team_role CHECK (role IN ('OWNER', 'ORGANIZER', 'MODERATOR', 'ATTENDEE'))
);

CREATE TABLE IF NOT EXISTS event_role_audit_logs (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id       BIGINT      NOT NULL,
    target_user_id BIGINT      NOT NULL,
    actor_user_id  BIGINT,
    previous_role  VARCHAR(20),
    new_role       VARCHAR(20) NOT NULL,
    action         VARCHAR(20) NOT NULL,
    changed_at     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_event_role_audit_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT fk_event_role_audit_target FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_event_role_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_event_team_event_id ON event_team_members(event_id);
CREATE INDEX IF NOT EXISTS idx_event_team_user_id ON event_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_event_role_audit_event_id ON event_role_audit_logs(event_id);
