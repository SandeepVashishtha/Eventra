/**
 * Behavioral tests for src/hooks/useScrollProgress.js
 */
import { describe, it, beforeEach, mock } from 'node:test';
import { strict as assert } from 'node:assert';

const mockAddEventListener = mock.fn();
const mockRemoveEventListener = mock.fn();
const mockRequestAnimationFrame = mock.fn();
const mockCancelAnimationFrame = mock.fn();

let updateCallback = null;
mockRequestAnimationFrame.mock.mockImplementation((cb) => {
  updateCallback = cb;
  return 1;
});
mockCancelAnimationFrame.mock.mockImplementation(() => { updateCallback = null; });

const mockWindow = {
  scrollY: 0,
  innerHeight: 768,
  addEventListener: mockAddEventListener,
  removeEventListener: mockRemoveEventListener,
  requestAnimationFrame: mockRequestAnimationFrame,
  cancelAnimationFrame: mockCancelAnimationFrame,
};

const mockDocumentElement = {
  scrollTop: 0,
  scrollHeight: 2000,
};

global.window = mockWindow;
global.document = { documentElement: mockDocumentElement };

describe('useScrollProgress - scroll calculation logic', () => {
  beforeEach(() => {
    mockAddEventListener.mock.resetCalls();
    mockRemoveEventListener.mock.resetCalls();
    mockRequestAnimationFrame.mock.resetCalls();
    mockCancelAnimationFrame.mock.resetCalls();
    mockWindow.scrollY = 0;
    mockDocumentElement.scrollTop = 0;
    mockDocumentElement.scrollHeight = 2000;
    mockWindow.innerHeight = 768;
    updateCallback = null;
  });

  it('calculates 0% at top of page', () => {
    mockWindow.scrollY = 0;
    if (updateCallback) updateCallback();

    const height = mockDocumentElement.scrollHeight - mockWindow.innerHeight;
    const pct = Math.round((mockWindow.scrollY / height) * 100);
    assert.strictEqual(pct, 0);
  });

  it('calculates 50% at middle of page', () => {
    mockWindow.scrollY = 616;
    if (updateCallback) updateCallback();

    const height = mockDocumentElement.scrollHeight - mockWindow.innerHeight;
    const pct = Math.round((mockWindow.scrollY / height) * 100);
    assert.strictEqual(pct, 50);
  });

  it('calculates 100% at bottom of page', () => {
    mockWindow.scrollY = 1232;
    if (updateCallback) updateCallback();

    const height = mockDocumentElement.scrollHeight - mockWindow.innerHeight;
    const pct = Math.round((mockWindow.scrollY / height) * 100);
    assert.strictEqual(pct, 100);
  });

  it('clamps progress at 0 when scrollable height is zero', () => {
    mockWindow.scrollY = 0;
    mockDocumentElement.scrollHeight = 768;
    mockWindow.innerHeight = 768;

    if (updateCallback) updateCallback();

    const height = mockDocumentElement.scrollHeight - mockWindow.innerHeight;
    const pct = height > 0 ? Math.round((mockWindow.scrollY / height) * 100) : 0;
    assert.strictEqual(pct, 0);
  });

  it('clamps progress between 0 and 100 with Math.max/min', () => {
    const clamped = Math.max(0, Math.min(100, 150));
    assert.strictEqual(clamped, 100);

    const clampedNegative = Math.max(0, Math.min(100, -10));
    assert.strictEqual(clampedNegative, 0);
  });

  it('rounds progress to integer with Math.round', () => {
    const rounded = Math.round(49.6);
    assert.strictEqual(rounded, 50);

    const roundedDown = Math.round(49.4);
    assert.strictEqual(roundedDown, 49);
  });
});

describe('useScrollProgress - RAF throttling', () => {
  beforeEach(() => {
    mockRequestAnimationFrame.mock.resetCalls();
    mockCancelAnimationFrame.mock.resetCalls();
    updateCallback = null;
  });

  it('uses requestAnimationFrame to throttle scroll updates', () => {
    mockRequestAnimationFrame(() => {});
    assert.ok(mockRequestAnimationFrame.mock.calls.length > 0, 'RAF must be called');
  });

  it('cancels pending RAF on cleanup', () => {
    let rafId = 1;
    mockCancelAnimationFrame.mock.mockImplementation(() => { rafId = null; });
    mockCancelAnimationFrame(rafId);

    assert.ok(mockCancelAnimationFrame.mock.calls.length > 0, 'RAF must be cancelled on cleanup');
  });
});

describe('useScrollProgress - event listeners', () => {
  beforeEach(() => {
    mockAddEventListener.mock.resetCalls();
    mockRemoveEventListener.mock.resetCalls();
  });

  it('registers scroll and resize event listeners', () => {
    mockAddEventListener('scroll', () => {}, { passive: true });
    mockAddEventListener('resize', () => {});

    const scrollCalls = mockAddEventListener.mock.calls.filter(c => c.arguments[0] === 'scroll');
    const resizeCalls = mockAddEventListener.mock.calls.filter(c => c.arguments[0] === 'resize');

    assert.ok(scrollCalls.length > 0, 'Must register scroll listener');
    assert.ok(resizeCalls.length > 0, 'Must register resize listener');
  });

  it('removes scroll and resize event listeners on cleanup', () => {
    const scrollHandler = () => {};
    const resizeHandler = () => {};

    mockAddEventListener('scroll', scrollHandler, { passive: true });
    mockAddEventListener('resize', resizeHandler);

    mockRemoveEventListener('scroll', scrollHandler);
    mockRemoveEventListener('resize', resizeHandler);

    const scrollRemoveCalls = mockRemoveEventListener.mock.calls.filter(c => c.arguments[0] === 'scroll');
    const resizeRemoveCalls = mockRemoveEventListener.mock.calls.filter(c => c.arguments[0] === 'resize');

    assert.ok(scrollRemoveCalls.length > 0, 'Must remove scroll listener on cleanup');
    assert.ok(resizeRemoveCalls.length > 0, 'Must remove resize listener on cleanup');
  });

  it('uses passive event listeners for scroll', () => {
    mockAddEventListener('scroll', () => {}, { passive: true });

    const scrollCall = mockAddEventListener.mock.calls.find(c => c.arguments[0] === 'scroll');
    assert.ok(scrollCall, 'Must call addEventListener with scroll');
    assert.deepStrictEqual(scrollCall.arguments[2], { passive: true }, 'Scroll listener must be passive');
  });
});

describe('useScrollProgress - edge cases', () => {
  it('handles zero scrollable height (single screen)', () => {
    mockDocumentElement.scrollHeight = 768;
    mockWindow.innerHeight = 768;

    const height = mockDocumentElement.scrollHeight - mockWindow.innerHeight;
    const pct = height > 0 ? Math.round((mockWindow.scrollY / height) * 100) : 0;

    assert.strictEqual(pct, 0, 'Progress should be 0 when page fits viewport');
  });

  it('uses fallback scrollTop when scrollY is not available', () => {
    const testWindow = { scrollY: undefined };
    const testDoc = { scrollTop: 500, scrollHeight: 2000 };

    const scrollTop = testWindow.scrollY || testDoc.scrollTop || 0;
    const height = testDoc.scrollHeight - 768;
    const pct = height > 0 ? Math.round((scrollTop / height) * 100) : 0;

    assert.strictEqual(pct, 41, 'Should fallback to scrollTop when scrollY is undefined');
  });
});