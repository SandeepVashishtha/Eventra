import fs from "node:fs";
import assert from "node:assert/strict";

const controller = fs.readFileSync(
  "Backend/src/main/java/com/sandeep/eventrabackend/controller/FeedbackController.java",
  "utf8",
);
const service = fs.readFileSync(
  "Backend/src/main/java/com/sandeep/eventrabackend/service/FeedbackService.java",
  "utf8",
);
const repository = fs.readFileSync(
  "Backend/src/main/java/com/sandeep/eventrabackend/repository/FeedbackAnalyticsRepository.java",
  "utf8",
);
const security = fs.readFileSync(
  "Backend/src/main/java/com/sandeep/eventrabackend/config/SecurityConfig.java",
  "utf8",
);

assert.match(controller, /@GetMapping\s+[\s\S]*@RequestParam Long eventId/);
assert.equal(service.includes("getEventFeedback(Long eventId)"), true);
assert.equal(repository.includes("findByEvent_IdOrderBySubmittedAtDesc"), true);
assert.equal(security.includes('org.springframework.http.HttpMethod.GET, "/api/feedback"'), true);

console.log("event feedback endpoint contract checks passed");
