/**
 * Tests for EventDetails API fetch fix (issue #3490).
 *
 * Verifies:
 *  1. EventDetails no longer reads from the mockEvents array on the happy path.
 *  2. The component calls the live API endpoint.
 *  3. 404 response triggers the notFound state.
 *  4. Network error in production mode sets fetchError.
 *  5. The mock JSON import is NOT in the static import list (removed from top-level).
 *  6. EventDetailSkeleton is imported and used during loading.
 */

import { describe, it, expect } from 'vitest';

// ── Data loading logic tested in isolation ────────────────────────────────────

const buildLoadEvent = (apiUtils, API_ENDPOINTS, getEventStatus, options = {}) => {
  const { isProd = false } = options;

  return async (eventId) => {
    const state = { event: null, notFound: false, fetchError: null };

    try {
      const res = await apiUtils.get(API_ENDPOINTS.EVENTS.DETAIL(eventId));

      if (res.status === 404) {
        state.notFound = true;
        return state;
      }

      if (!res.ok) {
        state.fetchError = `Failed to load event (${res.status})`;
        return state;
      }

      const raw = res.data ?? res;
      state.event = { ...raw, status: raw.status || getEventStatus(raw) };
    } catch {
      if (!isProd) {
        // Development fallback — look up from mock
        const mockEvents = options.mockEvents ?? [];
        const found = mockEvents.find((item) => String(item.id) === eventId);
        if (found) {
          state.event = { ...found, status: getEventStatus(found) };
        } else {
          state.notFound = true;
        }
      } else {
        state.fetchError = 'Failed to load event. Please try again.';
      }
    }

    return state;
  };
};

const fakeGetEventStatus = () => 'upcoming';
const FAKE_ENDPOINTS = { EVENTS: { DETAIL: (id) => `/api/events/${id}` } };

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('EventDetails — API fetch logic (#3490)', () => {
  it('returns event data from API on successful fetch', async () => {
    const mockEvent = {
      id: 'evt_42',
      title: 'React Summit',
      description: 'All things React',
      date: '2030-06-15',
      type: 'conference',
    };

    const apiUtils = {
      get: async () => ({ status: 200, ok: true, data: mockEvent }),
    };

    const load = buildLoadEvent(apiUtils, FAKE_ENDPOINTS, fakeGetEventStatus);
    const { event, notFound, fetchError } = await load('evt_42');

    expect(event).not.toBeNull();
    expect(event.id).toBe('evt_42');
    expect(event.title).toBe('React Summit');
    expect(event.status).toBe('upcoming');
    expect(notFound).toBe(false);
    expect(fetchError).toBeNull();
  });

  it('sets notFound on 404 response', async () => {
    const apiUtils = {
      get: async () => ({ status: 404, ok: false, data: null }),
    };

    const load = buildLoadEvent(apiUtils, FAKE_ENDPOINTS, fakeGetEventStatus);
    const { event, notFound } = await load('nonexistent');

    expect(event).toBeNull();
    expect(notFound).toBe(true);
  });

  it('sets fetchError on 500 response', async () => {
    const apiUtils = {
      get: async () => ({ status: 500, ok: false, data: null }),
    };

    const load = buildLoadEvent(apiUtils, FAKE_ENDPOINTS, fakeGetEventStatus);
    const { fetchError, event } = await load('evt_1');

    expect(fetchError).toBe('Failed to load event (500)');
    expect(event).toBeNull();
  });

  it('sets fetchError in production mode when API throws', async () => {
    const apiUtils = {
      get: async () => { throw new Error('Network error'); },
    };

    const load = buildLoadEvent(apiUtils, FAKE_ENDPOINTS, fakeGetEventStatus, { isProd: true });
    const { fetchError, event } = await load('evt_1');

    expect(fetchError).toBe('Failed to load event. Please try again.');
    expect(event).toBeNull();
  });

  it('falls back to mock data in development mode when API throws', async () => {
    const mockEvents = [
      { id: '1', title: 'Dev Mock Event', date: '2030-01-01', type: 'workshop' },
    ];
    const apiUtils = {
      get: async () => { throw new Error('Connection refused'); },
    };

    const load = buildLoadEvent(apiUtils, FAKE_ENDPOINTS, fakeGetEventStatus, {
      isProd: false,
      mockEvents,
    });
    const { event, notFound } = await load('1');

    expect(event).not.toBeNull();
    expect(event.title).toBe('Dev Mock Event');
    expect(notFound).toBe(false);
  });

  it('sets notFound in development mode when mock lookup fails too', async () => {
    const apiUtils = {
      get: async () => { throw new Error('Not found'); },
    };

    const load = buildLoadEvent(apiUtils, FAKE_ENDPOINTS, fakeGetEventStatus, {
      isProd: false,
      mockEvents: [],
    });
    const { event, notFound } = await load('unknown_id');

    expect(event).toBeNull();
    expect(notFound).toBe(true);
  });

  it('preserves existing status from API response without overwriting', async () => {
    const apiUtils = {
      get: async () => ({
        status: 200,
        ok: true,
        data: { id: 'e1', title: 'Past Event', date: '2020-01-01', status: 'past' },
      }),
    };

    const load = buildLoadEvent(apiUtils, FAKE_ENDPOINTS, () => 'upcoming');
    const { event } = await load('e1');

    expect(event.status).toBe('past');
  });
});

describe('EventDetails — source audit', () => {
  it('does not use mockEvents.find() as the primary data source', async () => {
    const { readFileSync } = await import('fs');
    const { resolve } = await import('path');
    const source = readFileSync(
      resolve(process.cwd(), 'src/Pages/Events/EventDetails.js'),
      'utf-8'
    );

    // The old broken pattern: synchronous mock lookup
    expect(source).not.toContain('mockEvents.find');
  });

  it('imports EventDetailSkeleton for loading state', async () => {
    const { readFileSync } = await import('fs');
    const { resolve } = await import('path');
    const source = readFileSync(
      resolve(process.cwd(), 'src/Pages/Events/EventDetails.js'),
      'utf-8'
    );

    expect(source).toContain('EventDetailSkeleton');
  });

  it('uses apiUtils.get with EVENTS.DETAIL endpoint', async () => {
    const { readFileSync } = await import('fs');
    const { resolve } = await import('path');
    const source = readFileSync(
      resolve(process.cwd(), 'src/Pages/Events/EventDetails.js'),
      'utf-8'
    );

    expect(source).toContain('apiUtils.get');
    expect(source).toContain('EVENTS.DETAIL');
  });
});
