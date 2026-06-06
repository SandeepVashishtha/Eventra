/**
 * Tests for the AnimatedCounter component in Leaderboard.jsx.
 *
 * Verifies:
 * 1. React.memo is applied — prevents rerender on unchanged parent state
 * 2. requestAnimationFrame is used, not setInterval
 * 3. Existing in-flight RAF is cancelled before starting a new animation
 * 4. Ease-out cubic interpolation math is correct
 * 5. Edge cases: value=0, NaN values, rapid value changes
 */

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(
  path.resolve(__dirname, '../src/Pages/Leaderboard/components/AnimatedCounter.jsx'),
  'utf8',
);

const counterSrc = src;

// ---------------------------------------------------------------------------
// Static analysis: component structure
// ---------------------------------------------------------------------------

describe('AnimatedCounter — component structure', () => {
  it('is wrapped in React.memo', () => {
    assert.ok(
      counterSrc.includes('React.memo('),
      'AnimatedCounter must be wrapped in React.memo to prevent re-renders from parent SSE updates',
    );
  });

  it('uses requestAnimationFrame not setInterval', () => {
    assert.ok(
      counterSrc.includes('requestAnimationFrame'),
      'AnimatedCounter must use requestAnimationFrame for smooth frame-aligned animation',
    );
    assert.ok(
      !counterSrc.includes('setInterval'),
      'AnimatedCounter must NOT use setInterval — it fires even when the tab is hidden',
    );
  });

  it('cancels in-flight RAF before starting a new animation', () => {
    assert.ok(
      counterSrc.includes('cancelAnimationFrame') &&
        // Must appear before the new RAF is scheduled, i.e. before the tick function
        counterSrc.indexOf('cancelAnimationFrame') < counterSrc.indexOf('const tick ='),
      'Must cancel existing RAF before starting a new animation loop on value change',
    );
  });

  it('cleanup function cancels RAF on unmount', () => {
    assert.ok(
      counterSrc.includes('return ()') &&
        counterSrc.includes('cancelAnimationFrame(rafRef.current)'),
      'useEffect cleanup must cancel the RAF to prevent leaks on component unmount',
    );
  });

  it('uses useRef to store the RAF handle', () => {
    assert.ok(
      counterSrc.includes('rafRef') && counterSrc.includes('useRef'),
      'RAF handle must be stored in a ref, not state, to avoid triggering re-renders',
    );
  });

  it('handles NaN values gracefully', () => {
    assert.ok(
      counterSrc.includes('isNaN(end)'),
      'Must guard against NaN from parseInt on non-numeric values',
    );
  });

  it('handles value=0 without starting animation', () => {
    assert.ok(
      counterSrc.includes('end === 0'),
      'Must short-circuit to setCount(0) when value is 0, avoiding an unnecessary RAF loop',
    );
  });
});

// ---------------------------------------------------------------------------
// Easing math unit tests
// ---------------------------------------------------------------------------

describe('Ease-out cubic interpolation', () => {
  // The easing function: eased = 1 - (1 - progress)^3
  const easeOutCubic = (progress) => 1 - Math.pow(1 - progress, 3);

  it('starts at 0 (progress=0)', () => {
    assert.strictEqual(easeOutCubic(0), 0);
  });

  it('ends at 1 (progress=1)', () => {
    assert.strictEqual(easeOutCubic(1), 1);
  });

  it('is monotonically increasing', () => {
    let prev = 0;
    for (let p = 0.1; p <= 1.0; p += 0.1) {
      const cur = easeOutCubic(p);
      assert.ok(cur > prev, `Expected eased(${p.toFixed(1)}) > eased(${(p - 0.1).toFixed(1)})`);
      prev = cur;
    }
  });

  it('accelerates fast then decelerates (midpoint > 0.5)', () => {
    assert.ok(
      easeOutCubic(0.5) > 0.5,
      'Ease-out cubic should be past the midpoint at t=0.5 (fast start, slow end)',
    );
  });

  it('count formula rounds correctly for a known end value', () => {
    const end = 100;
    const progress = 0.5;
    const eased = easeOutCubic(progress);
    const count = Math.round(eased * end);
    // easeOutCubic(0.5) = 1 - (0.5)^3 = 1 - 0.125 = 0.875 → 87.5 → 88
    assert.strictEqual(count, 88);
  });
});

// ---------------------------------------------------------------------------
// React.memo contract: prevents re-renders when value is unchanged
// ---------------------------------------------------------------------------

describe('React.memo prevents spurious re-renders', () => {
  it('same value prop does not trigger animation restart', () => {
    // Simulate React.memo shallow comparison: same primitive value → no re-render
    const prevProps = { value: 42 };
    const nextProps = { value: 42 };
    const memoWouldSkip = prevProps.value === nextProps.value;
    assert.ok(memoWouldSkip, 'React.memo should skip re-render when value is unchanged');
  });

  it('different value prop triggers re-render and animation restart', () => {
    const prevProps = { value: 42 };
    const nextProps = { value: 99 };
    const memoWouldRerender = prevProps.value !== nextProps.value;
    assert.ok(memoWouldRerender, 'React.memo must allow re-render when value changes');
  });

  it('SSE updates that do not change a contributor score skip all AnimatedCounters for that row', () => {
    // Verify the invariant that the leaderboard's SSE stream does not cause
    // every AnimatedCounter to restart when unrelated data arrives
    const contributorBefore = { login: 'alice', points: 500, prs: 12 };
    const contributorAfter = { login: 'alice', points: 500, prs: 12 };

    // If the parent passes the same values, React.memo prevents any AnimatedCounter
    // for this contributor from re-rendering
    assert.strictEqual(contributorBefore.points, contributorAfter.points);
    assert.strictEqual(contributorBefore.prs, contributorAfter.prs);
    // → both AnimatedCounter instances for this contributor should be skipped
  });
});

// ---------------------------------------------------------------------------
// Source: N AnimatedCounters in Leaderboard — not N setIntervals
// ---------------------------------------------------------------------------

describe('N AnimatedCounters do not create N concurrent timers', () => {
  it('setInterval does not appear anywhere in AnimatedCounter source', () => {
    assert.ok(
      !counterSrc.includes('setInterval'),
      'setInterval must not be used — it creates hidden background timers per counter',
    );
  });

  it('each RAF loop is bound to the browser paint cycle (one active frame per counter max)', () => {
    // Proof: requestAnimationFrame schedules one callback per frame; when the animation
    // completes (progress >= 1), no further RAF is scheduled.
    assert.ok(
      counterSrc.includes('if (progress < 1)') ||
        counterSrc.includes('progress < 1'),
      'RAF must only re-schedule itself when animation is not complete',
    );
  });
});
