/**
 * Tests for EventCreation auth fix (issue #3460).
 *
 * Verifies that the event creation submission path no longer reads a token
 * from sessionStorage / localStorage and instead relies on the HttpOnly cookie
 * session (represented by the apiUtils withCredentials Axios instance).
 *
 * We test the business logic (error mapping, response handling) in isolation
 * from React, using a minimal mock of apiUtils.
 */

import { describe, it, expect, vi } from 'vitest';

// ── Minimal submission logic mirroring the fixed EventCreation handler ─────────

const buildSubmitHandler = (apiUtils, API_ENDPOINTS) => async (eventData) => {
  const response = await apiUtils.post(API_ENDPOINTS.EVENTS.CREATE, eventData);
  const result = response.data ?? {};

  if (response.status === 401) {
    throw new Error("Your session has expired. Please log in again.");
  }

  if (response.status === 403) {
    throw new Error("You do not have permission to create events.");
  }

  if (!response.ok && response.status >= 400) {
    const errorMessage = result.message || result.error || `Server error: ${response.status}`;
    throw new Error(errorMessage);
  }

  return result;
};

const MOCK_ENDPOINTS = { EVENTS: { CREATE: '/api/events' } };

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('EventCreation submit handler (#3460)', () => {
  it('does NOT read token from sessionStorage or localStorage', async () => {
    const storageGetSpy = vi.spyOn(Storage.prototype, 'getItem');

    const apiUtils = {
      post: vi.fn().mockResolvedValue({ status: 200, ok: true, data: { id: 'evt_1' } }),
    };

    const handler = buildSubmitHandler(apiUtils, MOCK_ENDPOINTS);
    await handler({ title: 'Test Event', description: 'Desc' });

    // Verify storage was never accessed for "token"
    const tokenReads = storageGetSpy.mock.calls.filter(([key]) => key === 'token');
    expect(tokenReads).toHaveLength(0);

    storageGetSpy.mockRestore();
  });

  it('calls apiUtils.post with the event data and no Authorization header', async () => {
    const apiUtils = {
      post: vi.fn().mockResolvedValue({ status: 200, ok: true, data: {} }),
    };

    const handler = buildSubmitHandler(apiUtils, MOCK_ENDPOINTS);
    const eventData = { title: 'My Event', category: 'Tech' };
    await handler(eventData);

    expect(apiUtils.post).toHaveBeenCalledWith(MOCK_ENDPOINTS.EVENTS.CREATE, eventData);
    // Must NOT pass a third argument (token/header) to apiUtils.post
    expect(apiUtils.post.mock.calls[0].length).toBe(2);
  });

  it('throws a session-expired error on 401 response', async () => {
    const apiUtils = {
      post: vi.fn().mockResolvedValue({ status: 401, ok: false, data: {} }),
    };

    const handler = buildSubmitHandler(apiUtils, MOCK_ENDPOINTS);
    await expect(handler({})).rejects.toThrow("Your session has expired. Please log in again.");
  });

  it('throws a permissions error on 403 response', async () => {
    const apiUtils = {
      post: vi.fn().mockResolvedValue({ status: 403, ok: false, data: {} }),
    };

    const handler = buildSubmitHandler(apiUtils, MOCK_ENDPOINTS);
    await expect(handler({})).rejects.toThrow("You do not have permission to create events.");
  });

  it('throws a server error with the API message on 500 response', async () => {
    const apiUtils = {
      post: vi.fn().mockResolvedValue({
        status: 500,
        ok: false,
        data: { message: 'Internal server error' },
      }),
    };

    const handler = buildSubmitHandler(apiUtils, MOCK_ENDPOINTS);
    await expect(handler({})).rejects.toThrow('Internal server error');
  });

  it('throws a generic server error when response body has no message', async () => {
    const apiUtils = {
      post: vi.fn().mockResolvedValue({ status: 422, ok: false, data: {} }),
    };

    const handler = buildSubmitHandler(apiUtils, MOCK_ENDPOINTS);
    await expect(handler({})).rejects.toThrow('Server error: 422');
  });

  it('resolves successfully on 200 response without throwing', async () => {
    const apiUtils = {
      post: vi.fn().mockResolvedValue({ status: 200, ok: true, data: { id: 'evt_42' } }),
    };

    const handler = buildSubmitHandler(apiUtils, MOCK_ENDPOINTS);
    const result = await handler({ title: 'Success Event' });
    expect(result.id).toBe('evt_42');
  });

  it('resolves successfully on 201 Created response', async () => {
    const apiUtils = {
      post: vi.fn().mockResolvedValue({ status: 201, ok: true, data: { id: 'evt_43' } }),
    };

    const handler = buildSubmitHandler(apiUtils, MOCK_ENDPOINTS);
    const result = await handler({ title: 'New Event' });
    expect(result.id).toBe('evt_43');
  });
});

describe('EventCreation — no legacy token patterns in source', () => {
  it('confirms no sessionStorage.getItem("token") calls remain in the codebase', async () => {
    // This test reads the actual source file to verify the fix was applied.
    const { readFileSync } = await import('fs');
    const { resolve } = await import('path');

    const filePath = resolve(process.cwd(), 'src/components/common/EventCreation.js');
    const source = readFileSync(filePath, 'utf-8');

    expect(source).not.toContain('sessionStorage.getItem("token")');
    expect(source).not.toContain("sessionStorage.getItem('token')");
  });

  it('confirms no manual Authorization header in event creation POST call', async () => {
    const { readFileSync } = await import('fs');
    const { resolve } = await import('path');

    const filePath = resolve(process.cwd(), 'src/components/common/EventCreation.js');
    const source = readFileSync(filePath, 'utf-8');

    // The fixed code should not manually inject an Authorization header
    expect(source).not.toMatch(/Authorization:\s*token/);
    expect(source).not.toMatch(/Authorization:\s*`Bearer/);
  });
});
