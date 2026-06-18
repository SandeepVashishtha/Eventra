import assert from "node:assert/strict";

const { getGoogleCalendarUrl, getOutlookCalendarUrl } = await import(
  "../src/utils/calendarUrlUtils.js"
);

const mkEvent = (overrides = {}) => ({
  title: "Test Workshop",
  date: "2026-06-15",
  time: "10:00 AM",
  location: "Online",
  description: "A test workshop.",
  durationMinutes: 60,
  ...overrides,
});

const parseGoogleDates = (url) => {
  const match = url.match(/dates=([^&]+)/);
  assert.ok(match, "google url should include dates param");
  const [startStr, endStr] = decodeURIComponent(match[1]).split("/");
  const toMs = (value) => {
    const iso = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(9, 11)}:${value.slice(11, 13)}:${value.slice(13, 15)}Z`;
    return new Date(iso).getTime();
  };
  const startMs = toMs(startStr);
  const endMs = toMs(endStr);
  return endMs - startMs;
};

assert.equal(getGoogleCalendarUrl(null), "");
assert.equal(getOutlookCalendarUrl(null), "");

const googleUrl = getGoogleCalendarUrl(mkEvent({ title: "AI & ML Summit" }), "UTC");
assert.match(googleUrl, /calendar\.google\.com\/calendar\/render/);
assert.match(googleUrl, /AI%20%26%20ML%20Summit/);
assert.equal(parseGoogleDates(googleUrl), 60 * 60 * 1000);

const workshopUrl = getGoogleCalendarUrl(mkEvent({ durationMinutes: 180 }), "UTC");
assert.equal(parseGoogleDates(workshopUrl), 180 * 60 * 1000);

const outlookUrl = getOutlookCalendarUrl(mkEvent(), "UTC");
assert.match(outlookUrl, /outlook\.live\.com\/calendar/);
assert.match(outlookUrl, /startdt=/);
assert.match(outlookUrl, /enddt=/);

console.log("calendarUrlUtils tests passed ✓");
