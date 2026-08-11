import assert from "node:assert/strict";
import {
  getSafeTokenExpiryDelayMs,
  getTokenExpiryDelayMs,
  MAX_TOKEN_EXPIRY_TIMEOUT_MS,
} from "../src/hooks/useTokenExpiry.js";

const nowMs = 1_700_000_000_000;

{
  const expSeconds = Math.floor((nowMs + 60_000) / 1000);
  assert.equal(
    getTokenExpiryDelayMs(expSeconds, nowMs),
    61_000,
    "adds the one-second expiry buffer to normal delays"
  );
  assert.equal(
    getSafeTokenExpiryDelayMs(expSeconds, nowMs),
    61_000,
    "keeps normal delays unchanged"
  );
}

{
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const expSeconds = Math.floor((nowMs + thirtyDaysMs) / 1000);

  assert.ok(
    getTokenExpiryDelayMs(expSeconds, nowMs) > MAX_TOKEN_EXPIRY_TIMEOUT_MS,
    "30-day remember-me tokens exceed the browser timeout limit"
  );
  assert.equal(
    getSafeTokenExpiryDelayMs(expSeconds, nowMs),
    MAX_TOKEN_EXPIRY_TIMEOUT_MS,
    "long-lived tokens are capped to avoid 32-bit setTimeout overflow"
  );
}

{
  const alreadyExpiredSeconds = Math.floor((nowMs - 5_000) / 1000);
  assert.equal(
    getSafeTokenExpiryDelayMs(alreadyExpiredSeconds, nowMs),
    0,
    "expired tokens still schedule an immediate validation"
  );
}

console.log("useTokenExpiry timeout tests passed");
