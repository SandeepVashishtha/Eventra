/**
 * Tests for the RBAC role-management wiring in the admin panel.
 *
 * Verifies that:
 *  1. `adminService.js` exposes an `updateAdminUserRole` helper that calls the
 *     backend role endpoint (PUT /api/admin/users/{id}/role).
 *  2. `AdminDashboard.js` imports and uses that helper inside a
 *     role-management modal.
 *  3. The users-table "Edit" action opens the role-management modal instead of
 *     showing the placeholder "Edit coming soon" toast.
 *  4. The dashboard renders the role modal and exposes the role select.
 *
 * These are static-analysis style tests that parse the source files to assert
 * security-relevant RBAC patterns are present.
 */

import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const readSrc = (relPath) => readFileSync(path.resolve(__dirname, "..", relPath), "utf8");

const adminServiceSrc = readSrc("src/services/adminService.js");
const adminDashboardSrc = readSrc("src/components/admin/AdminDashboard.js");

describe("adminService — RBAC role update helper", () => {
  it("exports an updateAdminUserRole function", () => {
    assert.ok(
      /export\s+const\s+updateAdminUserRole\s*=/.test(adminServiceSrc),
      "adminService must export updateAdminUserRole"
    );
  });

  it("updateAdminUserRole targets the role endpoint (id + /role)", () => {
    assert.ok(
      adminServiceSrc.includes("`${API_ENDPOINTS.ADMIN.USER(userId)}/role`"),
      "updateAdminUserRole must call the backend role endpoint"
    );
  });

  it("updateAdminUserRole sends the role in the request body", () => {
    assert.ok(
      adminServiceSrc.includes("{ role }"),
      "updateAdminUserRole must send { role } in the request body"
    );
  });
});

describe("AdminDashboard — role management modal wiring", () => {
  it("imports updateAdminUserRole from adminService", () => {
    assert.ok(
      adminDashboardSrc.includes("updateAdminUserRole"),
      "AdminDashboard must import updateAdminUserRole"
    );
  });

  it("defines a RoleManagementModal component", () => {
    assert.ok(
      adminDashboardSrc.includes("function RoleManagementModal"),
      "AdminDashboard must define RoleManagementModal"
    );
  });

  it("renders the RoleManagementModal when a user is selected", () => {
    assert.ok(
      adminDashboardSrc.includes("<RoleManagementModal"),
      "AdminDashboard must render <RoleManagementModal>"
    );
  });

  it("exposes an assignable-roles dropdown (role select)", () => {
    assert.ok(
      adminDashboardSrc.includes('id="role-select"') &&
        adminDashboardSrc.includes("ASSIGNABLE_ROLES"),
      "Role modal must render a role select with assignable roles"
    );
  });

  it("includes ATTENDEE, ORGANIZER and ADMIN as assignable roles", () => {
    assert.ok(
      adminDashboardSrc.includes('"ATTENDEE"') &&
        adminDashboardSrc.includes('"ORGANIZER"') &&
        adminDashboardSrc.includes('"ADMIN"'),
      "Assignable roles must include ATTENDEE, ORGANIZER, ADMIN"
    );
  });

  it("wires the users-table Edit action to open the role modal", () => {
    // The users-table edit button must open the role modal (setRoleModalUser)
    // instead of showing a placeholder toast.
    assert.ok(
      adminDashboardSrc.includes("setRoleModalUser(u)"),
      "The users-table Edit action must open the role modal via setRoleModalUser"
    );
  });
});
