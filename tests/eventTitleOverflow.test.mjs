import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Paths to files modified for title overflow
const paths = {
  EventCard: path.resolve(__dirname, "../src/Pages/Events/EventCard.js"),
  WhatsHappening: path.resolve(__dirname, "../src/Pages/Home/components/WhatsHappening.js"),
  EventRecommendation: path.resolve(__dirname, "../src/Pages/EventRecommendation/EventRecommendation.jsx"),
  EventRecommendationsComponent: path.resolve(__dirname, "../src/components/events/EventRecommendations.jsx"),
  SavedEventsPage: path.resolve(__dirname, "../src/Pages/SavedEventsPage.jsx"),
  CalendarPage: path.resolve(__dirname, "../src/Pages/Calendar/CalendarPage.jsx"),
  MyCalendar: path.resolve(__dirname, "../src/Pages/Calendar/MyCalendar.jsx"),
  EventRegistration: path.resolve(__dirname, "../src/Pages/Events/EventRegistration.js"),
  EventDetails: path.resolve(__dirname, "../src/Pages/Events/EventDetails.js"),
  RemindersPage: path.resolve(__dirname, "../src/Pages/Events/RemindersPage.js"),
  RecentlyViewedEventsCss: path.resolve(__dirname, "../src/components/common/RecentlyViewedEvents.css"),
  UserDashboardJs: path.resolve(__dirname, "../src/components/user/UserDashboard.js"),
  UserDashboardCss: path.resolve(__dirname, "../src/components/user/UserDashboard.css"),
  NotFound: path.resolve(__dirname, "../src/components/NotFound.js"),
};

describe("Event Title Overflow Prevention Integrity Tests", () => {
  it("should verify EventCard has break-words, min-w-0, and title attribute", () => {
    const src = readFileSync(paths.EventCard, "utf8");
    assert.ok(src.includes("break-words"), "EventCard should wrap long words");
    assert.ok(src.includes("min-w-0"), "EventCard title should have min-w-0 for flex layout");
    assert.ok(src.includes("title={event.title}"), "EventCard title should have title attribute");
  });

  it("should verify WhatsHappening has line-clamp-2, break-words, and title attribute", () => {
    const src = readFileSync(paths.WhatsHappening, "utf8");
    assert.ok(src.includes("line-clamp-2"), "WhatsHappening should clamp long titles");
    assert.ok(src.includes("break-words"), "WhatsHappening should wrap long words");
    assert.ok(src.includes("title={event.title}"), "WhatsHappening title should have title attribute");
  });

  it("should verify EventRecommendation page has break-words, clamp, and title attribute", () => {
    const src = readFileSync(paths.EventRecommendation, "utf8");
    assert.ok(src.includes("break-words"), "EventRecommendation should wrap long words");
    assert.ok(src.includes("line-clamp-2"), "EventRecommendation should clamp long titles");
    assert.ok(src.includes("title={event.title}"), "EventRecommendation should have title attribute");
  });

  it("should verify EventRecommendations component has break-words, clamp, and title attribute", () => {
    const src = readFileSync(paths.EventRecommendationsComponent, "utf8");
    assert.ok(src.includes("break-words"), "EventRecommendations should wrap long words");
    assert.ok(src.includes("line-clamp-2"), "EventRecommendations should clamp long titles");
    assert.ok(src.includes("title={event.title}"), "EventRecommendations should have title attribute");
  });

  it("should verify SavedEventsPage has line-clamp-2, break-words, and title attribute", () => {
    const src = readFileSync(paths.SavedEventsPage, "utf8");
    assert.ok(src.includes("line-clamp-2"), "SavedEventsPage should clamp long titles");
    assert.ok(src.includes("break-words"), "SavedEventsPage should wrap long words");
    assert.ok(src.includes("title={event.title || event.name}"), "SavedEventsPage should have title attribute");
  });

  it("should verify CalendarPage has line-clamp-2, break-words, and title attribute", () => {
    const src = readFileSync(paths.CalendarPage, "utf8");
    assert.ok(src.includes("line-clamp-2"), "CalendarPage should clamp long titles");
    assert.ok(src.includes("break-words"), "CalendarPage should wrap long words");
    assert.ok(src.includes("title={event.title}"), "CalendarPage should have title attribute");
  });

  it("should verify MyCalendar has line-clamp-2, break-words, and title attributes", () => {
    const src = readFileSync(paths.MyCalendar, "utf8");
    assert.ok(src.includes("line-clamp-2"), "MyCalendar should clamp long titles");
    assert.ok(src.includes("break-words"), "MyCalendar should wrap long words");
    assert.ok(src.includes("title={item.event.title}"), "MyCalendar should have title attribute");
  });

  it("should verify EventRegistration has line-clamp-2, break-words, and title attributes", () => {
    const src = readFileSync(paths.EventRegistration, "utf8");
    assert.ok(src.includes("line-clamp-2"), "EventRegistration should clamp long titles");
    assert.ok(src.includes("break-words"), "EventRegistration should wrap long words");
    assert.ok(src.includes("title={event.title}"), "EventRegistration should have title attribute");
  });

  it("should verify EventDetails has break-words and title attributes", () => {
    const srcDetails = readFileSync(paths.EventDetails, "utf8");
    assert.ok(srcDetails.includes("break-words"), "EventDetails should wrap long words");
    assert.ok(srcDetails.includes("title={event.title}"), "EventDetails should have title attribute");
  });

  it("should verify RemindersPage has line-clamp-2, break-words, and title attribute", () => {
    const src = readFileSync(paths.RemindersPage, "utf8");
    assert.ok(src.includes("line-clamp-2"), "RemindersPage should clamp long titles");
    assert.ok(src.includes("break-words"), "RemindersPage should wrap long words");
    assert.ok(src.includes("title={event.title}"), "RemindersPage should have title attribute");
  });

  it("should verify RecentlyViewedCss has overflow-wrap and word-break rules", () => {
    const src = readFileSync(paths.RecentlyViewedEventsCss, "utf8");
    assert.ok(src.includes("overflow-wrap: anywhere;"), "RecentlyViewedCss should wrap any characters");
    assert.ok(src.includes("word-break: break-word;"), "RecentlyViewedCss should break words");
  });

  it("should verify UserDashboard has min-w-0, flex-1, and title attributes", () => {
    const srcJs = readFileSync(paths.UserDashboardJs, "utf8");
    const srcCss = readFileSync(paths.UserDashboardCss, "utf8");
    assert.ok(srcJs.includes("min-w-0 flex-1"), "UserDashboard should have flex wrapping helper");
    assert.ok(srcJs.includes("title={ev.title}"), "UserDashboard events list should have title attribute");
    assert.ok(srcJs.includes("title={h.title}"), "UserDashboard hackathons list should have title attribute");
    assert.ok(srcJs.includes("title={p.title}"), "UserDashboard projects list should have title attribute");
    assert.ok(srcCss.includes("overflow-wrap: anywhere;"), "UserDashboard CSS should wrap any characters");
    assert.ok(srcCss.includes("word-break: break-word;"), "UserDashboard CSS should break words");
  });

  it("should verify NotFound suggestions have break-words and title attributes", () => {
    const src = readFileSync(paths.NotFound, "utf8");
    assert.ok(src.includes("break-words"), "NotFound should wrap long words");
    assert.ok(src.includes("title={event.name}"), "NotFound suggestions should have title attribute");
  });
});
