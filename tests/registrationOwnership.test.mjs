import assert from "node:assert/strict";

const { canAccessResource, enforceOwnership } = await import(
  "../api/lib/authorizeOwnership.js"
);
const handlerModule = await import("../api/registrations/[id].js");
const registrationHandler = handlerModule.default;

function makeRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

// --- canAccessResource: owner matches ---
{
  assert.equal(
    canAccessResource({ userId: 5, resourceOwnerId: 5 }),
    true,
    "owner can access"
  );
  assert.equal(
    canAccessResource({ userId: "5001", resourceOwnerId: 5001 }),
    true,
    "string/number ids match"
  );
  assert.equal(
    canAccessResource({ userId: 7, resourceOwnerId: 8 }),
    false,
    "non-owner denied"
  );
}

// --- canAccessResource: elevated roles bypass ownership ---
{
  assert.equal(
    canAccessResource({
      userId: 1,
      userRoles: ["admin"],
      resourceOwnerId: 999,
    }),
    true,
    "admin bypasses ownership"
  );
  assert.equal(
    canAccessResource({
      userId: 1,
      userRoles: ["user"],
      resourceOwnerId: 999,
    }),
    false,
    "ordinary role does not bypass ownership"
  );
}

// --- canAccessResource: missing ids deny ---
{
  assert.equal(
    canAccessResource({ userId: null, resourceOwnerId: 5 }),
    false,
    "null userId denied"
  );
  assert.equal(
    canAccessResource({ userId: 5, resourceOwnerId: undefined }),
    false,
    "missing owner denied"
  );
}

// --- enforceOwnership: writes 403 for non-owner ---
{
  const res = makeRes();
  const allowed = enforceOwnership({
    user: { id: 2, roles: ["user"] },
    resource: { userId: 1 },
    res,
  });
  assert.equal(allowed, false, "non-owner blocked");
  assert.equal(res.statusCode, 403, "403 returned");
}

const owner = { id: 5001, roles: ["user"] };
const attacker = { id: 6002, roles: ["user"] };
const registration = {
  id: "reg-1",
  userId: 5001,
  email: "owner@example.com",
  phone: "555-0100",
};

const deps = {
  getRegistrationById: async (id) =>
    id === "reg-1" ? { ...registration } : null,
  updateRegistration: async (id, patch) => ({ ...registration, ...patch }),
  deleteRegistration: async () => undefined,
  getRegistrationId: (req) => req.params.id,
};

// --- owner can GET their registration ---
{
  const res = makeRes();
  await registrationHandler(
    { method: "GET", user: owner, params: { id: "reg-1" } },
    res,
    deps
  );
  assert.equal(res.statusCode, 200, "owner GET returns 200");
  assert.equal(res.body.registration.email, "owner@example.com");
}

// --- attacker cannot GET another user's registration (IDOR blocked) ---
{
  const res = makeRes();
  await registrationHandler(
    { method: "GET", user: attacker, params: { id: "reg-1" } },
    res,
    deps
  );
  assert.equal(res.statusCode, 403, "attacker GET blocked with 403");
  assert.equal(res.body.registration, undefined, "no data leaked to attacker");
}

// --- attacker cannot PUT another user's registration ---
{
  const res = makeRes();
  await registrationHandler(
    {
      method: "PUT",
      user: attacker,
      params: { id: "reg-1" },
      body: { phone: "555-9999" },
    },
    res,
    deps
  );
  assert.equal(res.statusCode, 403, "attacker PUT blocked with 403");
}

// --- owner PUT cannot reassign ownership ---
{
  const res = makeRes();
  await registrationHandler(
    {
      method: "PUT",
      user: owner,
      params: { id: "reg-1" },
      body: { phone: "555-0101", userId: 9999 },
    },
    res,
    deps
  );
  assert.equal(res.statusCode, 200, "owner PUT succeeds");
  assert.equal(
    res.body.registration.userId,
    5001,
    "userId cannot be reassigned via update"
  );
  assert.equal(res.body.registration.phone, "555-0101", "allowed field updated");
}

// --- unauthenticated request rejected ---
{
  const res = makeRes();
  await registrationHandler(
    { method: "GET", params: { id: "reg-1" } },
    res,
    deps
  );
  assert.equal(res.statusCode, 401, "missing user returns 401");
}

// --- unknown registration returns 404 ---
{
  const res = makeRes();
  await registrationHandler(
    { method: "GET", user: owner, params: { id: "missing" } },
    res,
    deps
  );
  assert.equal(res.statusCode, 404, "unknown registration returns 404");
}

// --- admin can access any registration ---
{
  const res = makeRes();
  await registrationHandler(
    { method: "GET", user: { id: 1, roles: ["admin"] }, params: { id: "reg-1" } },
    res,
    deps
  );
  assert.equal(res.statusCode, 200, "admin can access any registration");
}

console.log("registration ownership (IDOR) tests passed ✓");
