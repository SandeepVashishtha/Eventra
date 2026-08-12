/**
 * Unit tests for the Messenger share dialog in src/utils/shareUtils.js
 * Run in a separate test file so env.js loads with REACT_APP_FB_APP_ID set.
 */

import assert from "node:assert/strict";

process.env.REACT_APP_FB_APP_ID = "123456789";

const { generateSharingUrl } = await import("../src/utils/shareUtils.js");

const shareData = {
  title: "Tech Summit 2024",
  description: "Annual tech conference",
  url: "/events/99",
  hashtags: "tech,summit",
};

const messengerUrl = generateSharingUrl(shareData, "messenger");
assert.ok(
  messengerUrl.startsWith("https://www.facebook.com/dialog/send"),
  "messenger URL must use the Facebook Send Dialog"
);
assert.ok(messengerUrl.includes(`app_id=${encodeURIComponent("123456789")}`), "app_id must be present");
assert.ok(messengerUrl.includes(`link=${encodeURIComponent(shareData.url)}`), "link must be the encoded share URL");
assert.ok(messengerUrl.includes(`redirect_uri=${encodeURIComponent(shareData.url)}`), "redirect_uri must be the encoded share URL");

console.log("All messenger share tests passed");
