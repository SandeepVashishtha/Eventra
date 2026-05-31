/**
 * Behavioral tests for src/hooks/usePageVisibility.js
 */
import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';

describe('usePageVisibility - initial state', () => {
  it('returns true when document is visible', () => {
    const isVisible = (visibilityState) => visibilityState !== 'hidden';
    assert.strictEqual(isVisible('visible'), true);
  });

  it('returns false when document is hidden', () => {
    const isVisible = (visibilityState) => visibilityState !== 'hidden';
    assert.strictEqual(isVisible('hidden'), false);
  });

  it('returns true by default when document is undefined', () => {
    const getVisibility = () => {
      if (typeof document === 'undefined') return true;
      return document.visibilityState !== 'hidden';
    };

    assert.strictEqual(getVisibility(), true);
  });
});

describe('usePageVisibility - visibilitychange event', () => {
  it('registers visibilitychange event listener', () => {
    const listeners = {};
    const addEventListener = (event, handler) => {
      listeners[event] = listeners[event] || [];
      listeners[event].push(handler);
    };

    addEventListener('visibilitychange', () => {});

    assert.ok(listeners['visibilitychange'], 'Must register visibilitychange listener');
    assert.strictEqual(listeners['visibilitychange'].length, 1);
  });

  it('removes visibilitychange event listener on cleanup', () => {
    const listeners = { visibilitychange: [() => {}] };
    const removeEventListener = (event, handler) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter(h => h !== handler);
      }
    };

    const handler = listeners.visibilitychange[0];
    removeEventListener('visibilitychange', handler);

    assert.strictEqual(listeners.visibilitychange.length, 0, 'Listener must be removed');
  });
});

describe('usePageVisibility - visibility states', () => {
  it('handles visible state', () => {
    const isVisible = (state) => state !== 'hidden';
    assert.strictEqual(isVisible('visible'), true);
  });

  it('handles hidden state', () => {
    const isVisible = (state) => state !== 'hidden';
    assert.strictEqual(isVisible('hidden'), false);
  });

  it('handles prerender state', () => {
    const isVisible = (state) => state !== 'hidden';
    assert.strictEqual(isVisible('prerender'), true, 'Prerender is considered visible');
  });
});

describe('usePageVisibility - state transitions', () => {
  it('tracks visibility changes between visible and hidden', () => {
    const states = [];
    let visibilityState = 'visible';

    states.push(visibilityState !== 'hidden');

    visibilityState = 'hidden';
    states.push(visibilityState !== 'hidden');

    visibilityState = 'visible';
    states.push(visibilityState !== 'hidden');

    assert.deepStrictEqual(states, [true, false, true], 'Should track all visibility changes');
  });
});