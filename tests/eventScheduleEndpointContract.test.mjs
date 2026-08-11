import fs from "node:fs";
import assert from "node:assert/strict";

const controller = fs.readFileSync(
  "Backend/src/main/java/com/sandeep/eventrabackend/controller/EventController.java",
  "utf8",
);
const service = fs.readFileSync(
  "Backend/src/main/java/com/sandeep/eventrabackend/service/EventService.java",
  "utf8",
);

assert.match(controller, /@GetMapping\("\/\{id}\/schedule"\)/);
assert.match(controller, /@PatchMapping\("\/\{id}\/schedule"\)/);
assert.equal(service.includes("updateEventSchedule(Long id, EventScheduleRequest request, String userEmail)"), true);
assert.equal(service.includes("event.setEventDate(request.getStartDate())"), true);

console.log("event schedule endpoint contract checks passed");
