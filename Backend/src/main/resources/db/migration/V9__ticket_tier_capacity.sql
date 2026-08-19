-- Ticket tier capacity table (matches TicketTier.java entity exactly).
-- Backs ticket purchases with transactional, DB-level capacity so concurrent
-- purchases across instances can never oversell and restarts preserve state
-- (see #17833).
CREATE TABLE IF NOT EXISTS ticket_tier (
    tier      VARCHAR(64) NOT NULL PRIMARY KEY,
    remaining INT         NOT NULL CHECK (remaining >= 0)
);

-- Preserve the tiers previously seeded in-memory by PurchaseService.
INSERT INTO ticket_tier (tier, remaining)
SELECT 'VIP', 50
WHERE NOT EXISTS (SELECT 1 FROM ticket_tier WHERE tier = 'VIP');

INSERT INTO ticket_tier (tier, remaining)
SELECT 'GENERAL', 150
WHERE NOT EXISTS (SELECT 1 FROM ticket_tier WHERE tier = 'GENERAL');
