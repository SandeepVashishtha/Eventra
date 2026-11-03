import assert from "node:assert/strict";
import { getSwUrl, getSwScope } from "../src/utils/serviceWorkerRegistration.js";

// Save initial process.env
const originalEnv = { ...process.env };

try {
  // Test 1: Default base URL ("/") without window
  delete process.env.BASE_URL;
  delete process.env.PUBLIC_URL;

  assert.equal(getSwUrl(), "/service-worker.js");
  assert.equal(getSwScope(), "/");

  // Test 2: Subpath base URL with trailing slash ("/app/") without window
  process.env.BASE_URL = "/app/";
  assert.equal(getSwUrl(), "/app/service-worker.js");
  assert.equal(getSwScope(), "/app/");

  // Test 3: Subpath base URL without trailing slash ("/app") without window
  process.env.BASE_URL = "/app";
  assert.equal(getSwUrl(), "/app/service-worker.js");
  assert.equal(getSwScope(), "/app/");

  // Test 4: Deep subpath ("/eventra/v1/") without window
  process.env.BASE_URL = "/eventra/v1/";
  assert.equal(getSwUrl(), "/eventra/v1/service-worker.js");
  assert.equal(getSwScope(), "/eventra/v1/");

  // Test 5: Browser environment simulation with window.location
  globalThis.window = {
    location: {
      href: "https://example.com/app/dashboard",
    },
  };

  process.env.BASE_URL = "/app/";
  assert.equal(getSwUrl(), "/app/service-worker.js");
  assert.equal(getSwScope(), "/app/");

  // Subpath without trailing slash in browser environment
  process.env.BASE_URL = "/app";
  assert.equal(getSwUrl(), "/app/service-worker.js");
  assert.equal(getSwScope(), "/app/");

  // Root path in browser environment
  process.env.BASE_URL = "/";
  assert.equal(getSwUrl(), "/service-worker.js");
  assert.equal(getSwScope(), "/");

  console.log("All subpath push subscription tests passed successfully!");
} finally {
  process.env = originalEnv;
  delete globalThis.window;
}
