import assert from "node:assert/strict";

import { ROLES } from "../src/config/roles.js";
import { resolveSignupRoles } from "../src/utils/signupRoleUtils.js";

assert.deepEqual(resolveSignupRoles({ roles: ["ORGANIZER"] }), [ROLES.ORGANIZER]);

assert.deepEqual(resolveSignupRoles({ roles: ["organizer", "ORGANIZER", "VOLUNTEER"] }), [
  ROLES.ORGANIZER,
  ROLES.VOLUNTEER,
]);

assert.deepEqual(resolveSignupRoles({ role: "ADMIN" }), [ROLES.ADMIN]);

assert.deepEqual(resolveSignupRoles({ roles: ["UNKNOWN"], role: "ADMIN" }), [ROLES.ATTENDEE]);

assert.deepEqual(resolveSignupRoles({ roles: ["USER"] }), [ROLES.ATTENDEE]);

assert.deepEqual(resolveSignupRoles({}), [ROLES.ATTENDEE]);

console.log("signup role normalization verified");
