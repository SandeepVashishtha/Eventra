import assert from "node:assert/strict";
import test from "node:test";

import { createSingleFlightGate } from "../src/lib/single-flight.mjs";

test("only one lease can be active at a time", () => {
  const gate = createSingleFlightGate();

  const firstLease = gate.acquire();

  assert.ok(firstLease);
  assert.equal(gate.acquire(), null);
});

test("a released gate can be acquired again", () => {
  const gate = createSingleFlightGate();
  const firstLease = gate.acquire();

  firstLease.release();

  assert.ok(gate.acquire());
});

test("a duplicate stale release cannot unlock the current lease", () => {
  const gate = createSingleFlightGate();
  const staleLease = gate.acquire();
  staleLease.release();
  const currentLease = gate.acquire();

  staleLease.release();

  assert.equal(gate.acquire(), null);
  currentLease.release();
  assert.ok(gate.acquire());
});

test("concurrent request launch attempts enter the request body once", async () => {
  const gate = createSingleFlightGate();
  let requestCalls = 0;
  let finishRequest;
  const requestFinished = new Promise((resolve) => {
    finishRequest = resolve;
  });

  async function launchRequest() {
    const lease = gate.acquire();
    if (!lease) return false;

    requestCalls += 1;
    try {
      await requestFinished;
      return true;
    } finally {
      lease.release();
    }
  }

  const initialRequest = launchRequest();
  const concurrentRefresh = launchRequest();

  assert.equal(requestCalls, 1);
  assert.equal(await concurrentRefresh, false);

  finishRequest();
  assert.equal(await initialRequest, true);
  assert.equal(await launchRequest(), true);
  assert.equal(requestCalls, 2);
});
