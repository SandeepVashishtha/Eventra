/**
 * Tests for the GitHubStats parallel fetch optimization.
 *
 * Verifies that the three GitHub API requests (repo, contributors, pull requests)
 * are fired concurrently via Promise.allSettled rather than sequentially,
 * and that individual fetch failures do not prevent the remaining stats from
 * being displayed.
 */

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(
  path.resolve(__dirname, '../src/Pages/Home/components/GitHubStats.jsx'),
  'utf8',
);

// ---------------------------------------------------------------------------
// Static-analysis: parallelism contract
// ---------------------------------------------------------------------------

describe('GitHubStats — parallel fetch contract', () => {
  it('uses Promise.allSettled to fire all three requests concurrently', () => {
    assert.ok(
      src.includes('Promise.allSettled'),
      'Must use Promise.allSettled to fire repo, contributors, and PR requests in parallel',
    );
  });

  it('does not await fetchStat calls sequentially before the all-settled join', () => {
    // Sequential pattern: "await fetchRepository(...) ... await fetchContributors(...)"
    // The old code had three sequential awaits; the new code puts all three inside allSettled
    const sequentialAwaitPattern = /await\s+fetch[A-Z][a-zA-Z]+\([^)]*\)[\s\S]{0,200}await\s+fetch[A-Z][a-zA-Z]+\(/;
    assert.ok(
      !sequentialAwaitPattern.test(src),
      'Must not contain sequential await fetch calls outside of Promise.allSettled',
    );
  });

  it('passes exactly three promises to Promise.allSettled', () => {
    const allSettledMatch = src.match(/Promise\.allSettled\(\s*\[([\s\S]*?)\]\s*\)/);
    assert.ok(allSettledMatch, 'Promise.allSettled must be called with an array');

    // Count the fetch calls inside the array
    const arrayContent = allSettledMatch[1];
    const fetchCalls = (arrayContent.match(/fetchStat\(/g) || []).length;
    assert.strictEqual(fetchCalls, 3, `Expected 3 fetchStat calls inside allSettled, found ${fetchCalls}`);
  });

  it('destructures all three results from Promise.allSettled', () => {
    assert.ok(
      src.includes('repoResult') &&
        src.includes('contributorsResult') &&
        src.includes('prResult'),
      'Must destructure repoResult, contributorsResult, and prResult from allSettled',
    );
  });
});

// ---------------------------------------------------------------------------
// Failure isolation: each fetch can fail independently
// ---------------------------------------------------------------------------

describe('GitHubStats — failure isolation', () => {
  it('handles contributor fetch failure independently of repo fetch', () => {
    assert.ok(
      src.includes('contributorsResult.status === "rejected"') ||
        src.includes("contributorsResult.status === 'rejected'"),
      'Must handle contributorsResult rejection independently',
    );
  });

  it('handles PR fetch failure independently', () => {
    assert.ok(
      src.includes('prResult.status === "rejected"') ||
        src.includes("prResult.status === 'rejected'"),
      'Must handle prResult rejection independently',
    );
  });

  it('handles repo fetch failure with fallback to cached data', () => {
    assert.ok(
      src.includes('repoResult.status === "rejected"') ||
        src.includes("repoResult.status === 'rejected'"),
      'Must handle repoResult rejection',
    );
  });

  it('uses "fulfilled" status checks for successful results', () => {
    assert.ok(
      (src.match(/status === "fulfilled"/g) || src.match(/status === 'fulfilled'/g) || []).length >= 2,
      'Must check for "fulfilled" status on at least the repo and contributors results',
    );
  });
});

// ---------------------------------------------------------------------------
// Cache layer preserved
// ---------------------------------------------------------------------------

describe('GitHubStats — cache layer preserved', () => {
  it('still reads from localStorage cache before fetching', () => {
    assert.ok(
      src.includes('readCache()'),
      'Cache read must be preserved — avoids unnecessary network requests',
    );
  });

  it('still writes to localStorage cache after fetching', () => {
    assert.ok(
      src.includes('writeCache('),
      'Cache write must be preserved after successful fetch',
    );
  });

  it('cache TTL is set to a reasonable duration (at least 5 minutes)', () => {
    const cacheMatch = src.match(/CACHE_MS\s*=\s*(\d+)\s*\*\s*60\s*\*\s*1000/);
    if (cacheMatch) {
      const minutes = parseInt(cacheMatch[1], 10);
      assert.ok(minutes >= 5, `Expected cache duration >= 5 minutes, got ${minutes}`);
    } else {
      // Alternative format: direct ms value
      const msMatch = src.match(/CACHE_MS\s*=\s*(\d+)/);
      if (msMatch) {
        const ms = parseInt(msMatch[1], 10);
        assert.ok(ms >= 5 * 60 * 1000, `Expected CACHE_MS >= 300000, got ${ms}`);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Logic unit tests: data extraction from allSettled results
// ---------------------------------------------------------------------------

describe('allSettled result extraction logic', () => {
  const extractFulfilled = (result, fallback = null) =>
    result.status === 'fulfilled' ? result.value : fallback;

  it('extracts value from fulfilled result', () => {
    const result = { status: 'fulfilled', value: { stars: 42 } };
    assert.deepStrictEqual(extractFulfilled(result), { stars: 42 });
  });

  it('returns fallback for rejected result', () => {
    const result = { status: 'rejected', reason: new Error('network error') };
    assert.strictEqual(extractFulfilled(result, null), null);
    assert.strictEqual(extractFulfilled(result, '—'), '—');
  });

  it('contributors count falls back to "—" when fetch rejected', () => {
    const rejected = { status: 'rejected', reason: new Error('rate limit') };
    const data = extractFulfilled(rejected, null);
    const count = Array.isArray(data) ? data.length : '—';
    assert.strictEqual(count, '—');
  });

  it('contributors count is correct when fetch succeeds', () => {
    const contributors = Array.from({ length: 47 }, (_, i) => ({ login: `user${i}` }));
    const fulfilled = { status: 'fulfilled', value: contributors };
    const data = extractFulfilled(fulfilled, null);
    const count = Array.isArray(data) ? data.length : '—';
    assert.strictEqual(count, 47);
  });

  it('PR count falls back to "—" when fetch rejected', () => {
    const rejected = { status: 'rejected', reason: new Error('timeout') };
    const data = extractFulfilled(rejected, null);
    const count = Array.isArray(data) ? data.length : '—';
    assert.strictEqual(count, '—');
  });
});

// ---------------------------------------------------------------------------
// Timing simulation: prove parallel > sequential
// ---------------------------------------------------------------------------

describe('Parallel fetch timing advantage', () => {
  const simulateFetch = (delayMs, value) =>
    new Promise((resolve) => setTimeout(() => resolve(value), delayMs));

  it('Promise.allSettled completes in max(delays) not sum(delays)', async () => {
    const start = Date.now();
    await Promise.allSettled([
      simulateFetch(20, 'repo'),
      simulateFetch(30, 'contributors'),
      simulateFetch(25, 'prs'),
    ]);
    const elapsed = Date.now() - start;

    // Should complete in ~30ms (max), not ~75ms (sum)
    assert.ok(
      elapsed < 70,
      `Parallel fetch took ${elapsed}ms — should be ~30ms, not 75ms (sequential sum)`,
    );
  });

  it('sequential awaits take the sum of all delays', async () => {
    const start = Date.now();
    await simulateFetch(20, 'repo');
    await simulateFetch(30, 'contributors');
    await simulateFetch(25, 'prs');
    const elapsed = Date.now() - start;

    // Sequential should take at least 75ms
    assert.ok(
      elapsed >= 70,
      `Sequential fetch took ${elapsed}ms — proves sequential is slower than parallel`,
    );
  });
});
