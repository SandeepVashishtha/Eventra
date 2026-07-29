import { strict as assert } from "node:assert";

import {
  applyScheduleToEvent,
  buildCalendarDays,
  buildScheduleUpdatePayload,
  buildTimeSlots,
  detectScheduleConflicts,
  getEventDurationMinutes,
  getSlotDateTime,
  normalizeScheduledEvent,
  normalizeScheduledEvents,
  parseScheduleTime,
  toDateKey,
  validateScheduleRange,
} from "../src/utils/eventSchedulingUtils.js";

console.log("eventSchedulingUtils tests starting...");

const baseEvents = [
  {
    id: "evt-1",
    title: "React Workshop",
    date: "2026-08-10",
    time: "10:00 AM",
    durationMinutes: 120,
    location: "Hall A",
    organizer: "Ada",
    resources: ["projector-1"],
    category: "Web Development",
  },
  {
    id: "evt-2",
    title: "AI Meetup",
    date: "2026-08-10",
    time: "11:00 AM",
    durationMinutes: 60,
    location: "Hall A",
    organizer: "Grace",
    resources: ["projector-2"],
    category: "AI",
  },
  {
    id: "evt-3",
    title: "Cloud Talk",
    date: "2026-08-10",
    time: "3:00 PM",
    durationMinutes: 60,
    location: "Hall B",
    organizer: "Ada",
    resources: ["projector-1"],
    category: "Cloud",
  },
];

assert.deepEqual(parseScheduleTime("2:30 PM"), { hours: 14, minutes: 30 });
assert.deepEqual(parseScheduleTime("09:15"), { hours: 9, minutes: 15 });
assert.equal(parseScheduleTime("later"), null);

const normalized = normalizeScheduledEvent(baseEvents[0]);
assert.equal(normalized.id, "evt-1");
assert.equal(normalized.title, "React Workshop");
assert.equal(normalized.durationMinutes, 120);
assert.equal(normalized.dateKey, "2026-08-10");
assert.equal(normalized.venueLabel, "Hall A");
assert.equal(normalized.organizerLabel, "Ada");
assert.equal(normalizeScheduledEvents([null, {}, ...baseEvents]).length, 3);

assert.equal(getEventDurationMinutes(baseEvents[0]), 120);
assert.equal(
  getEventDurationMinutes({
    date: "2026-08-10",
    time: "9:00 AM",
    endDate: "2026-08-10",
    endTime: "10:30 AM",
  }),
  90,
);

const moved = applyScheduleToEvent(baseEvents[0], new Date("2026-08-11T14:00:00.000Z"), 120);
assert.equal(moved.date, "2026-08-11");
assert.equal(moved.durationMinutes, 120);
assert.equal(moved.startDate, "2026-08-11T14:00:00.000Z");
assert.equal(moved.endDate, "2026-08-11T16:00:00.000Z");

const payload = buildScheduleUpdatePayload("evt-1", new Date("2026-08-11T10:00:00.000Z"), new Date("2026-08-11T12:00:00.000Z"));
assert.deepEqual(payload, {
  eventId: "evt-1",
  startDate: "2026-08-11T10:00:00.000Z",
  endDate: "2026-08-11T12:00:00.000Z",
});

const valid = validateScheduleRange({
  start: new Date("2026-08-10T10:00:00"),
  end: new Date("2026-08-10T11:00:00"),
});
assert.equal(valid.ok, true);

assert.equal(
  validateScheduleRange({
    start: new Date("2026-08-10T11:00:00"),
    end: new Date("2026-08-10T10:00:00"),
  }).reason,
  "Start time must be before end time.",
);
assert.equal(
  validateScheduleRange({
    start: new Date("2026-08-10T06:00:00"),
    end: new Date("2026-08-10T07:00:00"),
  }).reason,
  "Drop inside the allowed scheduling hours.",
);

const conflicts = detectScheduleConflicts(baseEvents[0], baseEvents);
assert.equal(conflicts.length, 1);
assert.equal(conflicts[0].event.id, "evt-2");
assert.deepEqual(conflicts[0].types, ["time", "venue"]);

const resourceAndOrganizerConflict = detectScheduleConflicts(
  {
    ...baseEvents[0],
    id: "evt-4",
    date: "2026-08-10",
    time: "3:00 PM",
    location: "Hall C",
  },
  baseEvents,
);
assert.equal(resourceAndOrganizerConflict.length, 1);
assert.deepEqual(resourceAndOrganizerConflict[0].types, ["time", "organizer", "resource"]);

const monthDays = buildCalendarDays("month", new Date("2026-08-15T00:00:00"));
assert.equal(monthDays.length, 42);
assert.equal(toDateKey(monthDays[0]), "2026-07-26");

const weekDays = buildCalendarDays("week", new Date("2026-08-12T00:00:00"));
assert.equal(weekDays.length, 7);
assert.equal(toDateKey(weekDays[0]), "2026-08-09");

const day = buildCalendarDays("day", new Date("2026-08-12T00:00:00"));
assert.equal(day.length, 1);
assert.equal(toDateKey(day[0]), "2026-08-12");

const slots = buildTimeSlots({ startHour: 9, endHour: 11, stepMinutes: 30 });
assert.deepEqual(
  slots.map((slot) => slot.minutes),
  [540, 570, 600, 630],
);

const slotDate = getSlotDateTime(new Date("2026-08-10T00:00:00"), 14 * 60 + 30);
assert.equal(slotDate.getHours(), 14);
assert.equal(slotDate.getMinutes(), 30);

console.log("eventSchedulingUtils tests passed");
