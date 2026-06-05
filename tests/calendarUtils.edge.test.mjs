import assert from "node:assert/strict";
import { generateGoogleCalendarUrl } from "../src/utils/calendarUtils.js";

const eventData = { title: "Test Event", description: "Desc", location: "Loc", startDate: "2026-06-01", endDate: "2026-06-01" };
const url = generateGoogleCalendarUrl(eventData);
assert.ok(url.includes("action=TEMPLATE"));
assert.ok(url.includes("text=Test%20Event"));
console.log("calendarUtils edge tests passed ✓");
