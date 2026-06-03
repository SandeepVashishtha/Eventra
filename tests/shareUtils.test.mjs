/**
 * Unit tests for src/utils/shareUtils.js
 */

import assert from "node:assert/strict";

const { generateSharingUrl, generateEventSharingData } = await import("../src/utils/shareUtils.js");

const shareData = {
  title: "Tech Summit 2024",
  description: "Annual tech conference",
  url: "/events/99",
  hashtags: "tech,summit",
};

const emailUrl = generateSharingUrl(shareData, "email");
assert.ok(emailUrl.startsWith("mailto:?subject="));
assert.ok(emailUrl.includes(encodeURIComponent(shareData.title)));
assert.ok(emailUrl.includes(encodeURIComponent(shareData.url)));

const twitterUrl = generateSharingUrl(shareData, "twitter");
assert.ok(twitterUrl.startsWith("https://twitter.com/intent/tweet"));
assert.ok(twitterUrl.includes(encodeURIComponent(shareData.url)));
assert.ok(twitterUrl.includes(encodeURIComponent(shareData.hashtags)));

const xUrl = generateSharingUrl(shareData, "x");
assert.ok(xUrl.startsWith("https://twitter.com/intent/tweet"));

const fbUrl = generateSharingUrl(shareData, "facebook");
assert.ok(fbUrl.startsWith("https://www.facebook.com/sharer/sharer.php"));
assert.ok(fbUrl.includes(encodeURIComponent(shareData.url)));

const messengerUrl = generateSharingUrl(shareData, "messenger");
assert.equal(messengerUrl, "", "messenger sharing is intentionally disabled");

const liUrl = generateSharingUrl(shareData, "linkedin");
assert.ok(liUrl.startsWith("https://www.linkedin.com/sharing/share-offsite/"));
assert.ok(liUrl.includes(encodeURIComponent(shareData.url)));

const waUrl = generateSharingUrl(shareData, "whatsapp");
assert.ok(waUrl.startsWith("https://wa.me/"));
assert.ok(waUrl.includes(encodeURIComponent(shareData.title)));

const tgUrl = generateSharingUrl(shareData, "telegram");
assert.ok(tgUrl.startsWith("https://telegram.me/share/url"));

assert.equal(generateSharingUrl(shareData, "copy"), shareData.url);
assert.equal(generateSharingUrl(shareData, "unknown_platform"), shareData.url);

const specialShare = {
  title: "Summit & Expo 2024 (Free!)",
  description: "Come & join us",
  url: "/events/a b c",
  hashtags: "tech & fun",
};

const twSpecial = generateSharingUrl(specialShare, "twitter");
assert.ok(!twSpecial.includes(" "));
assert.ok(!twSpecial.includes("&title="));

const mockEvent = {
  id: "evt-42",
  title: "Node Workshop",
  description: "Deep dive into Node.js",
  date: "2024-09-15",
  location: "Berlin",
  time: "10:00",
};

const sharingData = generateEventSharingData(mockEvent, "https://app.example.com");
assert.ok(sharingData.url.includes("evt-42"));
assert.ok(sharingData.title.includes("Node Workshop"));
assert.ok(sharingData.description.includes("Berlin"));
assert.equal(sharingData.hashtags, "eventra,event,tech");

const sharingDataNoBase = generateEventSharingData(mockEvent);
assert.ok(sharingDataNoBase.url.includes("sandeepvashishtha.tech"));

console.log("All shareUtils tests passed");
