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

console.log("calendarUtils tests passed ✓");
