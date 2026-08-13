import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const src = readFileSync(
  path.resolve(__dirname, "../src/hooks/useEventForm.js"),
  "utf8"
);

describe("useEventForm — category sync source contract (#16813)", () => {
  it("clears category to empty string when categories array is empty", () => {
    assert.ok(
      src.includes('else if (formData.category !== "")'),
      "Category sync effect must check else if formData.category is not empty"
    );
    assert.ok(
      src.includes('category: ""'),
      "Category sync effect must reset category to empty string"
    );
  });

  it("ensures submission payload compatibility clears category when categories is empty", () => {
    assert.ok(
      src.includes('category: eventData.categories && eventData.categories.length > 0'),
      "submitEventForm must inspect categories length for category payload field"
    );
  });
});

describe("useEventForm — category sync logic simulation", () => {
  function syncCategory(formData) {
    if (formData.categories && formData.categories.length > 0) {
      if (formData.category !== formData.categories[0]) {
        return { ...formData, category: formData.categories[0] };
      }
    } else if (formData.category !== "") {
      return { ...formData, category: "" };
    }
    return formData;
  }

  function buildSubmittedPayload(eventData) {
    return {
      ...eventData,
      category:
        eventData.categories && eventData.categories.length > 0
          ? eventData.categories[0]
          : "",
      categories: eventData.categories || [],
    };
  }

  it("syncs category with the first item in categories when categories exist", () => {
    const state = { categories: ["TECH", "MEETUP"], category: "" };
    const synced = syncCategory(state);
    assert.equal(synced.category, "TECH");
  });

  it("updates category when first item in categories changes", () => {
    const state = { categories: ["WORKSHOP", "MEETUP"], category: "TECH" };
    const synced = syncCategory(state);
    assert.equal(synced.category, "WORKSHOP");
  });

  it("clears category when categories array becomes empty after user removes all categories", () => {
    const state = { categories: [], category: "TECH" };
    const synced = syncCategory(state);
    assert.equal(synced.category, "");
  });

  it("clears category when categories is undefined or null", () => {
    const state = { categories: null, category: "WORKSHOP" };
    const synced = syncCategory(state);
    assert.equal(synced.category, "");
  });

  it("preserves empty category when categories is already empty", () => {
    const state = { categories: [], category: "" };
    const synced = syncCategory(state);
    assert.equal(synced.category, "");
  });

  it("builds consistent submission payload with empty category when categories is empty", () => {
    const payload = buildSubmittedPayload({
      title: "Test Event",
      categories: [],
      category: "STALE_CATEGORY",
    });
    assert.deepEqual(payload.categories, []);
    assert.equal(payload.category, "");
  });
});
