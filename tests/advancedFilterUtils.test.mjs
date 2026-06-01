import assert from 'node:assert';
import { getCategoryLabel } from '../src/utils/advancedFilterUtils.js';

console.log('🧪 Testing getCategoryLabel null-safety...');

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

console.log('✅ All getCategoryLabel tests passed!');
