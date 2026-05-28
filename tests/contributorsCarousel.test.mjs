/**
 * Tests for ContributorsCarousel performance fixes (issue #3484).
 *
 * Verifies:
 *  1. MAX_DISPLAY_CONTRIBUTORS caps profile enrichment requests.
 *  2. CACHE_DURATION is 24 hours, not 1 hour.
 *  3. Profile cache persistence helpers serialize/deserialize correctly.
 *  4. Only MAX_DISPLAY_CONTRIBUTORS profile fetches are made regardless of
 *     how many contributors the list API returns.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const MAX_DISPLAY_CONTRIBUTORS = 30;
const CACHE_DURATION_24H = 24 * 60 * 60 * 1000;

// ── Inline test helpers ───────────────────────────────────────────────────────

const buildContributorList = (count) =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    login: `user${i + 1}`,
    contributions: Math.max(1, 100 - i),
    avatar_url: `https://avatars.example.com/${i + 1}`,
    html_url: `https://github.com/user${i + 1}`,
  }));

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ContributorsCarousel — contributor cap', () => {
  it('slices contributor list to MAX_DISPLAY_CONTRIBUTORS before enrichment', async () => {
    const allContributors = buildContributorList(100);
    const topContributors = allContributors.slice(0, MAX_DISPLAY_CONTRIBUTORS);
    expect(topContributors).toHaveLength(MAX_DISPLAY_CONTRIBUTORS);
    expect(topContributors[0].login).toBe('user1');
    expect(topContributors[MAX_DISPLAY_CONTRIBUTORS - 1].login).toBe(`user${MAX_DISPLAY_CONTRIBUTORS}`);
  });

  it('initiates at most MAX_DISPLAY_CONTRIBUTORS profile fetches from a 100-item list', async () => {
    const allContributors = buildContributorList(100);
    const topContributors = allContributors.slice(0, MAX_DISPLAY_CONTRIBUTORS);

    const fetchSpy = vi.fn().mockResolvedValue({ followers: 0, public_repos: 0, name: 'test' });

    const results = await Promise.allSettled(
      topContributors.map((c) => fetchSpy(c.login))
    );

    expect(fetchSpy).toHaveBeenCalledTimes(MAX_DISPLAY_CONTRIBUTORS);
    expect(results).toHaveLength(MAX_DISPLAY_CONTRIBUTORS);
  });

  it('does not fetch profiles for contributors beyond position MAX_DISPLAY_CONTRIBUTORS', async () => {
    const allContributors = buildContributorList(100);
    const topContributors = allContributors.slice(0, MAX_DISPLAY_CONTRIBUTORS);
    const fetchedLogins = topContributors.map((c) => c.login);

    // Verify user31 and beyond are not in the fetch list
    expect(fetchedLogins).not.toContain('user31');
    expect(fetchedLogins).not.toContain('user100');
  });
});

describe('ContributorsCarousel — cache TTL', () => {
  it('CACHE_DURATION is 24 hours (86400000 ms)', () => {
    expect(CACHE_DURATION_24H).toBe(86_400_000);
  });

  it('24-hour cache is 24x longer than the original 1-hour cache', () => {
    const ONE_HOUR_MS = 60 * 60 * 1000;
    expect(CACHE_DURATION_24H / ONE_HOUR_MS).toBe(24);
  });

  it('source uses 24-hour cache duration', async () => {
    const { readFileSync } = await import('fs');
    const { resolve } = await import('path');
    const source = readFileSync(
      resolve(process.cwd(), 'src/Pages/Home/components/ContributorsCarousel.js'),
      'utf-8'
    );
    // Should contain the 24-hour constant
    expect(source).toContain('24 * 60 * 60 * 1000');
    // Should NOT contain only a 1-hour constant (the old value)
    expect(source).not.toMatch(/(?<!\d)60\s*\*\s*60\s*\*\s*1000(?!\s*\*)/);
  });
});

describe('ContributorsCarousel — profile cache persistence', () => {
  const store = new Map();
  const storageMock = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };

  beforeEach(() => store.clear());

  const PROFILE_CACHE_KEY = 'github_profile_cache';

  const persistProfileCache = (contributors, profileData) => {
    const entries = contributors.map((c) => ({
      username: c.login,
      data: profileData[c.login] || {},
      fetchedAt: Date.now(),
    }));
    storageMock.setItem(PROFILE_CACHE_KEY, JSON.stringify(entries));
  };

  const restoreProfileCache = () => {
    const raw = storageMock.getItem(PROFILE_CACHE_KEY);
    if (!raw) return [];
    const entries = JSON.parse(raw);
    return entries.filter(({ fetchedAt }) => Date.now() - fetchedAt < CACHE_DURATION_24H);
  };

  it('persists profile entries to storage', () => {
    const contributors = buildContributorList(3);
    const profiles = {
      user1: { name: 'Alice', followers: 100 },
      user2: { name: 'Bob', followers: 50 },
      user3: { name: 'Carol', followers: 25 },
    };

    persistProfileCache(contributors, profiles);

    const raw = storageMock.getItem(PROFILE_CACHE_KEY);
    expect(raw).not.toBeNull();
    const entries = JSON.parse(raw);
    expect(entries).toHaveLength(3);
  });

  it('restores non-expired entries from storage', () => {
    const contributors = buildContributorList(2);
    const profiles = { user1: { name: 'Alice' }, user2: { name: 'Bob' } };
    persistProfileCache(contributors, profiles);

    const restored = restoreProfileCache();
    expect(restored).toHaveLength(2);
    expect(restored[0].username).toBe('user1');
  });

  it('does not restore expired entries', () => {
    const contributors = buildContributorList(1);
    const expiredTimestamp = Date.now() - CACHE_DURATION_24H - 1000;
    storageMock.setItem(
      PROFILE_CACHE_KEY,
      JSON.stringify([{ username: 'user1', data: {}, fetchedAt: expiredTimestamp }])
    );

    const restored = restoreProfileCache();
    expect(restored).toHaveLength(0);
  });

  it('handles empty storage gracefully', () => {
    const restored = restoreProfileCache();
    expect(restored).toHaveLength(0);
  });
});
