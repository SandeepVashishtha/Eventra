-- Coupon inventory table (matches CouponInventory.java entity exactly).
-- Backs coupon redemption with transactional, DB-level inventory so a
-- rollback restores the consumed slot (see #14507).
CREATE TABLE IF NOT EXISTS coupon_inventory (
    code      VARCHAR(64) NOT NULL PRIMARY KEY,
    remaining INT         NOT NULL CHECK (remaining >= 0)
);

-- Preserve the sample coupon previously seeded in-memory by CouponService.
INSERT INTO coupon_inventory (code, remaining)
SELECT 'SUMMER10', 5
WHERE NOT EXISTS (SELECT 1 FROM coupon_inventory WHERE code = 'SUMMER10');
