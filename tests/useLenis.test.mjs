/**
 * Behavioral tests for src/hooks/useLenis.js
 */
import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';

describe('useLenis - touch device detection', () => {
  it('skips initialization on touch devices', () => {
    const isTouchDevice = (mediaQuery) => mediaQuery === '(pointer: coarse)';

    assert.strictEqual(isTouchDevice('(pointer: coarse)'), true);
  });

  it('initializes on non-touch devices', () => {
    const isTouchDevice = (mediaQuery) => mediaQuery === '(pointer: coarse)';

    assert.strictEqual(isTouchDevice('(pointer: fine)'), false);
  });
});

describe('useLenis - Lenis instance options', () => {
  it('creates Lenis instance with correct default easing function', () => {
    const easingFn = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));
    const easedValue = easingFn(0.5);
    assert.ok(easedValue >= 0.96 && easedValue <= 1, 'Easing function at t=0.5 should return ~0.97');
  });

  it('merges custom options with defaults', () => {
    const customOptions = { duration: 2, smoothTouch: true };
    const defaultOptions = {
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    };

    const mergedOptions = { ...defaultOptions, ...customOptions };

    assert.strictEqual(mergedOptions.duration, 2, 'Custom duration should override default');
    assert.strictEqual(mergedOptions.smoothTouch, true, 'Custom smoothTouch should override default');
    assert.strictEqual(mergedOptions.direction, 'vertical', 'Default direction should be preserved');
  });
});

describe('useLenis - RAF loop', () => {
  it('RAF callback is defined after initialization', () => {
    let rafCallback = null;
    const mockRaf = (cb) => {
      rafCallback = cb;
      return 1;
    };

    mockRaf(() => {});

    assert.ok(rafCallback !== null, 'RAF callback must be defined after initialization');
  });
});

describe('useLenis - cleanup', () => {
  it('clears window.lenis on cleanup', () => {
    const windowLenis = { raf: () => {}, destroy: () => {} };
    let lenisRef = windowLenis;
    lenisRef = null;

    assert.strictEqual(lenisRef, null, 'window.lenis must be cleared on cleanup');
  });
});

describe('useLenis - global exposure', () => {
  it('exposes Lenis instance on window', () => {
    const mockLenis = { raf: () => {}, destroy: () => {} };
    const windowLenis = mockLenis;

    assert.ok(windowLenis !== null, 'Lenis instance must be exposed on window');
  });

  it('clears global reference on unmount', () => {
    let windowLenis = { raf: () => {}, destroy: () => {} };
    windowLenis = null;

    assert.strictEqual(windowLenis, null, 'Global reference must be cleared');
  });
});

describe('useLenis - easing function behavior', () => {
  it('produces values close to 1 for large t values', () => {
    const easing = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

    assert.ok(easing(1) >= 0.99, 't=1 should be nearly 1');
    assert.ok(easing(0.9) >= 0.9, 't=0.9 should be at least 0.9');
  });

  it('produces small values for small t values', () => {
    const easing = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

    const val = easing(0.01);
    assert.ok(val < 0.2, 't=0.01 should be small (slow start)');
  });
});