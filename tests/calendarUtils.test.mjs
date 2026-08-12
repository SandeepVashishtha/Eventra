import assert from "node:assert/strict";
import { generateGoogleCalendarUrl, addEventToGoogleCalendar, addHackathonToGoogleCalendar } from "../src/utils/calendarUtils.js";

const eventData = {
  title: "Hackathon Launch",
  description: "Intro session",
  location: "Main Hall",
  startDate: "2026-05-28",
  endDate: "2026-05-29"
};

const url = generateGoogleCalendarUrl(eventData);
assert.ok(url.includes("action=TEMPLATE"));
assert.ok(url.includes("text=Hackathon%20Launch"));

const event = {
  title: "Workshop",
  date: "2026-05-28",
  time: "10:00 AM"
};
const eventUrl = addEventToGoogleCalendar(event);
assert.ok(eventUrl.includes("Workshop"));

const hackathon = {
  title: "GSSoC Hack",
  startDate: "2026-05-28",
  endDate: "2026-05-30"
};
const hackUrl = addHackathonToGoogleCalendar(hackathon);
assert.ok(hackUrl.includes("GSSoC%20Hack"));

// Timed events must land on the organizer-specified date with the specified
// wall-clock time in the local timezone, regardless of the UTC offset.
const timeEventData = {
  title: "Timed Event",
  startDate: "2026-06-15",
  endDate: "2026-06-15",
  startTime: "10:00",
  endTime: "12:00",
};
const timeUrl = generateGoogleCalendarUrl(timeEventData);
const datesMatch = timeUrl.match(/dates=(\d{8})T(\d{6})Z\/(\d{8})T(\d{6})Z/);
assert.ok(datesMatch, "timed Google Calendar URLs use compact UTC format");

const parseCompactUtc = (datePart, timePart) =>
  new Date(
    `${datePart.slice(0, 4)}-${datePart.slice(4, 6)}-${datePart.slice(6, 8)}` +
    `T${timePart.slice(0, 2)}:${timePart.slice(2, 4)}:${timePart.slice(4, 6)}Z`
  );

const startLocal = new Date(parseCompactUtc(datesMatch[1], datesMatch[2]).getTime());
assert.equal(
  `${startLocal.getFullYear()}-${String(startLocal.getMonth() + 1).padStart(2, "0")}-${String(startLocal.getDate()).padStart(2, "0")}`,
  "2026-06-15",
  "timed events land on the organizer-specified date in the local timezone"
);
assert.equal(
  `${String(startLocal.getHours()).padStart(2, "0")}:${String(startLocal.getMinutes()).padStart(2, "0")}`,
  "10:00",
  "timed events preserve the organizer-specified wall-clock start time"
);

const endLocal = new Date(parseCompactUtc(datesMatch[3], datesMatch[4]).getTime());
assert.equal(
  `${String(endLocal.getHours()).padStart(2, "0")}:${String(endLocal.getMinutes()).padStart(2, "0")}`,
  "12:00",
  "timed events preserve the organizer-specified wall-clock end time"
);

console.log("calendarUtils tests passed ✓");
