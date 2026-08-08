// Tests for the early lock-acquisition fix in the registration flow.
//
// Race condition: handleSubmit checked guards but did not acquire the lock
// before the first await. A concurrent submit arriving during async capacity
// checks or conflict detection passed both guards and launched a parallel flow.
// handleConflictProceed had no guards at all.
//
// The fix acquires both guards immediately after the synchronous checks,
// before any async work, and adds equivalent guards to handleConflictProceed.

import assert from "node:assert/strict";

function makeRegistrationLocks() { return new Map(); }
function makeRef(v) { return { current: v }; }

function makeFlow(opts) {
  const { locks, submittingRef, eventId } = opts;
  const checkCapacity  = opts.checkCapacity  || (() => Promise.resolve(false));
  const checkConflicts = opts.checkConflicts || (() => Promise.resolve(false));
  const doRequest      = opts.doRequest      || (() => Promise.resolve());
  const callLog = { submitted: 0, conflictProceed: 0, blocked: 0 };

  const proceedWithRegistration = async () => {
    try { await doRequest(); callLog.submitted++; }
    catch(e) { /* network error -- swallowed like real code catch block */ }
    finally { locks.delete(eventId); submittingRef.current = false; }
  };

  const handleSubmit = async () => {
    if (submittingRef.current) { callLog.blocked++; return; }
    if (locks.has(eventId))    { callLog.blocked++; return; }
    submittingRef.current = true;
    locks.set(eventId, true);
    let conflictDetected = false;
    try {
      await checkCapacity();
      conflictDetected = await checkConflicts();
    } catch(err) {
      submittingRef.current = false;
      locks.delete(eventId);
      return;
    }
    if (conflictDetected) {
      submittingRef.current = false;
      locks.delete(eventId);
      return;
    }
    await proceedWithRegistration();
  };

  const handleConflictProceed = () => {
    if (submittingRef.current) { callLog.blocked++; return; }
    if (locks.has(eventId))    { callLog.blocked++; return; }
    submittingRef.current = true;
    locks.set(eventId, true);
    proceedWithRegistration();
  };

  return { handleSubmit, handleConflictProceed, callLog };
}

let passed = 0; let failed = 0;
async function test(label, fn) {
  try { await fn(); console.log("  pass  " + label); passed++; }
  catch (err) { console.error("  FAIL  " + label); console.error("        " + err.message); failed++; }
}

const delay = ms => new Promise(res => setTimeout(res, ms));

const runAll = async () => {
  console.log("");
  console.log("Single normal submission");

  await test("single submit increments submitted count to 1", async () => {
    const locks=makeRegistrationLocks(), ref=makeRef(false);
    const {handleSubmit,callLog}=makeFlow({locks,submittingRef:ref,eventId:"42"});
    await handleSubmit();
    assert.equal(callLog.submitted, 1);
    assert.equal(callLog.blocked, 0);
  });

  await test("lock is released after successful submission", async () => {
    const locks=makeRegistrationLocks(), ref=makeRef(false);
    const {handleSubmit}=makeFlow({locks,submittingRef:ref,eventId:"42"});
    await handleSubmit();
    assert.equal(ref.current, false, "isSubmittingRef must be false after completion");
    assert.equal(locks.has("42"), false, "registrationLocks must be cleared after completion");
  });

  console.log("");
  console.log("Rapid repeated submit clicks");

  await test("second submit while first is in-flight is blocked", async () => {
    const locks=makeRegistrationLocks(), ref=makeRef(false);
    let release; const slow=()=>new Promise(r=>{release=r;});
    const {handleSubmit,callLog}=makeFlow({locks,submittingRef:ref,eventId:"42",checkCapacity:slow});
    const p1=handleSubmit(); const p2=handleSubmit();
    release();
    await Promise.all([p1,p2]);
    assert.equal(callLog.submitted, 1, "only one must reach network");
    assert.equal(callLog.blocked,   1, "second must be blocked");
  });

  await test("lock is released after rapid-double-click", async () => {
    const locks=makeRegistrationLocks(), ref=makeRef(false);
    let go; const slow=()=>new Promise(r=>{go=r;});
    const {handleSubmit}=makeFlow({locks,submittingRef:ref,eventId:"42",checkCapacity:slow});
    const p1=handleSubmit(); handleSubmit(); go(); await p1;
    assert.equal(ref.current, false);
    assert.equal(locks.has("42"), false);
  });

  console.log("");
  console.log("Multiple concurrent submissions");

  await test("only one of three concurrent submits reaches the network", async () => {
    const locks=makeRegistrationLocks(), ref=makeRef(false);
    let go; const slow=()=>new Promise(r=>{go=r;});
    const {handleSubmit,callLog}=makeFlow({locks,submittingRef:ref,eventId:"99",checkCapacity:slow});
    const p1=handleSubmit(),p2=handleSubmit(),p3=handleSubmit();
    go(); await Promise.all([p1,p2,p3]);
    assert.equal(callLog.submitted, 1);
    assert.equal(callLog.blocked,   2);
  });

  await test("lock is fully released after concurrent burst", async () => {
    const locks=makeRegistrationLocks(), ref=makeRef(false);
    let go; const slow=()=>new Promise(r=>{go=r;});
    const {handleSubmit}=makeFlow({locks,submittingRef:ref,eventId:"99",checkCapacity:slow});
    const p1=handleSubmit(), p2=handleSubmit(); go(); await Promise.all([p1,p2]);
    assert.equal(ref.current, false);
    assert.equal(locks.has("99"), false);
  });

  console.log("");
  console.log("Conflict modal path");

  await test("lock is released when conflict modal is shown", async () => {
    const locks=makeRegistrationLocks(), ref=makeRef(false);
    const {handleSubmit,callLog}=makeFlow({locks,submittingRef:ref,eventId:"5",checkConflicts:()=>Promise.resolve(true)});
    await handleSubmit();
    assert.equal(callLog.submitted, 0, "must not submit when conflict detected");
    assert.equal(ref.current, false, "lock released when modal opens");
    assert.equal(locks.has("5"), false, "registrationLocks cleared when modal opens");
  });

  await test("handleConflictProceed submits after lock is released", async () => {
    const locks=makeRegistrationLocks(), ref=makeRef(false);
    const {handleSubmit,handleConflictProceed,callLog}=makeFlow({locks,submittingRef:ref,eventId:"5",checkConflicts:()=>Promise.resolve(true)});
    await handleSubmit();
    handleConflictProceed();
    await delay(10);
    assert.equal(callLog.submitted, 1, "proceed must submit after conflict modal");
  });

  await test("double-click Proceed: only one reaches network", async () => {
    const locks=makeRegistrationLocks(), ref=makeRef(false);
    const {handleSubmit,handleConflictProceed,callLog}=makeFlow({locks,submittingRef:ref,eventId:"5",checkConflicts:()=>Promise.resolve(true)});
    await handleSubmit();
    handleConflictProceed();
    handleConflictProceed();
    await delay(20);
    assert.equal(callLog.submitted, 1, "only one proceed must reach network");
    assert.equal(callLog.blocked,   1, "second proceed must be blocked");
  });

  await test("new submit blocked while conflict check is in-flight", async () => {
    const locks=makeRegistrationLocks(), ref=makeRef(false);
    let releaseConflict;
    const slowConflict=()=>new Promise(r=>{releaseConflict=r;});
    const {handleSubmit,callLog}=makeFlow({locks,submittingRef:ref,eventId:"7",checkConflicts:slowConflict});
    const p1=handleSubmit(); const p2=handleSubmit();
    // Allow the default checkCapacity (Promise.resolve) to resolve so that
    // handleSubmit reaches checkConflicts and sets releaseConflict.
    await delay(0);
    releaseConflict(true);
    await Promise.all([p1,p2]);
    assert.equal(callLog.blocked, 1, "second submit must be blocked during conflict check");
  });

  console.log("");
  console.log("Lock release on failure paths");

  await test("lock released when capacity check throws", async () => {
    const locks=makeRegistrationLocks(), ref=makeRef(false);
    const {handleSubmit}=makeFlow({locks,submittingRef:ref,eventId:"e1",checkCapacity:()=>Promise.reject(new Error("net"))});
    await handleSubmit();
    assert.equal(ref.current, false);
    assert.equal(locks.has("e1"), false);
  });

  await test("lock released when conflict check throws", async () => {
    const locks=makeRegistrationLocks(), ref=makeRef(false);
    const {handleSubmit}=makeFlow({locks,submittingRef:ref,eventId:"e2",checkConflicts:()=>Promise.reject(new Error("net"))});
    await handleSubmit();
    assert.equal(ref.current, false);
    assert.equal(locks.has("e2"), false);
  });

  await test("lock released when network request throws", async () => {
    const locks=makeRegistrationLocks(), ref=makeRef(false);
    const {handleSubmit}=makeFlow({locks,submittingRef:ref,eventId:"e3",doRequest:()=>Promise.reject(new Error("500"))});
    await handleSubmit();
    assert.equal(ref.current, false);
    assert.equal(locks.has("e3"), false);
  });

  await test("new submit succeeds after previous failed", async () => {
    const locks=makeRegistrationLocks(), ref=makeRef(false);
    let n=0; const req=()=>{ n++; return n===1?Promise.reject(new Error("fail")):Promise.resolve(); };
    const {handleSubmit,callLog}=makeFlow({locks,submittingRef:ref,eventId:"retry",doRequest:req});
    await handleSubmit();
    await handleSubmit();
    assert.equal(callLog.submitted, 1);
  });

  console.log("");
  console.log("Regression: race window in original code");

  await test("original bug: two concurrent submits both reached network -- fix prevents it", async () => {
    function makeBuggyFlow(opts) {
      const {locks,submittingRef,eventId}=opts;
      const checkCapacity=opts.checkCapacity||(() => Promise.resolve(false));
      const doRequest=opts.doRequest||(() => Promise.resolve());
      const callLog={submitted:0,blocked:0};
      const proceedOld=async()=>{
        locks.set(eventId,true); submittingRef.current=true;
        try{await doRequest();callLog.submitted++;}
        finally{locks.delete(eventId);submittingRef.current=false;}
      };
      const handleSubmitBuggy=async()=>{
        if(submittingRef.current){callLog.blocked++;return;}
        if(locks.has(eventId)){callLog.blocked++;return;}
        // NO lock acquisition here (the bug)
        await checkCapacity();
        await proceedOld();
      };
      return {handleSubmitBuggy,callLog};
    }

    const locks=makeRegistrationLocks(),ref=makeRef(false);
    let go;
    // Shared promise: both concurrent calls get the same instance so a
    // single go() unblocks all awaiting callers (the buggy flow acquires
    // no lock before the first await, so both calls reach checkCapacity).
    const shared=new Promise(r=>{go=r;}); const slow=()=>shared;
    const {handleSubmitBuggy,callLog}=makeBuggyFlow({locks,submittingRef:ref,eventId:"race",checkCapacity:slow});
    const p1=handleSubmitBuggy(); const p2=handleSubmitBuggy();
    go(); await Promise.all([p1,p2]);
    assert.equal(callLog.submitted, 2, "OLD code: both flows reached network (bug confirmed)");

    const locks2=makeRegistrationLocks(),ref2=makeRef(false);
    let go2; const slow2=()=>new Promise(r=>{go2=r;});
    const {handleSubmit,callLog:log2}=makeFlow({locks:locks2,submittingRef:ref2,eventId:"race",checkCapacity:slow2});
    const q1=handleSubmit(); const q2=handleSubmit();
    go2(); await Promise.all([q1,q2]);
    assert.equal(log2.submitted, 1, "FIXED code: only one flow reaches network");
    assert.equal(log2.blocked,   1, "second submit is blocked immediately");
  });

  await test("regression: three concurrent submits, exactly one proceeds", async () => {
    const locks=makeRegistrationLocks(),ref=makeRef(false);
    let go; const slow=()=>new Promise(r=>{go=r;});
    const {handleSubmit,callLog}=makeFlow({locks,submittingRef:ref,eventId:"reg3",checkCapacity:slow});
    const p1=handleSubmit(),p2=handleSubmit(),p3=handleSubmit();
    go(); await Promise.all([p1,p2,p3]);
    assert.equal(callLog.submitted,1);
    assert.equal(callLog.blocked,2);
  });

  await test("lock is not held before submit begins (guards precondition)", async () => {
    const locks=makeRegistrationLocks(), ref=makeRef(false);
    assert.equal(ref.current, false);
    assert.equal(locks.size, 0);
  });

  const total=passed+failed;
  console.log("");
  console.log(total+" tests: "+passed+" passed, "+failed+" failed");
  if(failed>0) process.exit(1);
};

runAll().catch(err=>{console.error(err);process.exit(1);});
