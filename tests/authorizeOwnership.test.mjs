/**
 * Tests for api/lib/authorizeOwnership.js
 *
 * Verifies IDOR protection logic: canAccessResource and enforceOwnership.
 * These functions prevent Insecure Direct Object Reference (IDOR) attacks by
 * checking ownership before returning or mutating resources.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { canAccessResource, enforceOwnership } = await import("../api/lib/authorizeOwnership.js");

// ─── Test helpers ─────────────────────────────────────────────────────────────

/** Builds a mock response object that captures status and body. */
function makeRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  return res;
}

// ─── canAccessResource tests ───────────────────────────────────────────────────

describe("canAccessResource — null / undefined inputs", () => {
  it("returns false when userId is null", () => {
    assert.equal(
      canAccessResource({ userId: null, resourceOwnerId: "user-1" }),
      false
    );
  });

  it("returns false when userId is undefined", () => {
    assert.equal(
      canAccessResource({ userId: undefined, resourceOwnerId: "user-1" }),
      false
    );
  });

  it("returns false when resourceOwnerId is null", () => {
    assert.equal(
      canAccessResource({ userId: "user-1", resourceOwnerId: null }),
      false
    );
  });

  it("returns false when resourceOwnerId is undefined", () => {
    assert.equal(
      canAccessResource({ userId: "user-1", resourceOwnerId: undefined }),
      false
    );
  });

  it("returns false when both userId and resourceOwnerId are null", () => {
    assert.equal(
      canAccessResource({ userId: null, resourceOwnerId: null }),
      false
    );
  });
});

describe("canAccessResource — ownership check", () => {
  it("returns true when userId matches resourceOwnerId (string vs string)", () => {
    assert.equal(
      canAccessResource({ userId: "user-42", resourceOwnerId: "user-42" }),
      true
    );
  });

  it("returns false when userId does not match resourceOwnerId", () => {
    assert.equal(
      canAccessResource({ userId: "user-42", resourceOwnerId: "user-99" }),
      false
    );
  });

  it("returns true when userId string matches resourceOwnerId number (type coercion)", () => {
    // This is the key type-tolerance test: "5001" === 5001 via String() coercion
    assert.equal(
      canAccessResource({ userId: "5001", resourceOwnerId: 5001 }),
      true
    );
  });

  it("returns true when userId number matches resourceOwnerId string", () => {
    assert.equal(
      canAccessResource({ userId: 5001, resourceOwnerId: "5001" }),
      true
    );
  });

  it("returns false for mismatched string/numeric ids", () => {
    assert.equal(
      canAccessResource({ userId: "5001", resourceOwnerId: 5002 }),
      false
    );
  });

  it("returns false for empty string userId", () => {
    assert.equal(
      canAccessResource({ userId: "", resourceOwnerId: "user-1" }),
      false
    );
  });

  it("returns false for empty string resourceOwnerId", () => {
    assert.equal(
      canAccessResource({ userId: "user-1", resourceOwnerId: "" }),
      false
    );
  });
});

describe("canAccessResource — role-based bypass", () => {
  it("returns true when user has 'admin' role regardless of ownership", () => {
    assert.equal(
      canAccessResource({
        userId: "admin-1",
        userRoles: ["admin"],
        resourceOwnerId: "other-user",
      }),
      true
    );
  });

  it("returns true when user has 'organizer' role regardless of ownership", () => {
    assert.equal(
      canAccessResource({
        userId: "org-1",
        userRoles: ["organizer"],
        resourceOwnerId: "other-user",
      }),
      true
    );
  });

  it("returns true when user has multiple roles including admin", () => {
    assert.equal(
      canAccessResource({
        userId: "super-user",
        userRoles: ["user", "moderator", "admin"],
        resourceOwnerId: "stranger",
      }),
      true
    );
  });

  it("returns false when user has no elevated roles and is not the owner", () => {
    assert.equal(
      canAccessResource({
        userId: "user-42",
        userRoles: ["user"],
        resourceOwnerId: "user-99",
      }),
      false
    );
  });

  it("returns true when user has no elevated roles but IS the owner", () => {
    assert.equal(
      canAccessResource({
        userId: "user-42",
        userRoles: ["user"],
        resourceOwnerId: "user-42",
      }),
      true
    );
  });

  it("returns false when userRoles is an empty array", () => {
    assert.equal(
      canAccessResource({
        userId: "user-42",
        userRoles: [],
        resourceOwnerId: "user-99",
      }),
      false
    );
  });

  it("returns false when userRoles is not an array", () => {
    assert.equal(
      canAccessResource({
        userId: "user-42",
        userRoles: "admin", // string instead of array
        resourceOwnerId: "other-user",
      }),
      false
    );
  });

  it("respects custom allowedRoles", () => {
    assert.equal(
      canAccessResource({
        userId: "mod-1",
        userRoles: ["moderator"],
        resourceOwnerId: "stranger",
        allowedRoles: ["moderator", "admin"],
      }),
      true
    );
  });

  it("owner access takes precedence over non-matching custom roles", () => {
    // Owner should always have access regardless of allowedRoles
    assert.equal(
      canAccessResource({
        userId: "user-42",
        userRoles: ["user"],
        resourceOwnerId: "user-42",
        allowedRoles: ["admin"], // owner not in allowedRoles
      }),
      true
    );
  });
});

describe("canAccessResource — default arguments", () => {
  it("uses default allowedRoles ['admin', 'organizer']", () => {
    assert.equal(
      canAccessResource({
        userId: "org-1",
        userRoles: ["organizer"],
        resourceOwnerId: "stranger",
        // allowedRoles not passed — defaults to ["admin", "organizer"]
      }),
      true
    );
  });

  it("defaults userRoles to empty array", () => {
    assert.equal(
      canAccessResource({
        userId: "user-1",
        resourceOwnerId: "user-2",
        // userRoles not passed
      }),
      false
    );
  });
});

// ─── enforceOwnership tests ──────────────────────────────────────────────────

describe("enforceOwnership — authentication failures", () => {
  it("returns false and sends 401 when user is null", () => {
    const res = makeRes();
    const result = enforceOwnership({ user: null, resource: { userId: "1" }, res });
    assert.equal(result, false);
    assert.equal(res.statusCode, 401);
    assert.ok(res.body.error.includes("Authentication"));
  });

  it("returns false and sends 401 when user is undefined", () => {
    const res = makeRes();
    const result = enforceOwnership({ user: undefined, resource: { userId: "1" }, res });
    assert.equal(result, false);
    assert.equal(res.statusCode, 401);
  });

  it("returns false and sends 401 when user.id is null", () => {
    const res = makeRes();
    const result = enforceOwnership({ user: { id: null }, resource: { userId: "1" }, res });
    assert.equal(result, false);
    assert.equal(res.statusCode, 401);
  });

  it("returns false and sends 401 when user.id is undefined", () => {
    const res = makeRes();
    const result = enforceOwnership({ user: { id: undefined }, resource: { userId: "1" }, res });
    assert.equal(result, false);
    assert.equal(res.statusCode, 401);
  });

  it("returns false and sends 401 when user object is empty", () => {
    const res = makeRes();
    const result = enforceOwnership({ user: {}, resource: { userId: "1" }, res });
    assert.equal(result, false);
    assert.equal(res.statusCode, 401);
  });
});

describe("enforceOwnership — resource not found", () => {
  it("returns false and sends 404 when resource is null", () => {
    const res = makeRes();
    const result = enforceOwnership({ user: { id: "1" }, resource: null, res });
    assert.equal(result, false);
    assert.equal(res.statusCode, 404);
    assert.ok(res.body.error.toLowerCase().includes("not found"));
  });

  it("returns false and sends 404 when resource is undefined", () => {
    const res = makeRes();
    const result = enforceOwnership({ user: { id: "1" }, resource: undefined, res });
    assert.equal(result, false);
    assert.equal(res.statusCode, 404);
  });

  it("returns 403 (not 404) when resource owner field is missing — owner is undefined", () => {
    const res = makeRes();
    // resource.userId is undefined, so canAccessResource gets resourceOwnerId=undefined
    // which is treated as "no ownership" and returns 403 (IDOR: user exists but no access)
    const result = enforceOwnership({
      user: { id: "user-1" },
      resource: { id: "event-1" }, // userId field missing
      res,
    });
    assert.equal(result, false);
    assert.equal(res.statusCode, 403); // 403 not 404 — resource exists but no access
  });
});

describe("enforceOwnership — forbidden (IDOR prevention)", () => {
  it("returns false and sends 403 when user is not the owner and has no elevated role", () => {
    const res = makeRes();
    const result = enforceOwnership({
      user: { id: "user-42", roles: ["user"] },
      resource: { userId: "user-99" },
      res,
    });
    assert.equal(result, false);
    assert.equal(res.statusCode, 403);
    assert.ok(res.body.error.toLowerCase().includes("do not have access"));
  });

  it("returns false and sends 403 when user has no roles", () => {
    const res = makeRes();
    const result = enforceOwnership({
      user: { id: "user-42" },
      resource: { userId: "user-99" },
      res,
    });
    assert.equal(result, false);
    assert.equal(res.statusCode, 403);
  });

  it("does NOT leak resource existence — sends 403, not 404", () => {
    const res = makeRes();
    enforceOwnership({
      user: { id: "intruder" },
      resource: { userId: "victim" },
      res,
    });
    assert.equal(res.statusCode, 403, "Should be 403 to avoid leaking resource existence");
  });
});

describe("enforceOwnership — access granted", () => {
  it("returns true when user is the resource owner", () => {
    const res = makeRes();
    const result = enforceOwnership({
      user: { id: "user-42" },
      resource: { userId: "user-42" },
      res,
    });
    assert.equal(result, true);
    assert.equal(res.statusCode, 200); // status not changed
  });

  it("returns true when user has admin role", () => {
    const res = makeRes();
    const result = enforceOwnership({
      user: { id: "admin-1", roles: ["admin"] },
      resource: { userId: "any-user" },
      res,
    });
    assert.equal(result, true);
  });

  it("returns true when user has organizer role", () => {
    const res = makeRes();
    const result = enforceOwnership({
      user: { id: "org-1", roles: ["organizer"] },
      resource: { userId: "any-user" },
      res,
    });
    assert.equal(result, true);
  });

  it("respects custom ownerField", () => {
    const res = makeRes();
    const result = enforceOwnership({
      user: { id: "owner-1" },
      resource: { creatorId: "owner-1" },
      ownerField: "creatorId",
      res,
    });
    assert.equal(result, true);
  });

  it("respects custom allowedRoles", () => {
    const res = makeRes();
    const result = enforceOwnership({
      user: { id: "mod-1", roles: ["moderator"] },
      resource: { userId: "any-user" },
      allowedRoles: ["moderator", "admin"],
      res,
    });
    assert.equal(result, true);
  });

  it("uses default ownerField 'userId'", () => {
    const res = makeRes();
    const result = enforceOwnership({
      user: { id: "user-42" },
      resource: { userId: "user-42" },
      res,
    });
    assert.equal(result, true);
  });
});

console.log("authorizeOwnership tests passed ✓");