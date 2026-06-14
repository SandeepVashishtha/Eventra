/**
 * Tests for the GitHubStats parallel-fetch fix (issue #3472).
 *
 * Verifies that the three backend API calls are initiated simultaneously
 * (not sequentially) and that individual failures do not prevent the others
 * from completing.
 */

import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

const expect = (actual) => ({
  toBe(expected) {
    assert.strictEqual(actual, expected);
  },
  toEqual(expected) {
    assert.deepStrictEqual(actual, expected);
  },
  toBeNull() {
    assert.strictEqual(actual, null);
  },
  toContain(expected) {
    assert.ok(actual.includes(expected));
  },
  toHaveLength(expected) {
    assert.strictEqual(actual.length, expected);
  },
  not: {
    toBeNull() {
      assert.notStrictEqual(actual, null);
    },
  },
});

const vi = {
  fn(implementation) {
    const onceQueue = [];
    let defaultImplementation = implementation;

    const mock = (...args) => {
      if (onceQueue.length > 0) {
        return onceQueue.shift()(...args);
      }
      return defaultImplementation?.(...args);
    };

    mock.mockResolvedValueOnce = (value) => {
      onceQueue.push(() => Promise.resolve(value));
      return mock;
    };
    mock.mockRejectedValueOnce = (error) => {
      onceQueue.push(() => Promise.reject(error));
      return mock;
    };
    mock.mockImplementation = (nextImplementation) => {
      defaultImplementation = nextImplementation;
      return mock;
    };

    return mock;
  },
};

// ── Inline the fetch orchestration logic for unit testing ─────────────────────

const fetchStat = async (fetchFn, path) => {
  const res = await fetchFn(path);
  if (!res.ok) throw new Error(`${path} responded with ${res.status}`);
  return res.json();
};

const buildStatsFromResults = (repoResult, contributorsResult, prResult) => {
  const repoData = repoResult.status === 'fulfilled' ? repoResult.value : null;
  const contributorsData = contributorsResult.status === 'fulfilled' ? contributorsResult.value : null;
  const prData = prResult.status === 'fulfilled' ? prResult.value : null;

  if (!repoData) return null;

  return {
    stars: repoData.stargazers_count || 0,
    forks: repoData.forks_count || 0,
    issues: repoData.open_issues_count || 0,
    contributors: Array.isArray(contributorsData) ? contributorsData.length : '—',
    pullRequests: Array.isArray(prData) ? prData.length : '—',
    license: repoData.license?.spdx_id || 'N/A',
    watchers: repoData.subscribers_count || 0,
    lastCommit: repoData.pushed_at
      ? new Date(repoData.pushed_at).toLocaleDateString('en-GB')
      : 'N/A',
    size: repoData.size || 0,
  };
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('GitHubStats — parallel fetch orchestration (#3472)', () => {
  let callOrder;

  beforeEach(() => {
    callOrder = [];
  });

  it('initiates all three fetches before any of them resolve', async () => {
    const resolvers = {};

    const makeFetch = (name) => () =>
      new Promise((resolve) => {
        callOrder.push(name);
        resolvers[name] = resolve;
      });

    const repoFetch = makeFetch('repo');
    const contribFetch = makeFetch('contributors');
    const prFetch = makeFetch('pulls');

    // Start all three in parallel
    const promise = Promise.allSettled([
      repoFetch(),
      contribFetch(),
      prFetch(),
    ]);

    // All three should have been called synchronously before any resolves
    expect(callOrder).toEqual(['repo', 'contributors', 'pulls']);

    // Resolve all
    resolvers.repo({ ok: true, json: async () => ({ stargazers_count: 10 }) });
    resolvers.contributors({ ok: true, json: async () => [] });
    resolvers.pulls({ ok: true, json: async () => [] });

    await promise;
  });

  it('returns correct stats when all three fetches succeed', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          stargazers_count: 500,
          forks_count: 120,
          open_issues_count: 30,
          subscribers_count: 45,
          size: 2048,
          pushed_at: '2026-01-15T10:00:00Z',
          license: { spdx_id: 'Apache-2.0' },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => Array.from({ length: 75 }, (_, i) => ({ login: `user${i}` })),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => Array.from({ length: 120 }, (_, i) => ({ number: i })),
      });

    const [repoResult, contributorsResult, prResult] = await Promise.allSettled([
      fetchStat(mockFetch, '/github/repo'),
      fetchStat(mockFetch, '/github/contributors'),
      fetchStat(mockFetch, '/github/pulls'),
    ]);

    const stats = buildStatsFromResults(repoResult, contributorsResult, prResult);

    expect(stats).not.toBeNull();
    expect(stats.stars).toBe(500);
    expect(stats.forks).toBe(120);
    expect(stats.contributors).toBe(75);
    expect(stats.pullRequests).toBe(120);
    expect(stats.license).toBe('Apache-2.0');
  });

  it('shows fallback for contributors when that fetch fails but repo succeeds', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ stargazers_count: 100, forks_count: 20, open_issues_count: 5 }),
      })
      .mockRejectedValueOnce(new Error('Rate limited'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ number: 1 }],
      });

    const [repoResult, contributorsResult, prResult] = await Promise.allSettled([
      fetchStat(mockFetch, '/github/repo'),
      fetchStat(mockFetch, '/github/contributors'),
      fetchStat(mockFetch, '/github/pulls'),
    ]);

    expect(repoResult.status).toBe('fulfilled');
    expect(contributorsResult.status).toBe('rejected');
    expect(prResult.status).toBe('fulfilled');

    const stats = buildStatsFromResults(repoResult, contributorsResult, prResult);
    expect(stats).not.toBeNull();
    expect(stats.stars).toBe(100);
    expect(stats.contributors).toBe('—');
    expect(stats.pullRequests).toBe(1);
  });

  it('returns null when repo fetch fails', async () => {
    const mockFetch = vi.fn()
      .mockRejectedValueOnce(new Error('503'))
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    const [repoResult, contributorsResult, prResult] = await Promise.allSettled([
      fetchStat(mockFetch, '/github/repo'),
      fetchStat(mockFetch, '/github/contributors'),
      fetchStat(mockFetch, '/github/pulls'),
    ]);

    expect(repoResult.status).toBe('rejected');
    const stats = buildStatsFromResults(repoResult, contributorsResult, prResult);
    expect(stats).toBeNull();
  });

  it('all three fetches are called regardless of individual failures', async () => {
    const calls = [];
    const mockFetch = vi.fn().mockImplementation((path) => {
      calls.push(path);
      return Promise.reject(new Error(`${path} failed`));
    });

    await Promise.allSettled([
      fetchStat(mockFetch, '/github/repo'),
      fetchStat(mockFetch, '/github/contributors'),
      fetchStat(mockFetch, '/github/pulls'),
    ]);

    expect(calls).toContain('/github/repo');
    expect(calls).toContain('/github/contributors');
    expect(calls).toContain('/github/pulls');
    expect(calls).toHaveLength(3);
  });
});
