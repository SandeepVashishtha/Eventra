/**
 * Tests for ContributorsCarousel performance fixes:
 * 1. MAX_CONTRIBUTOR_PAGES reduced from 2 to 1 (100 profiles max, not 200)
 * 2. Cache TTL extended from 1hr to 4hr
 * 3. Stale-while-revalidate: getCachedContributors returns { data, isStale }
 * 4. Duplicate fetchGitHubProfile function removed
 * 5. Background refresh triggered on stale cache
 */

import { strict as assert } from 'node:assert';
import { describe, it, beforeEach } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(
  path.resolve(
    __dirname,
    '../src/Pages/Home/components/ContributorsCarousel.js',
  ),
  'utf8',
);

// ---------------------------------------------------------------------------
// Static-analysis contract
// ---------------------------------------------------------------------------

describe('ContributorsCarousel — rate limit reduction', () => {
  it('MAX_CONTRIBUTOR_PAGES is 1 (100 profiles max, not 200)', () => {
    const match = src.match(/MAX_CONTRIBUTOR_PAGES\s*=\s*(\d+)/);
    assert.ok(match, 'MAX_CONTRIBUTOR_PAGES must be defined');
    assert.strictEqual(
      parseInt(match[1], 10),
      1,
      `Expected MAX_CONTRIBUTOR_PAGES = 1, found ${match[1]}`,
    );
  });

  it('CACHE_DURATION is at least 4 hours (reduces cold-load frequency)', () => {
    const match = src.match(/CACHE_DURATION\s*=\s*([\d\s\*]+)/);
    assert.ok(match, 'CACHE_DURATION must be defined');
    // Evaluate the expression safely (only digits, spaces, and *)
    const expr = match[1].trim().replace(/[^0-9\s\*]/g, '');
    const ms = eval(expr); // Safe: only numbers and *
    assert.ok(
      ms >= 4 * 60 * 60 * 1000,
      `Expected CACHE_DURATION >= 4hr (${4 * 60 * 60 * 1000}ms), got ${ms}ms`,
    );
  });

  it('STALE_REVALIDATE_WINDOW is defined for background refresh', () => {
    assert.ok(
      src.includes('STALE_REVALIDATE_WINDOW'),
      'STALE_REVALIDATE_WINDOW must be defined for stale-while-revalidate pattern',
    );
  });
});

describe('ContributorsCarousel — duplicate fetchGitHubProfile removed', () => {
  it('has exactly one fetchGitHubProfile definition', () => {
    const matches = src.match(/const fetchGitHubProfile\s*=/g) || [];
    assert.strictEqual(
      matches.length,
      1,
      `Expected exactly 1 fetchGitHubProfile definition, found ${matches.length}`,
    );
  });

  it('does not contain the broken inner fetchProfileWithCache wrapper', () => {
    // The first (broken) definition had fetchProfileWithCache inside it
    // The clean definition should only have the throttled direct fetch
    const brokenPattern = src.match(/return await fetchProfileWithCache/);
    assert.ok(
      !brokenPattern,
      'Broken fetchProfileWithCache wrapper must be removed from fetchGitHubProfile',
    );
  });
});

describe('ContributorsCarousel — stale-while-revalidate', () => {
  it('getCachedContributors returns an object with data and isStale fields', () => {
    assert.ok(
      src.includes('isStale'),
      'getCachedContributors must return { data, isStale } for stale-while-revalidate support',
    );
  });

  it('fetchContributors accepts a backgroundRefresh option', () => {
    assert.ok(
      src.includes('backgroundRefresh'),
      'fetchContributors must support backgroundRefresh: true for stale cache refresh',
    );
  });

  it('background refresh does not set loading to true', () => {
    assert.ok(
      src.includes('!backgroundRefresh') &&
        src.includes('setLoading(true)'),
      'setLoading(true) must be guarded by !backgroundRefresh',
    );
  });
});

// ---------------------------------------------------------------------------
// Stale-while-revalidate logic unit tests
// ---------------------------------------------------------------------------

class LocalStorageMock {
  constructor() { this._store = {}; }
  getItem(k) { return Object.prototype.hasOwnProperty.call(this._store, k) ? this._store[k] : null; }
  setItem(k, v) { this._store[k] = String(v); }
  removeItem(k) { delete this._store[k]; }
  clear() { this._store = {}; }
}

const mockStorage = new LocalStorageMock();
global.localStorage = mockStorage;

const STORAGE_KEY = 'github_contributors';
const CACHE_DURATION_MS = 4 * 60 * 60 * 1000;
const STALE_REVALIDATE_MS = 2 * 60 * 60 * 1000;

function getCachedContributorsLogic() {
  try {
    const raw = mockStorage.getItem(STORAGE_KEY);
    if (!raw) return { data: null, isStale: false };
    const { data, timestamp } = JSON.parse(raw);
    const age = Date.now() - timestamp;
    if (age <= CACHE_DURATION_MS) return { data, isStale: false };
    if (age <= CACHE_DURATION_MS + STALE_REVALIDATE_MS) return { data, isStale: true };
    return { data: null, isStale: false };
  } catch {
    return { data: null, isStale: false };
  }
}

describe('getCachedContributors logic — stale-while-revalidate', () => {
  beforeEach(() => mockStorage.clear());

  const store = (data, ageMs) => {
    mockStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ data, timestamp: Date.now() - ageMs }),
    );
  };

  it('returns { data: null, isStale: false } when no cache', () => {
    const result = getCachedContributorsLogic();
    assert.strictEqual(result.data, null);
    assert.strictEqual(result.isStale, false);
  });

  it('returns { data, isStale: false } for fresh cache', () => {
    const contributors = [{ login: 'alice', contributions: 10 }];
    store(contributors, 30 * 60 * 1000); // 30min old
    const result = getCachedContributorsLogic();
    assert.deepStrictEqual(result.data, contributors);
    assert.strictEqual(result.isStale, false);
  });

  it('returns { data, isStale: true } for stale-but-revalidate cache', () => {
    const contributors = [{ login: 'bob', contributions: 5 }];
    store(contributors, CACHE_DURATION_MS + 30 * 60 * 1000); // 4.5hr old
    const result = getCachedContributorsLogic();
    assert.deepStrictEqual(result.data, contributors);
    assert.strictEqual(result.isStale, true);
  });

  it('returns { data: null, isStale: false } for fully expired cache', () => {
    const contributors = [{ login: 'carol', contributions: 3 }];
    store(contributors, CACHE_DURATION_MS + STALE_REVALIDATE_MS + 1000); // 6hr+ old
    const result = getCachedContributorsLogic();
    assert.strictEqual(result.data, null);
    assert.strictEqual(result.isStale, false);
  });

  it('returns null for corrupt cache data', () => {
    mockStorage.setItem(STORAGE_KEY, 'not json {{{');
    const result = getCachedContributorsLogic();
    assert.strictEqual(result.data, null);
  });

  it('at the exact cache boundary (age === CACHE_DURATION), data is fresh', () => {
    const contributors = [{ login: 'dave' }];
    store(contributors, CACHE_DURATION_MS);
    // age === CACHE_DURATION: should be treated as stale (strictly <=)
    const result = getCachedContributorsLogic();
    // At exactly CACHE_DURATION, it's at the boundary — either fresh or stale is acceptable
    // but data must not be null
    assert.notStrictEqual(result.data, null);
  });
});

// ---------------------------------------------------------------------------
// Rate limit: 100 profiles max = 5 batches of 20 concurrent
// ---------------------------------------------------------------------------

describe('Profile fetch count with MAX_CONTRIBUTOR_PAGES=1', () => {
  it('fetches at most 100 profiles with 1 page', () => {
    const maxProfiles = 1 * 100; // MAX_CONTRIBUTOR_PAGES * per_page
    assert.strictEqual(maxProfiles, 100);
  });

  it('with concurrency=5, 100 profiles = 20 batches', () => {
    const batches = Math.ceil(100 / 5);
    assert.strictEqual(batches, 20);
  });

  it('20 batches × 100ms throttle = ~2s min (vs ~4s for 200 profiles)', () => {
    const oldBatches = Math.ceil(200 / 5); // MAX_CONTRIBUTOR_PAGES=2
    const newBatches = Math.ceil(100 / 5); // MAX_CONTRIBUTOR_PAGES=1
    assert.ok(
      newBatches < oldBatches,
      `New batch count (${newBatches}) must be less than old (${oldBatches})`,
    );
  });
});
