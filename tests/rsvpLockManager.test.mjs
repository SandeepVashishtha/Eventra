import assert from "node:assert/strict";
import test from "node:test";
import { RsvpLockManager } from "../api/_lib/rsvpLockManager.js";

test("RsvpLockManager - Concurrency Locks Tracking", async (t) => {
  await t.test("should initialize empty map", () => {
    const manager = new RsvpLockManager();
    assert.equal(manager.getCount("event-1"), 0);
  });

  await t.test("should increment counter when requested", () => {
    const manager = new RsvpLockManager();
    assert.equal(manager.increment("event-1"), 1);
    assert.equal(manager.getCount("event-1"), 1);
    
    assert.equal(manager.increment("event-1"), 2);
    assert.equal(manager.getCount("event-1"), 2);
  });

  await t.test("should decrement and clean up when counter reaches 0", () => {
    const manager = new RsvpLockManager();
    manager.increment("event-1");
    manager.increment("event-1");
    
    assert.equal(manager.decrement("event-1"), 1);
    assert.equal(manager.getCount("event-1"), 1);
    
    assert.equal(manager.decrement("event-1"), 0);
    assert.equal(manager.getCount("event-1"), 0);
    
    // Internal counters map should not keep the key event-1
    assert.equal(manager.counters.has("event-1"), false);
  });

  await t.test("should handle double decrements gracefully without going negative", () => {
    const manager = new RsvpLockManager();
    assert.equal(manager.decrement("event-1"), 0);
    assert.equal(manager.getCount("event-1"), 0);
    assert.equal(manager.counters.has("event-1"), false);
  });

  await t.test("should track multiple events separately", () => {
    const manager = new RsvpLockManager();
    manager.increment("event-1");
    manager.increment("event-2");
    manager.increment("event-1");

    assert.equal(manager.getCount("event-1"), 2);
    assert.equal(manager.getCount("event-2"), 1);
  });

  await t.test("should handle null/undefined keys gracefully", () => {
    const manager = new RsvpLockManager();
    assert.equal(manager.increment(null), 0);
    assert.equal(manager.decrement(undefined), 0);
    assert.equal(manager.getCount(null), 0);
  });

  await t.test("should reset all counters", () => {
    const manager = new RsvpLockManager();
    manager.increment("event-1");
    manager.increment("event-2");
    manager.reset();
    
    assert.equal(manager.getCount("event-1"), 0);
    assert.equal(manager.getCount("event-2"), 0);
    assert.equal(manager.counters.size, 0);
  });
});
