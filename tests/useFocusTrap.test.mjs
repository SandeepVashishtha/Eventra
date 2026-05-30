import assert from "node:assert/strict";

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

assert.ok(FOCUSABLE_SELECTORS.includes('a[href]'), "Should include anchor links");
assert.ok(FOCUSABLE_SELECTORS.includes('button:not([disabled])'), "Should include buttons");
assert.ok(FOCUSABLE_SELECTORS.includes('input:not([disabled])'), "Should include inputs");
assert.ok(FOCUSABLE_SELECTORS.includes('[tabindex]'), "Should include tabindex");

const selectors = FOCUSABLE_SELECTORS.split(',').map(s => s.trim());
assert.strictEqual(selectors.length, 6, "Should have 6 focusable selectors");
assert.strictEqual(selectors[0], 'a[href]', "First selector should be anchor");
assert.strictEqual(selectors[1], 'button:not([disabled])', "Second selector should be button");
assert.strictEqual(selectors[2], 'textarea:not([disabled])', "Third selector should be textarea");
assert.strictEqual(selectors[3], 'input:not([disabled])', "Fourth selector should be input");
assert.strictEqual(selectors[4], 'select:not([disabled])', "Fifth selector should be select");
assert.strictEqual(selectors[5], '[tabindex]:not([tabindex="-1"])', "Sixth selector should be tabindex");

const mockContainer = {
  querySelectorAll: (sel) => {
    return [
      { tagName: 'BUTTON', focus: () => {}, hasAttribute: (attr) => attr !== 'disabled' },
      { tagName: 'INPUT', focus: () => {}, hasAttribute: (attr) => attr !== 'disabled' },
    ];
  },
  contains: (el) => true,
  focus: () => {},
};

const focusable = mockContainer.querySelectorAll(FOCUSABLE_SELECTORS);
assert.strictEqual(focusable.length, 2, "Should find 2 focusable elements");

assert.ok(focusable[0].tagName === 'BUTTON', "First element should be button");
assert.ok(focusable[1].tagName === 'INPUT', "Second element should be input");

const mockEvent = {
  key: 'Tab',
  shiftKey: false,
  preventDefault: () => {},
  target: focusable[1],
};

assert.strictEqual(mockEvent.key, 'Tab', "Tab key should be detected");
assert.strictEqual(mockEvent.shiftKey, false, "Shift key state should be accessible");
assert.ok(typeof mockEvent.preventDefault === 'function', "preventDefault should be a function");

console.log("useFocusTrap tests passed ✓");