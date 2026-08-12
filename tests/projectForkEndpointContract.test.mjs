import fs from "node:fs";
import assert from "node:assert/strict";

const controller = fs.readFileSync(
  "Backend/src/main/java/com/sandeep/eventrabackend/controller/ProjectController.java",
  "utf8",
);
const service = fs.readFileSync(
  "Backend/src/main/java/com/sandeep/eventrabackend/service/ProjectService.java",
  "utf8",
);

assert.match(controller, /@PostMapping\("\/\{id}\/fork"\)/);
assert.equal(controller.includes("projectService.forkProject(id, authentication.getName())"), true);
assert.equal(service.includes("ProjectResponse forkProject(Long id, String userEmail)"), true);
assert.equal(service.includes(".ownerId(user.getId())"), true);

console.log("project fork endpoint contract checks passed");
