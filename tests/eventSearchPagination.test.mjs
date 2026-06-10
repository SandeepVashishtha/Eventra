import assert from "node:assert/strict";

const {
  normalizePagination,
  buildPageResponse,
  paginateArray,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} = await import("../api/lib/pagination.js");
const handlerModule = await import("../api/events/search.js");
const searchEventsHandler = handlerModule.default;

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

// --- normalizePagination defaults and clamping ---
{
  const d = normalizePagination({});
  assert.equal(d.page, 1, "default page 1");
  assert.equal(d.pageSize, DEFAULT_PAGE_SIZE, "default page size");
  assert.equal(d.offset, 0, "default offset 0");

  const clamped = normalizePagination({ pageSize: "10000" });
  assert.equal(clamped.pageSize, MAX_PAGE_SIZE, "page size clamped to max");

  const p3 = normalizePagination({ page: "3", pageSize: "20" });
  assert.equal(p3.offset, 40, "offset computed from page and size");

  const bad = normalizePagination({ page: "-5", pageSize: "abc" });
  assert.equal(bad.page, 1, "negative page falls back to 1");
  assert.equal(bad.pageSize, DEFAULT_PAGE_SIZE, "non-numeric size falls back");
}

// --- buildPageResponse metadata ---
{
  const env = buildPageResponse({
    items: [1, 2, 3],
    total: 53,
    page: 1,
    pageSize: 20,
  });
  assert.deepEqual(env.data, [1, 2, 3], "items echoed in data");
  assert.equal(env.pagination.totalPages, 3, "53/20 -> 3 pages");
  assert.equal(env.pagination.hasNextPage, true, "has next page");
  assert.equal(env.pagination.hasPreviousPage, false, "no previous on page 1");

  const last = buildPageResponse({ items: [], total: 0, page: 1, pageSize: 20 });
  assert.equal(last.pagination.totalPages, 0, "no results -> 0 pages");
  assert.equal(last.pagination.hasNextPage, false, "no next when empty");
}

// --- paginateArray slices correctly ---
{
  const arr = Array.from({ length: 100 }, (_, i) => i);
  assert.deepEqual(paginateArray(arr, 0, 5), [0, 1, 2, 3, 4], "first page");
  assert.deepEqual(paginateArray(arr, 95, 20), [95, 96, 97, 98, 99], "tail page");
  assert.deepEqual(paginateArray(null, 0, 5), [], "non-array yields empty");
}

// --- handler: rejects non-GET ---
{
  const res = makeRes();
  await searchEventsHandler({ method: "POST", query: {} }, res, {
    searchEvents: async () => [],
  });
  assert.equal(res.statusCode, 405, "non-GET rejected");
}

// --- handler: returns at most pageSize even if source returns everything ---
{
  const allEvents = Array.from({ length: 5000 }, (_, i) => ({ id: i }));
  const res = makeRes();
  await searchEventsHandler(
    { method: "GET", query: { q: "concert" } },
    res,
    {
      // Simulate a naive data source that ignores offset/pageSize.
      searchEvents: async () => allEvents,
      countEvents: async () => allEvents.length,
    }
  );
  assert.equal(res.statusCode, 200, "search returns 200");
  assert.equal(
    res.body.data.length,
    DEFAULT_PAGE_SIZE,
    "response capped to default page size despite huge source"
  );
  assert.equal(res.body.pagination.total, 5000, "total reported");
  assert.equal(res.body.pagination.totalPages, 250, "5000/20 -> 250 pages");
}

// --- handler: honours native pagination and page selection ---
{
  let received;
  const res = makeRes();
  await searchEventsHandler(
    { method: "GET", query: { q: "music", page: "3", pageSize: "10" } },
    res,
    {
      searchEvents: async ({ query, offset, pageSize }) => {
        received = { query, offset, pageSize };
        return Array.from({ length: pageSize }, (_, i) => ({ id: offset + i }));
      },
      countEvents: async () => 100,
    }
  );
  assert.equal(res.statusCode, 200, "paginated search returns 200");
  assert.deepEqual(
    received,
    { query: "music", offset: 20, pageSize: 10 },
    "offset/pageSize passed to data source"
  );
  assert.equal(res.body.data.length, 10, "page contains pageSize items");
  assert.equal(res.body.pagination.page, 3, "current page echoed");
  assert.equal(res.body.pagination.hasPreviousPage, true, "has previous on page 3");
}

// --- handler: missing service fails closed ---
{
  const res = makeRes();
  await searchEventsHandler({ method: "GET", query: {} }, res, {});
  assert.equal(res.statusCode, 503, "missing searchEvents returns 503");
}

console.log("event search pagination tests passed ✓");
