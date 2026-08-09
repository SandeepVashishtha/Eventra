import { describe, test, assert, beforeEach } from "vitest";

describe("createConcurrencyLimiter", () => {
  let createConcurrencyLimiter;
  let runAll;

  beforeEach(async () => {
    const mod = await import("../../api/_lib/concurrency.js");
    createConcurrencyLimiter = mod.createConcurrencyLimiter;
    runAll = mod.runAll;
  });

  test("throws for concurrency less than 1", () => {
    assert.throws(() => createConcurrencyLimiter(0), /Concurrency must be at least 1/);
  });

  test("runs functions sequentially with concurrency 1", async () => {
    const limiter = createConcurrencyLimiter(1);
    const order = [];
    await Promise.all([
      limiter.run(() => order.push(1)),
      limiter.run(() => order.push(2)),
      limiter.run(() => order.push(3)),
    ]);
    assert.deepStrictEqual(order, [1, 2, 3]);
  });

  test("limits concurrent execution", async () => {
    const limiter = createConcurrencyLimiter(2);
    let concurrent = 0;
    let maxConcurrent = 0;
    const task = async () => {
      concurrent++;
      maxConcurrent = Math.max(maxConcurrent, concurrent);
      await new Promise((r) => setTimeout(r, 50));
      concurrent--;
    };
    await Promise.all([limiter.run(task), limiter.run(task), limiter.run(task), limiter.run(task)]);
    assert.ok(maxConcurrent <= 2, `Max concurrent was ${maxConcurrent}, expected <= 2`);
  });

  test("returns result from run", async () => {
    const limiter = createConcurrencyLimiter(5);
    const result = await limiter.run(() => 42);
    assert.strictEqual(result, 42);
  });

  test("propagates errors from run", async () => {
    const limiter = createConcurrencyLimiter(5);
    await assert.rejects(() => limiter.run(() => { throw new Error("test error"); }), /test error/);
  });
});

describe("runAll", () => {
  let runAll;

  beforeEach(async () => {
    const mod = await import("../../api/_lib/concurrency.js");
    runAll = mod.runAll;
  });

  test("runs all functions with concurrency limit", async () => {
    const results = await runAll(2, [
      () => 1,
      () => 2,
      () => 3,
    ]);
    assert.deepStrictEqual(results, [1, 2, 3]);
  });

  test("handles empty array", async () => {
    const results = await runAll(5, []);
    assert.deepStrictEqual(results, []);
  });

  test("propagates errors", async () => {
    await assert.rejects(() => runAll(2, [
      () => { throw new Error("fail"); },
    ]), /fail/);
  });
});
