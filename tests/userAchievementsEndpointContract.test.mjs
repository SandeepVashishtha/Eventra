import fs from "node:fs";
import assert from "node:assert/strict";

const controller = fs.readFileSync(
  "Backend/src/main/java/com/sandeep/eventrabackend/controller/UserController.java",
  "utf8",
);
const service = fs.readFileSync(
  "Backend/src/main/java/com/sandeep/eventrabackend/service/EventService.java",
  "utf8",
);

assert.match(controller, /@GetMapping\("\/achievements"\)/);
assert.equal(controller.includes("eventService.getAchievementsForUser(authentication.getName())"), true);
assert.equal(service.includes("UserAchievementsResponse getAchievementsForUser(String userEmail)"), true);
assert.equal(service.includes("calculateCurrentStreak"), true);

console.log("user achievements endpoint contract checks passed");
