/**
 * Tests for useCountUp — requestAnimationFrame-based counter hook (issue #3479).
 *
 * Tests the pure easing and progress logic in isolation from React hooks
 * infrastructure, without requiring jsdom or React Testing Library.
 */

import { describe, it, expect } from 'vitest';

// ── Pure helpers from useCountUp ─────────────────────────────────────────────

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

/**
 * Simulates the useCountUp animation loop without rAF.
 * Advances time in `step` ms increments and returns all emitted count values.
 */
const simulateCountUp = (end, duration = 1200, step = 50) => {
  const values = [];
  for (let elapsed = 0; elapsed <= duration; elapsed += step) {
    const rawProgress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutCubic(rawProgress);
    values.push(Math.round(easedProgress * end));
  }
  return values;
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('easeOutCubic', () => {
  it('returns 0 at progress 0', () => {
    expect(easeOutCubic(0)).toBe(0);
  });

  it('returns 1 at progress 1', () => {
    expect(easeOutCubic(1)).toBe(1);
  });

  it('returns a value between 0 and 1 for mid progress', () => {
    const v = easeOutCubic(0.5);
    expect(v).toBeGreaterThan(0);
    expect(v).toBeLessThan(1);
  });

  it('is always monotonically increasing', () => {
    const steps = Array.from({ length: 20 }, (_, i) => i / 19);
    for (let i = 1; i < steps.length; i++) {
      expect(easeOutCubic(steps[i])).toBeGreaterThanOrEqual(easeOutCubic(steps[i - 1]));
    }
  });

  it('decelerates (second half faster than first in absolute eased terms)', () => {
    const firstHalf = easeOutCubic(0.5) - easeOutCubic(0);
    const secondHalf = easeOutCubic(1) - easeOutCubic(0.5);
    // With ease-out, most progress happens in the first half of linear time
    expect(firstHalf).toBeGreaterThan(secondHalf);
  });
});

describe('simulateCountUp — animated value progression', () => {
  it('starts at 0', () => {
    const values = simulateCountUp(100);
    expect(values[0]).toBe(0);
  });

  it('ends at the target value', () => {
    const values = simulateCountUp(250);
    expect(values[values.length - 1]).toBe(250);
  });

  it('is always monotonically non-decreasing', () => {
    const values = simulateCountUp(500);
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
    }
  });

  it('reaches target at duration boundary', () => {
    const end = 100;
    const duration = 1200;
    const rawProgress = Math.min(duration / duration, 1);
    const count = Math.round(easeOutCubic(rawProgress) * end);
    expect(count).toBe(end);
  });

  it('handles end=0 — always emits 0', () => {
    const values = simulateCountUp(0);
    expect(values.every((v) => v === 0)).toBe(true);
  });

  it('handles end=1 — ends at 1', () => {
    const values = simulateCountUp(1);
    expect(values[values.length - 1]).toBe(1);
  });

  it('handles large values (e.g. 50000 points)', () => {
    const values = simulateCountUp(50000);
    expect(values[values.length - 1]).toBe(50000);
    expect(values[0]).toBe(0);
  });

  it('values stay in range [0, end] at all times', () => {
    const end = 300;
    const values = simulateCountUp(end);
    values.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(end);
    });
  });
});

describe('useCountUp — source audit', () => {
  it('source uses requestAnimationFrame, not setInterval', async () => {
    const { readFileSync } = await import('fs');
    const { resolve } = await import('path');
    const source = readFileSync(
      resolve(process.cwd(), 'src/hooks/useCountUp.js'),
      'utf-8'
    );
    expect(source).toContain('requestAnimationFrame');
    expect(source).not.toContain('setInterval');
  });

  it('Leaderboard AnimatedCounter no longer uses setInterval', async () => {
    const { readFileSync } = await import('fs');
    const { resolve } = await import('path');
    const source = readFileSync(
      resolve(process.cwd(), 'src/Pages/Leaderboard/Leaderboard.jsx'),
      'utf-8'
    );
    expect(source).toContain('useCountUp');
    // The old setInterval in AnimatedCounter should be gone
    expect(source).not.toMatch(/const AnimatedCounter[\s\S]*?setInterval/);
  });

  it('useCountUp calls cancelAnimationFrame on cleanup', async () => {
    const { readFileSync } = await import('fs');
    const { resolve } = await import('path');
    const source = readFileSync(
      resolve(process.cwd(), 'src/hooks/useCountUp.js'),
      'utf-8'
    );
    expect(source).toContain('cancelAnimationFrame');
  });
});
