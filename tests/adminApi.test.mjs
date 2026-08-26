import test from "node:test";
import assert from "node:assert/strict";

import {
  fetchAdminStats,
  fetchAdminDashboardStats,
  getAdminUsers,
  updateAdminUser,
  updateAdminUserRole,
  deleteAdminUser,
  getAdminEvents,
  updateAdminEvent,
  deleteAdminEvent
} from "../src/lib/api.js";

test("fetchAdminStats issues GET request to /api/admin/stats", async () => {
  let calledUrl = "";
  let calledOptions = {};

  globalThis.fetch = async (url, options) => {
    calledUrl = url;
    calledOptions = options;
    return {
      ok: true,
      json: async () => ({ totalUsers: 10, activeUsers: 5 })
    };
  };

  const data = await fetchAdminStats();
  assert.equal(data.totalUsers, 10);
  assert.ok(calledUrl.endsWith("/api/admin/stats"));
  assert.equal(calledOptions.method, undefined); // fetch default GET
});

test("fetchAdminDashboardStats issues GET request to /api/admin/analytics/dashboard", async () => {
  let calledUrl = "";

  globalThis.fetch = async (url) => {
    calledUrl = url;
    return {
      ok: true,
      json: async () => ({ totalUsers: 100, totalEvents: 25 })
    };
  };

  const data = await fetchAdminDashboardStats();
  assert.equal(data.totalEvents, 25);
  assert.ok(calledUrl.endsWith("/api/admin/analytics/dashboard"));
});

test("getAdminUsers formats query parameters correctly", async () => {
  let calledUrl = "";

  globalThis.fetch = async (url) => {
    calledUrl = url;
    return {
      ok: true,
      json: async () => ({ content: [], totalElements: 0 })
    };
  };

  await getAdminUsers(1, 20, "ADMIN", "john");
  assert.ok(calledUrl.includes("/api/admin/users?page=1&size=20&role=ADMIN&search=john"));
});

test("updateAdminUser issues PUT request to /api/admin/users/{id} with payload", async () => {
  let calledUrl = "";
  let calledOptions = {};

  globalThis.fetch = async (url, options) => {
    calledUrl = url;
    calledOptions = options;
    return {
      ok: true,
      json: async () => ({ id: 42, username: "updatedUser" })
    };
  };

  const payload = { username: "updatedUser", email: "user@example.com", role: "ADMIN" };
  const res = await updateAdminUser(42, payload);

  assert.ok(calledUrl.endsWith("/api/admin/users/42"));
  assert.equal(calledOptions.method, "PUT");
  assert.equal(calledOptions.body, JSON.stringify(payload));
  assert.equal(res.username, "updatedUser");
});

test("updateAdminUserRole issues PUT request to /api/admin/users/{id}/role", async () => {
  let calledUrl = "";
  let calledOptions = {};

  globalThis.fetch = async (url, options) => {
    calledUrl = url;
    calledOptions = options;
    return {
      ok: true,
      json: async () => ({ id: 42, role: "SUPER_ADMIN" })
    };
  };

  const res = await updateAdminUserRole(42, "SUPER_ADMIN");

  assert.ok(calledUrl.endsWith("/api/admin/users/42/role"));
  assert.equal(calledOptions.method, "PUT");
  assert.equal(calledOptions.body, JSON.stringify({ role: "SUPER_ADMIN" }));
  assert.equal(res.role, "SUPER_ADMIN");
});

test("deleteAdminUser issues DELETE request to /api/admin/users/{id}", async () => {
  let calledUrl = "";
  let calledOptions = {};

  globalThis.fetch = async (url, options) => {
    calledUrl = url;
    calledOptions = options;
    return {
      ok: true,
      json: async () => null
    };
  };

  await deleteAdminUser(15);
  assert.ok(calledUrl.endsWith("/api/admin/users/15"));
  assert.equal(calledOptions.method, "DELETE");
});

test("updateAdminEvent issues PUT request to /api/admin/events/{id} with event data", async () => {
  let calledUrl = "";
  let calledOptions = {};

  globalThis.fetch = async (url, options) => {
    calledUrl = url;
    calledOptions = options;
    return {
      ok: true,
      json: async () => ({ id: 99, title: "Updated Tech Summit" })
    };
  };

  const payload = { title: "Updated Tech Summit", capacity: 500 };
  const res = await updateAdminEvent(99, payload);

  assert.ok(calledUrl.endsWith("/api/admin/events/99"));
  assert.equal(calledOptions.method, "PUT");
  assert.equal(calledOptions.body, JSON.stringify(payload));
  assert.equal(res.title, "Updated Tech Summit");
});

test("deleteAdminEvent issues DELETE request to /api/admin/events/{id}", async () => {
  let calledUrl = "";
  let calledOptions = {};

  globalThis.fetch = async (url, options) => {
    calledUrl = url;
    calledOptions = options;
    return {
      ok: true,
      json: async () => null
    };
  };

  await deleteAdminEvent(99);
  assert.ok(calledUrl.endsWith("/api/admin/events/99"));
  assert.equal(calledOptions.method, "DELETE");
});
