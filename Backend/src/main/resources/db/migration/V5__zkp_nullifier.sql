-- Used ZKP nullifiers to guarantee one-time use of anonymous feedback proofs
CREATE TABLE IF NOT EXISTS zkp_nullifier (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    nullifier_hash VARCHAR(128) NOT NULL,
    event_id       VARCHAR(255) NOT NULL,
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_zkp_nullifier_hash UNIQUE (nullifier_hash)
);

CREATE INDEX IF NOT EXISTS idx_zkp_nullifier_event_id ON zkp_nullifier(event_id);
