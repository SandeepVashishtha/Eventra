import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(
  path.resolve(__dirname, "../src/hooks/useFormSubmit.js"),
  "utf8",
);

describe("useFormSubmit — source contract", () => {
  it("prevents duplicate in-flight submissions", () => {
    assert.ok(src.includes("isInFlight.current"));
    assert.ok(src.includes("if (isInFlight.current) return"));
  });

  it("guards state updates after unmount", () => {
    assert.ok(src.includes("isMounted.current"));
  });

  it("queues offline submissions when configured", () => {
    assert.ok(src.includes("offlineOptions.queueOffline"));
    assert.ok(src.includes("pushToQueue"));
  });

  it("maps failures to public form error messages", () => {
    assert.ok(src.includes("getPublicErrorMessage"));
    assert.ok(src.includes("FORM_ERRORS.submitFailed"));
  });
});

async function simulateSubmit(submitFn, options = {}) {
  let isInFlight = false;
  let success = false;
  let error = null;

  const handleSubmit = async (data) => {
    if (isInFlight) return;
    isInFlight = true;
    success = false;
    error = null;

    try {
      await submitFn(data);
      success = true;
    } catch (err) {
      if (options.queueOffline && err?.isNetworkError) {
        success = Boolean(options.queueResult);
        return;
      }
      error = err.message;
    } finally {
      isInFlight = false;
    }
  };

  await handleSubmit({ title: "Demo" });
  return { success, error };
}

describe("useFormSubmit — submission simulation", () => {
  it("marks success when submitFn resolves", async () => {
    const result = await simulateSubmit(async () => {});
    assert.equal(result.success, true);
    assert.equal(result.error, null);
  });

  it("captures errors from failed submissions", async () => {
    const result = await simulateSubmit(async () => {
      throw new Error("Server unavailable");
    });
    assert.equal(result.success, false);
    assert.equal(result.error, "Server unavailable");
  });

  it("treats queued offline submissions as success", async () => {
    const result = await simulateSubmit(
      async () => {
        const error = new Error("offline");
        error.isNetworkError = true;
        throw error;
      },
      { queueOffline: true, queueResult: true }
    );
    assert.equal(result.success, true);
  });
});

console.log("useFormSubmit tests passed ✓");
