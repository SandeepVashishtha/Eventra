import assert from "node:assert/strict";
import test from "node:test";

let store = {};
let throwError = false;

globalThis.window = globalThis;
globalThis.localStorage = {
  getItem(key) {
    if (throwError) throw new Error("Storage simulated error");
    return key in store ? store[key] : null;
  },
  setItem(key, value) {
    if (throwError) throw new Error("Storage simulated error");
    store[key] = String(value);
  },
  removeItem(key) {
    if (throwError) throw new Error("Storage simulated error");
    delete store[key];
  },
};

const {
  omitDraftFields,
  readDraft,
  writeDraft,
  removeDraft,
  formatDraftAge,
} = await import("../src/hooks/useFormDraft.js");

const KEY = "test_draft_key";

test.beforeEach(() => {
  store = {};
  throwError = false;
});

test("omitDraftFields drops excluded keys without mutating the source", () => {
  const values = { title: "Demo", banner: {}, bannerPreview: "blob:x" };
  const result = omitDraftFields(values, ["banner", "bannerPreview"]);

  assert.deepEqual(result, { title: "Demo" });
  assert.deepEqual(Object.keys(values).sort(), ["banner", "bannerPreview", "title"]);
});

test("writeDraft then readDraft round-trips values and a timestamp", () => {
  const savedAt = writeDraft(KEY, { title: "Hack Night", tags: ["react"] });

  assert.ok(savedAt);
  const draft = readDraft(KEY);
  assert.deepEqual(draft.values, { title: "Hack Night", tags: ["react"] });
  assert.equal(draft.savedAt, savedAt);
});

test("readDraft returns null when nothing is stored or the payload is unusable", () => {
  assert.equal(readDraft(KEY), null);
  assert.equal(readDraft(""), null);

  store[KEY] = "{not json";
  assert.equal(readDraft(KEY), null);

  store[KEY] = "[1,2,3]";
  assert.equal(readDraft(KEY), null);
});

test("readDraft accepts legacy drafts stored as bare values", () => {
  store[KEY] = JSON.stringify({ title: "Legacy" });

  assert.deepEqual(readDraft(KEY), { values: { title: "Legacy" }, savedAt: null });
});

test("removeDraft deletes the stored draft", () => {
  writeDraft(KEY, { title: "Temp" });
  removeDraft(KEY);

  assert.equal(readDraft(KEY), null);
});

test("storage failures are swallowed rather than crashing the form", () => {
  throwError = true;

  assert.equal(writeDraft(KEY, { title: "Boom" }), null);
  assert.equal(readDraft(KEY), null);
  assert.doesNotThrow(() => removeDraft(KEY));
});

test("formatDraftAge renders a human-readable age", () => {
  const now = Date.parse("2026-01-01T12:00:00.000Z");
  const ago = (ms) => new Date(now - ms).toISOString();

  assert.equal(formatDraftAge(ago(2_000), now), "just now");
  assert.equal(formatDraftAge(ago(30_000), now), "30 seconds ago");
  assert.equal(formatDraftAge(ago(60_000), now), "1 minute ago");
  assert.equal(formatDraftAge(ago(5 * 60_000), now), "5 minutes ago");
  assert.equal(formatDraftAge(ago(3 * 3_600_000), now), "3 hours ago");
  assert.equal(formatDraftAge(ago(2 * 86_400_000), now), "2 days ago");
  assert.equal(formatDraftAge(null, now), "");
  assert.equal(formatDraftAge("not-a-date", now), "");
});
