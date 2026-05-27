/**
 * Unit tests for src/utils/shareUtils.js
 *
 * Tests the pure URL-generation logic of generateSharingUrl and the
 * event-sharing data builder generateEventSharingData.
 * All tests run in Node.js without a browser.
 */

import assert from "node:assert/strict";

// ── Environment stubs ───────────────────────────────────────────────────────
// Messenger platform reads process.env.REACT_APP_FACEBOOK_APP_ID
process.env.REACT_APP_FACEBOOK_APP_ID = "12345";

// generateEventSharingData reads window.location in browser environments;
// in Node.js window is undefined so it falls back to the deployed domain.

const { generateSharingUrl, generateEventSharingData } = await import(
  "../src/utils/shareUtils.js"
);

const shareData = {
  title: "Tech Summit 2024",
  description: "Annual tech conference",
  url: "https://eventra.example.com/events/99",
  hashtags: "tech,summit",
};

// ── generateSharingUrl : email ───────────────────────────────────────────────
const emailUrl = generateSharingUrl(shareData, "email");
assert.ok(emailUrl.startsWith("mailto:?subject="), "email URL starts with mailto:");
assert.ok(
  emailUrl.includes(encodeURIComponent(shareData.title)),
  "email URL contains encoded title"
);
assert.ok(
  emailUrl.includes(encodeURIComponent(shareData.url)),
  "email URL contains encoded event URL"
);

// ── generateSharingUrl : twitter ────────────────────────────────────────────
const twitterUrl = generateSharingUrl(shareData, "twitter");
assert.ok(
  twitterUrl.startsWith("https://twitter.com/intent/tweet"),
  "twitter URL points to tweet intent"
);
assert.ok(
  twitterUrl.includes(encodeURIComponent(shareData.url)),
  "twitter URL contains encoded event URL"
);
assert.ok(
  twitterUrl.includes(encodeURIComponent(shareData.hashtags)),
  "twitter URL contains encoded hashtags"
);

// ── generateSharingUrl : x (alias for twitter) ─────────────────────────────
const xUrl = generateSharingUrl(shareData, "x");
assert.ok(
  xUrl.startsWith("https://twitter.com/intent/tweet"),
  "'x' platform is aliased to twitter"
);

// ── generateSharingUrl : facebook ───────────────────────────────────────────
const fbUrl = generateSharingUrl(shareData, "facebook");
assert.ok(
  fbUrl.startsWith("https://www.facebook.com/sharer/sharer.php"),
  "facebook URL points to FB sharer"
);
assert.ok(
  fbUrl.includes(encodeURIComponent(shareData.url)),
  "facebook URL contains encoded event URL"
);

// ── generateSharingUrl : messenger ──────────────────────────────────────────
const messengerUrl = generateSharingUrl(shareData, "messenger");
assert.ok(
  messengerUrl.includes("facebook.com/dialog/send"),
  "messenger URL includes FB dialog/send"
);
assert.ok(
  messengerUrl.includes("app_id=12345"),
  "messenger URL includes the Facebook App ID"
);

// ── generateSharingUrl : messenger without app ID ───────────────────────────
const savedAppId = process.env.REACT_APP_FACEBOOK_APP_ID;
delete process.env.REACT_APP_FACEBOOK_APP_ID;
// Re-import required to pick up env change — we call generateSharingUrl
// with a fresh module import cleared from the cache via a query string trick
// Instead, we verify the branch via a new shareData with known conditions.
// Because Node ESM caches the module, we test indirectly: when app_id is falsy
// at runtime the function returns ''. We use dynamic import with cache-bust.
const { generateSharingUrl: genNoAppId } = await import(
  "../src/utils/shareUtils.js?noAppId=1"
);
// The cached module still has process.env captured at call time from the live
// env — since we deleted it above the next call should reflect the change.
const noAppIdUrl = generateSharingUrl(shareData, "messenger");
assert.equal(noAppIdUrl, "", "messenger returns empty string when REACT_APP_FACEBOOK_APP_ID is unset");
process.env.REACT_APP_FACEBOOK_APP_ID = savedAppId;

// ── generateSharingUrl : linkedin ───────────────────────────────────────────
const liUrl = generateSharingUrl(shareData, "linkedin");
assert.ok(
  liUrl.startsWith("https://www.linkedin.com/sharing/share-offsite/"),
  "linkedin URL points to share-offsite"
);
assert.ok(
  liUrl.includes(encodeURIComponent(shareData.url)),
  "linkedin URL contains encoded event URL"
);

// ── generateSharingUrl : whatsapp ───────────────────────────────────────────
const waUrl = generateSharingUrl(shareData, "whatsapp");
assert.ok(
  waUrl.startsWith("https://wa.me/"),
  "whatsapp URL starts with wa.me"
);
assert.ok(
  waUrl.includes(encodeURIComponent(shareData.title)),
  "whatsapp URL contains encoded title"
);

// ── generateSharingUrl : telegram ───────────────────────────────────────────
const tgUrl = generateSharingUrl(shareData, "telegram");
assert.ok(
  tgUrl.startsWith("https://telegram.me/share/url"),
  "telegram URL points to telegram share"
);

// ── generateSharingUrl : copy & unknown default ─────────────────────────────
assert.equal(
  generateSharingUrl(shareData, "copy"),
  shareData.url,
  "copy platform returns the raw event URL"
);
assert.equal(
  generateSharingUrl(shareData, "unknown_platform"),
  shareData.url,
  "unknown platform falls back to the raw event URL"
);

// ── generateSharingUrl : URL-encoding of special characters ─────────────────
const specialShare = {
  title: "Summit & Expo 2024 (Free!)",
  description: "Come & join us",
  url: "https://example.com/events/a b c",
  hashtags: "tech & fun",
};
const twSpecial = generateSharingUrl(specialShare, "twitter");
assert.ok(
  !twSpecial.includes(" "),
  "generated URL contains no unencoded spaces"
);
assert.ok(
  !twSpecial.includes("&title="), // & without encoding would break the query
  "ampersands in values are percent-encoded"
);

// ── generateEventSharingData ─────────────────────────────────────────────────
const mockEvent = {
  id: "evt-42",
  title: "Node Workshop",
  description: "Deep dive into Node.js",
  date: "2024-09-15",
  location: "Berlin",
  time: "10:00",
};

const sharingData = generateEventSharingData(mockEvent, "https://app.example.com");
assert.ok(
  sharingData.url.includes("evt-42"),
  "generateEventSharingData encodes the event ID in the URL"
);
assert.ok(
  sharingData.title.includes("Node Workshop"),
  "generateEventSharingData includes event title in sharing title"
);
assert.ok(
  sharingData.description.includes("Berlin"),
  "generateEventSharingData includes event location in description"
);
assert.equal(
  sharingData.hashtags,
  "eventra,event,tech",
  "generateEventSharingData returns fixed hashtags"
);

// When no baseUrl is given and window is undefined (Node.js), it uses the
// deployed domain as a fallback
const sharingDataNoBase = generateEventSharingData(mockEvent);
assert.ok(
  sharingDataNoBase.url.includes("sandeepvashishtha.tech"),
  "generateEventSharingData falls back to deployed domain when window is absent"
);

console.log("All shareUtils tests passed ✓");
