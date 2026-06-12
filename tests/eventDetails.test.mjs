/**
 * Tests for EventDetails API fetch fix (issue #3490).
 *
 * Verifies that EventDetails fetches live event data from the API instead of
 * reading from the static mockEvents array, and falls back gracefully to mock
 * data when the API is unreachable.
 */

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(
  path.resolve(__dirname, '../src/Pages/Events/EventDetails.js'),
  'utf8',
);

// ---------------------------------------------------------------------------
// Source-level contract: mock data lookup removed, API fetch added
// ---------------------------------------------------------------------------

describe('EventDetails — mock data lookup removed', () => {
  it('does not use useMemo to look up from mockEvents', () => {
    const hasMockLookup =
      src.includes('mockEvents.find(') &&
      src.includes('useMemo');
    assert.ok(
      !hasMockLookup,
      'Must not use useMemo + mockEvents.find for the primary event load path',
    );
  });

  it('uses apiUtils.get to fetch the event from the backend', () => {
    assert.ok(
      src.includes('apiUtils.get(') && src.includes('API_ENDPOINTS.EVENTS.DETAIL('),
      'Must call apiUtils.get(API_ENDPOINTS.EVENTS.DETAIL(eventId)) to fetch live data',
    );
  });

  it('imports useCallback (used for loadEvent)', () => {
    assert.ok(
      src.includes('useCallback'),
      'loadEvent should be wrapped in useCallback for stable identity across renders',
    );
  });
});

describe('EventDetails — loading and error states', () => {
  it('has a fetchLoading state', () => {
    assert.ok(
      src.includes('fetchLoading'),
      'Must track loading state while the API request is in flight',
    );
  });

  it('has a fetchError state', () => {
    assert.ok(
      src.includes('fetchError'),
      'Must track error state when the API call fails and mock fallback also fails',
    );
  });

  it('renders a loading spinner while fetching', () => {
    assert.ok(
      src.includes('fetchLoading') && src.includes('animate-spin'),
      'Must show a spinner/loading indicator while the API request is in flight',
    );
  });

  it('renders an error message when event is not found', () => {
    assert.ok(
      src.includes('Event Not Found') || src.includes('not found'),
      'Must show a user-friendly not-found message when the event cannot be loaded',
    );
  });

  it('provides a retry button when loading fails', () => {
    assert.ok(
      src.includes('loadEvent') && src.includes('Try Again'),
      'Must provide a retry button that re-calls loadEvent on failure',
    );
  });
});

describe('EventDetails — mock fallback for offline/dev', () => {
  it('still imports mockEvents as offline fallback', () => {
    assert.ok(
      src.includes('mockEvents'),
      'mockEvents must be retained as a fallback when the API is unreachable',
    );
  });

  it('falls back to mockEvents in the catch block', () => {
    // The catch block should try mockEvents.find() before giving up
    const catchSection = src.slice(src.indexOf('} catch'), src.indexOf('} finally'));
    assert.ok(
      catchSection.includes('mockEvents'),
      'catch block must fall back to mockEvents when API call fails',
    );
  });
});

describe('EventDetails — no duplicate React import', () => {
  it('has at most one React import declaration', () => {
    const reactImports = src.match(/^import .* from ["']react["'];?$/gm) || [];
    assert.ok(
      reactImports.length <= 1,
      `Expected at most 1 React import declaration, found ${reactImports.length} — duplicate imports cause ESLint parse errors`,
    );
  });

  it('does not re-declare any top-level identifier twice', () => {
    // Check for duplicate import declarations by counting import lines for key identifiers
    const countImport = (name) =>
      (src.match(new RegExp(`\\bimport\\b.*\\b${name}\\b`, 'g')) || []).length;

    const duplicates = ['React', 'apiUtils', 'API_ENDPOINTS', 'mockEvents', 'useParams'].filter(
      (name) => countImport(name) > 1,
    );

    assert.deepStrictEqual(
      duplicates,
      [],
      `Found duplicate imports for: ${duplicates.join(', ')}`,
    );
  });
});

describe('EventDetails — stale request cancellation', () => {
  it('tracks the active event detail request with an AbortController ref', () => {
    assert.ok(
      src.includes('abortControllerRef') && src.includes('new AbortController()'),
      'Must create and retain an AbortController for the active event detail request',
    );
  });

  it('passes the AbortSignal into apiUtils.get', () => {
    assert.ok(
      src.includes('apiUtils.get(API_ENDPOINTS.EVENTS.DETAIL(eventId),') &&
        src.includes('signal: controller.signal'),
      'Must pass controller.signal to apiUtils.get so stale requests can be canceled',
    );
  });

  it('aborts stale requests before starting a new event detail load', () => {
    assert.ok(
      src.includes('abortControllerRef.current?.abort();') &&
        src.indexOf('abortControllerRef.current?.abort();') < src.indexOf('new AbortController()'),
      'Must abort the previous request before creating a new controller',
    );
  });

  it('ignores canceled request errors instead of falling back to stale mock data', () => {
    assert.ok(
      src.includes('isRequestCanceled(error, controller.signal)') &&
        src.includes('return;') &&
        src.indexOf('isRequestCanceled(error, controller.signal)') < src.indexOf('mockEvents.find('),
      'Must return early for canceled requests before mock fallback or error state updates',
    );
  });

  it('aborts the active request when EventDetails unmounts or the route param changes', () => {
    assert.ok(
      src.includes('return () =>') && src.includes('abortControllerRef.current?.abort();'),
      'Must abort the active request in the load effect cleanup',
    );
  });
});

describe('EventDetails — API fetch logic unit tests', () => {
  // Simulate the core loadEvent logic in isolation
  const buildFetchResult = (ok, status, data) => ({
    ok,
    status,
    data,
  });

  const extractEvent = (res, getEventStatus) => {
    if (res.ok && res.data) {
      const raw = res.data?.data ?? res.data;
      return { ...raw, status: getEventStatus(raw) };
    }
    return null;
  };

  const mockGetStatus = (event) =>
    event.date && new Date(event.date) < new Date() ? 'past' : 'upcoming';

  it('extracts event from res.data directly when no wrapper', () => {
    const res = buildFetchResult(true, 200, { id: '1', title: 'Test', date: '2099-01-01' });
    const event = extractEvent(res, mockGetStatus);
    assert.strictEqual(event?.title, 'Test');
    assert.strictEqual(event?.status, 'upcoming');
  });

  it('extracts event from res.data.data when wrapped', () => {
    const res = buildFetchResult(true, 200, {
      data: { id: '2', title: 'Wrapped', date: '2099-01-01' },
    });
    const event = extractEvent(res, mockGetStatus);
    assert.strictEqual(event?.title, 'Wrapped');
  });

  it('returns null when response is not ok', () => {
    const res = buildFetchResult(false, 404, { message: 'Not found' });
    const event = extractEvent(res, mockGetStatus);
    assert.strictEqual(event, null);
  });

  it('returns null when data is null', () => {
    const res = buildFetchResult(true, 200, null);
    const event = extractEvent(res, mockGetStatus);
    assert.strictEqual(event, null);
  });

  it('sets status to "past" for events in the past', () => {
    const res = buildFetchResult(true, 200, { id: '3', title: 'Past', date: '2020-01-01' });
    const event = extractEvent(res, mockGetStatus);
    assert.strictEqual(event?.status, 'past');
  });

  it('uses mockEvents fallback when API throws and id matches', () => {
    const mockEvents = [{ id: '42', title: 'Fallback Event', date: '2099-06-01' }];
    const eventId = '42';
    const fallback = mockEvents.find((item) => String(item.id) === eventId);
    assert.ok(fallback, 'Fallback lookup must find the event by id');
    assert.strictEqual(fallback.title, 'Fallback Event');
  });

  it('returns null when API throws and id does not match any mock', () => {
    const mockEvents = [{ id: '42', title: 'Fallback Event' }];
    const eventId = '999';
    const fallback = mockEvents.find((item) => String(item.id) === eventId);
    assert.strictEqual(fallback, undefined, 'Fallback must return undefined for unknown id');
  });
});
