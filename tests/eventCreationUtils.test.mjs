import assert from "node:assert/strict";

const {
  parseTimeToMinutes,
  validateCoordinates,
  buildEventPayload,
} = await import("../src/utils/eventCreationUtils.js");

assert.equal(parseTimeToMinutes("09:30"), 570);
assert.equal(parseTimeToMinutes(""), 0);

assert.deepEqual(validateCoordinates("40.7128", "-74.0060"), {
  latitude: 40.7128,
  longitude: -74.006,
});
assert.equal(validateCoordinates("95", "10"), null);
assert.equal(validateCoordinates("10", "200"), null);

const payload = buildEventPayload({
  title: " Tech Meetup ",
  description: " Deep dive ",
  category: "MEETUP",
  isMultiDay: false,
  date: "2099-06-15",
  startTime: "10:00 AM",
  endTime: "11:00 AM",
  timezone: "UTC",
  location: { name: "Hall A", address: "1 Main St", coordinates: {} },
  isVirtual: false,
  virtualLink: "",
  capacity: "50",
  isPublic: true,
  tags: ["ai", ""],
  imageUrl: "https://example.com/banner.jpg",
});

assert.equal(payload.title, "Tech Meetup");
assert.equal(payload.description, "Deep dive");
assert.equal(payload.location, "Hall A, 1 Main St");
assert.equal(payload.eventDate, "2099-06-15T10:00:00");
assert.equal(payload.capacity, 50);
assert.equal(payload.isPublic, true);
assert.equal(payload.category, "MEETUP");
assert.deepEqual(payload.tags, ["ai"]);
assert.equal(payload.imageUrl, "https://example.com/banner.jpg");
assert.equal(payload.startDate, undefined);

console.log("eventCreationUtils tests passed ✓");
