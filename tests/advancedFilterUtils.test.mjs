import assert from 'node:assert';
import {
  getCategoryLabel,
  filterByCategory,
  filterByLocation,
  filterByMode,
  filterByPrice,
  filterByDateRange,
  filterByStatus,
} from '../src/utils/advancedFilterUtils.js';

console.log('🧪 Testing advancedFilterUtils null-safety & edge-cases...');

// Test 1: Valid category ID
assert.strictEqual(getCategoryLabel('web-development'), 'Web Development');

// Test 2: Valid category label (normalized)
assert.strictEqual(getCategoryLabel('Web Development'), 'Web Development');

// Test 3: Null input
assert.strictEqual(getCategoryLabel(null), '');

// Test 4: Undefined input
assert.strictEqual(getCategoryLabel(undefined), '');

// Test 5: Empty string
assert.strictEqual(getCategoryLabel(''), '');

// Test 6: Whitespace string
assert.strictEqual(getCategoryLabel('   '), '');

// Test 7: Unknown category
assert.strictEqual(getCategoryLabel('unknown-category'), 'unknown-category');

// Test 8: filterByCategory with null/undefined events
assert.deepEqual(filterByCategory(null, ['web-development']), []);
assert.deepEqual(filterByCategory(undefined, ['web-development']), []);

// Test 9: filterByCategory with malformed/null items inside events list
const mixedEvents = [
  { id: 1, category: 'web-development' },
  null,
  { id: 2, category: 'ai-ml' }
];
assert.deepEqual(filterByCategory(mixedEvents, ['web-development']), [{ id: 1, category: 'web-development' }]);

// Test 10: filterByLocation with malformed/null items inside events list
const mixedLocationEvents = [
  { id: 1, location: 'Mumbai' },
  null,
  { id: 2, location: 'Bangalore' }
];
assert.deepEqual(filterByLocation(mixedLocationEvents, 'mumbai'), [{ id: 1, location: 'Mumbai' }]);

// Test 11: filterByMode with malformed/null items inside events list
const mixedModeEvents = [
  { id: 1, mode: 'online' },
  null,
  { id: 2, mode: 'offline' }
];
assert.deepEqual(filterByMode(mixedModeEvents, ['online']), [{ id: 1, mode: 'online' }]);

// Test 12: filterByPrice with malformed/null items inside events list
const mixedPriceEvents = [
  { id: 1, price: 50 },
  null,
  { id: 2, price: 500 }
];
assert.deepEqual(filterByPrice(mixedPriceEvents, { min: 0, max: 100 }), [{ id: 1, price: 50 }]);

assert.deepEqual(filterByStatus(mixedEvents, ['upcoming']), [
  { id: 1, category: 'web-development' },
  { id: 2, category: 'ai-ml' }
]);

console.log('✅ All advancedFilterUtils tests passed!');
