import assert from "node:assert/strict";
import test from "node:test";
import { ConcurrencyLimiter, createConcurrencyLimiter, runAll } from "../api/_lib/concurrency.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test("ConcurrencyLimiter - Core Behavior", async (t) => {
  await t.test("should throw if invalid concurrency value is passed", () => {
    assert.throws(() => new ConcurrencyLimiter(0), /Concurrency must be a number/);
    assert.throws(() => new ConcurrencyLimiter(-5), /Concurrency must be a number/);
    assert.throws(() => new ConcurrencyLimiter("invalid"), /Concurrency must be a number/);
  });

  await t.test("should execute tasks sequentially or concurrently based on limit", async () => {
    const limiter = new ConcurrencyLimiter(2);
    let active = 0;
    let maxActive = 0;

    const task = async (id, ms) => {
      active++;
      maxActive = Math.max(maxActive, active);
      await delay(ms);
      active--;
      return id;
    };

    const promises = [
      limiter.run(() => task(1, 40)),
      limiter.run(() => task(2, 40)),
      limiter.run(() => task(3, 40)),
      limiter.run(() => task(4, 40))
    ];

    const results = await Promise.all(promises);
    assert.deepEqual(results, [1, 2, 3, 4]);
    assert.equal(maxActive, 2, "Should never exceed maximum active limit of 2");
    assert.equal(active, 0, "All tasks should have finished");
  });

  await t.test("should prevent microtask queue race condition", async () => {
    // This is the core regression test for the race condition bug
    const limiter = new ConcurrencyLimiter(1);
    let active = 0;
    let maxActive = 0;

    const task = async (id, ms) => {
      active++;
      maxActive = Math.max(maxActive, active);
      await delay(ms);
      active--;
      return id;
    };

    const p1 = limiter.run(() => task(1, 20));
    const p2 = limiter.run(() => task(2, 20));
    
    // Allow p1 to finish, but immediately queue p3 synchronously after p1 completes
    await p1;
    
    // In the old code, activeCount was decremented synchronously in next()
    // but p2 hadn't incremented activeCount yet (as it is scheduled as a microtask).
    // So activeCount would be 0, and p3 would bypass the queue and run immediately,
    // resulting in BOTH p2 and p3 running concurrently (violating concurrency=1).
    const p3 = limiter.run(() => task(3, 20));

    await Promise.all([p2, p3]);

    assert.equal(maxActive, 1, "Microtask race allowed concurrency to be exceeded!");
  });

  await t.test("should isolate errors and continue running subsequent tasks", async () => {
    const limiter = new ConcurrencyLimiter(1);

    const taskOk = async () => "ok";
    const taskErr = async () => { throw new Error("task failed"); };

    const r1 = await limiter.run(taskOk);
    assert.equal(r1, "ok");

    await assert.rejects(() => limiter.run(taskErr), /task failed/);

    const r2 = await limiter.run(taskOk);
    assert.equal(r2, "ok", "Limiter should still work after previous task failed");
    assert.equal(limiter.activeCount, 0, "activeCount should reset to 0");
  });

  await t.test("should support createConcurrencyLimiter factory wrapper", async () => {
    const limiter = createConcurrencyLimiter(1);
    let active = 0;
    let maxActive = 0;

    const task = async () => {
      active++;
      maxActive = Math.max(maxActive, active);
      await delay(10);
      active--;
    };

    await Promise.all([limiter.run(task), limiter.run(task)]);
    assert.equal(maxActive, 1);
  });

  await t.test("should support runAll concurrent executor", async () => {
    let active = 0;
    let maxActive = 0;

    const task = (id) => async () => {
      active++;
      maxActive = Math.max(maxActive, active);
      await delay(10);
      active--;
      return id;
    };

    const fns = [task(1), task(2), task(3)];
    const results = await runAll(2, fns);

    assert.deepEqual(results, [1, 2, 3]);
    assert.equal(maxActive, 2);
  });
});
