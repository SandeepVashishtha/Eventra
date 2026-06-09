import assert from "node:assert/strict";

const handlerModule = await import("../api/feedback.js");
const feedbackHandler = handlerModule.default;

function makeRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

function createStore(seed = {}) {
  const records = new Map(
    Object.entries(seed).map(([eventId, feedback]) => [eventId, feedback.map((item) => ({ ...item }))])
  );

  return {
    async listByEvent(eventId) {
      return records.get(eventId) || [];
    },
    async getByEventAndUser(eventId, userId) {
      return (records.get(eventId) || []).find((feedback) => feedback.userId === userId) || null;
    },
    async create(feedback) {
      const eventFeedback = records.get(feedback.eventId) || [];
      eventFeedback.push(feedback);
      records.set(feedback.eventId, eventFeedback);
      return feedback;
    },
  };
}

{
  const res = makeRes();
  await feedbackHandler({ method: "POST", user: { id: "u1" }, body: { rating: 5, comment: "Great event" } }, res, {
    store: createStore(),
  });
  assert.equal(res.statusCode, 400, "POST requires eventId");
  assert.equal(res.body.error, "Event id is required");
}

{
  const res = makeRes();
  await feedbackHandler({ method: "POST", user: { id: "u1" }, body: { eventId: "e1", rating: 6, comment: "Great event" } }, res, {
    store: createStore(),
  });
  assert.equal(res.statusCode, 400, "POST validates rating bounds");
  assert.equal(res.body.error, "Rating must be an integer from 1 to 5");
}

{
  const store = createStore();
  const res = makeRes();
  await feedbackHandler(
    {
      method: "POST",
      user: { id: "u1" },
      body: {
        eventId: "e1",
        rating: 5,
        comment: "Loved the sessions",
        tags: ["Well Organized", "", "Networking"],
      },
    },
    res,
    { store }
  );

  assert.equal(res.statusCode, 201, "valid feedback is created");
  assert.equal(res.body.submitted, true);
  assert.equal(res.body.feedback.rating, 5);
  assert.deepEqual(res.body.feedback.tags, ["Well Organized", "Networking"]);

  const duplicateRes = makeRes();
  await feedbackHandler(
    {
      method: "POST",
      user: { id: "u1" },
      body: {
        eventId: "e1",
        rating: 4,
        comment: "Trying again",
      },
    },
    duplicateRes,
    { store }
  );
  assert.equal(duplicateRes.statusCode, 409, "duplicate event/user feedback is rejected");
}

{
  const res = makeRes();
  await feedbackHandler(
    {
      method: "GET",
      user: { id: "u2" },
      query: { eventId: "e2" },
    },
    res,
    {
      store: createStore({
        e2: [
          { eventId: "e2", userId: "u1", rating: 4, comment: "Good" },
          { eventId: "e2", userId: "u2", rating: 5, comment: "Excellent" },
        ],
      }),
    }
  );

  assert.equal(res.statusCode, 200, "GET returns feedback summary");
  assert.equal(res.body.feedback, undefined, "GET does not expose raw feedback records");
  assert.equal(res.body.summary.count, 2);
  assert.equal(res.body.summary.averageRating, 4.5);
  assert.equal(res.body.submitted, true);
  assert.equal(res.body.userFeedback.userId, undefined, "GET does not echo user identifiers");
  assert.equal(res.body.userFeedback.rating, 5);
}

{
  const res = makeRes();
  await feedbackHandler(
    {
      method: "POST",
      body: {
        eventId: "e1",
        rating: 5,
        comment: "Great event",
        userId: "spoofed-user",
      },
    },
    res,
    { store: createStore() }
  );
  assert.equal(res.statusCode, 401, "POST rejects unauthenticated client-supplied userId");
}

{
  const res = makeRes();
  await feedbackHandler({ method: "DELETE" }, res, { store: createStore() });
  assert.equal(res.statusCode, 405, "unsupported methods are rejected");
}

console.log("feedback endpoint tests passed ✓");
