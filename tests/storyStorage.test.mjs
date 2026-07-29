import assert from "node:assert/strict";

const store = {};
globalThis.window = {
  localStorage: {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { for (const k of Object.keys(store)) delete store[k]; },
  },
};

const {
  saveStory,
  getStories,
  getStoryById,
  removeStory,
  clearStories,
  STORY_TTL_MS,
} = await import("../src/utils/storyStorage.js");

try {
  // Empty state
  assert.deepEqual(getStories(), []);

  // Save a story
  const story = { id: "story_1", content: "Hello!", author: "user_1" };
  const saved = saveStory(story);
  assert.equal(saved.length, 1);
  assert.equal(saved[0].id, "story_1");
  assert.ok(saved[0].createdAt);

  // Retrieve by id
  const found = getStoryById("story_1");
  assert.ok(found);
  assert.equal(found.content, "Hello!");

  // Non-existent id
  assert.equal(getStoryById("nonexistent"), null);

  // Update existing story
  const updated = saveStory({ id: "story_1", content: "Updated!", author: "user_1" });
  assert.equal(updated.length, 1);
  assert.equal(updated[0].content, "Updated!");

  // Multiple stories
  saveStory({ id: "story_2", content: "Story two", author: "user_2" });
  const all = getStories();
  assert.equal(all.length, 2);

  // Remove story
  const afterRemove = removeStory("story_1");
  assert.equal(afterRemove.length, 1);
  assert.equal(getStoryById("story_1"), null);

  // Clear all
  clearStories();
  assert.deepEqual(getStories(), []);

  // TTL expiry
  const oldStory = { id: "old", content: "Old story", createdAt: new Date(Date.now() - STORY_TTL_MS - 1000).toISOString() };
  saveStory(oldStory);
  const afterTtl = getStories();
  assert.equal(afterTtl.length, 0);

  // Edge: null/undefined id
  const noId = saveStory({ content: "no id" });
  assert.deepEqual(noId, []);

  // Edge: invalid id removal returns unfiltered list
  const rem = removeStory(null);
  assert.equal(rem.length, 1);

  console.log("storyStorage tests passed ✓");
} finally {
  delete globalThis.window;
}
