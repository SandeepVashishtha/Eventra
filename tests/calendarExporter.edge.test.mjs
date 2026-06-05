import assert from "node:assert/strict";
import { generateGoogleCalendarLink, generateOutlookLink } from "../src/utils/calendarExporter.js";

const event = { title: "Test Event", description: "Desc", location: "Loc", date: "2026-06-01T10:00:00Z", endDate: "2026-06-01T11:00:00Z" };
const googleUrl = generateGoogleCalendarLink(event);
assert.ok(googleUrl.includes("action=TEMPLATE"));
assert.ok(googleUrl.includes("text=Test+Event"));
console.log("calendarExporter edge tests passed ✓");
