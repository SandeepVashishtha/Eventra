import assert from "node:assert/strict";

const runTestWithEnv = async (env, secret, runAssertions) => {
  const origEnv = process.env.NODE_ENV;
  const origSecret = process.env.JWT_SECRET;

  if (env === undefined) {
    delete process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = env;
  }

  if (secret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = secret;
  }

  try {
    const modulePath = `../api/auth/jwt-config.js?t=${Date.now()}_${Math.random()}`;
    const module = await import(modulePath);
    await runAssertions(module);
  } finally {
    // Restore environment
    if (origEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = origEnv;
    }

    if (origSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = origSecret;
    }
  }
};

async function runTests() {
  console.log("Running jwt-config unit tests...");

  // 1. Test production environment with missing JWT_SECRET
  try {
    await runTestWithEnv("production", undefined, () => {});
    assert.fail("Should have thrown error in production when JWT_SECRET is missing");
  } catch (err) {
    assert.ok(err.message.includes("Missing required environment variable: JWT_SECRET"));
    console.log("✓ Production missing JWT_SECRET throws error");
  }

  // 2. Test production environment with configured JWT_SECRET
  const prodSecret = "my-secure-prod-secret-1234567890";
  await runTestWithEnv("production", prodSecret, (prodModule) => {
    assert.equal(prodModule.JWT_SECRET, prodSecret);
    assert.equal(prodModule.getJwtSecret(), prodSecret);
  });
  console.log("✓ Production configured JWT_SECRET returns correct value");

  // 3. Test development environment with missing JWT_SECRET
  let warningLogged = false;
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args.some((arg) => typeof arg === "string" && arg.includes("[JWT WARNING]"))) {
      warningLogged = true;
    }
  };

  try {
    await runTestWithEnv("development", undefined, (devModule) => {
      assert.equal(devModule.JWT_SECRET, "eventra-local-development-jwt-secret");
      assert.equal(devModule.getJwtSecret(), "eventra-local-development-jwt-secret");
    });
    assert.ok(warningLogged, "A warning should be logged in development when JWT_SECRET is missing");
    console.log("✓ Development missing JWT_SECRET logs warning and returns fallback");
  } finally {
    console.warn = originalWarn;
  }

  // 4. Test test environment with missing JWT_SECRET
  await runTestWithEnv("test", undefined, (testModule) => {
    assert.equal(testModule.JWT_SECRET, "test-secret-for-test-environments");
    assert.equal(testModule.getJwtSecret(), "test-secret-for-test-environments");
  });
  console.log("✓ Test environment missing JWT_SECRET returns test fallback");

  // 5. Test undefined environment with missing JWT_SECRET
  await runTestWithEnv(undefined, undefined, (undefinedModule) => {
    assert.equal(undefinedModule.JWT_SECRET, "eventra-local-development-jwt-secret");
    assert.equal(undefinedModule.getJwtSecret(), "eventra-local-development-jwt-secret");
  });
  console.log("✓ Undefined environment missing JWT_SECRET returns dev fallback");

  console.log("All jwt-config unit tests passed successfully! ✓");
}

runTests().catch((err) => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
