import assert from "node:assert/strict";
import {
  getRecommendedEvents,
  scoreRecommendedEvent,
} from "../src/utils/eventRecommendationUtils.js";

const referenceDate = new Date("2026-01-01T00:00:00.000Z");

const events = [
  {
    id: 1,
    title: "React Summit",
    category: "Frontend",
    type: "conference",
    tags: ["React", "JavaScript"],
    description: "Frontend architecture talks",
    location: "San Francisco",
    date: "2026-01-12",
    attendees: 80,
    maxAttendees: 100,
  },
  {
    id: 2,
    title: "AI Workshop",
    category: "AI",
    type: "workshop",
    tags: ["Machine Learning", "Python"],
    description: "Practical AI labs",
    location: "Online",
    date: "2026-01-04",
    attendees: 120,
    maxAttendees: 150,
  },
  {
    id: 3,
    title: "Cloud Native Meetup",
    category: "Cloud",
    type: "meetup",
    tags: ["DevOps", "Kubernetes"],
    description: "Infrastructure and platform engineering",
    location: "New York",
    date: "2026-02-20",
    attendees: 30,
    maxAttendees: 120,
  },
  {
    id: 4,
    title: "Past Blockchain Talk",
    category: "Web3",
    type: "conference",
    tags: ["Blockchain"],
    description: "Past event",
    location: "Austin",
    date: "2025-05-01",
    attendees: 200,
    maxAttendees: 200,
  },
];

const reactScore = scoreRecommendedEvent({
  event: events[0],
  currentEvent: {
    id: 99,
    category: "Frontend",
    type: "conference",
    tags: ["React"],
  },
  userInterests: ["React", "JavaScript"],
  referenceDate,
});

const cloudScore = scoreRecommendedEvent({
  event: events[2],
  currentEvent: {
    id: 99,
    category: "Frontend",
    type: "conference",
    tags: ["React"],
  },
  userInterests: ["React", "JavaScript"],
  referenceDate,
});

assert.ok(
  reactScore > cloudScore,
  "category, type, tag, and interest overlap should raise recommendation score"
);

assert.deepEqual(
  getRecommendedEvents({
    events,
    currentEventId: 1,
    userInterests: ["AI", "Python"],
    referenceDate,
  }).map((event) => event.id),
  [2, 3, 4],
  "recommendations exclude the current event and rank interest matches first"
);

assert.deepEqual(
  getRecommendedEvents({
    events,
    currentEventId: 99,
    currentCategory: "Frontend",
    userInterests: ["React"],
    referenceDate,
    limit: 2,
  }).map((event) => event.id),
  [1, 2],
  "fallback category context is used when the current event is not in the pool"
);

assert.equal(
  getRecommendedEvents({
    events,
    currentEventId: 99,
    userInterests: ["React", "AI", "Cloud"],
    referenceDate,
    limit: 1,
  }).length,
  1,
  "recommendation limit is respected"
);
