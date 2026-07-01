/**
 * Event Filter Validator Test Suite
 * 
 * Comprehensive tests for event filter query parameter validation
 */

import assert from "node:assert/strict";
import { validateEventFilters, ALLOWED_CATEGORIES, ALLOWED_TYPES, ALLOWED_REGISTRATION_STATUSES } from "./eventFilterValidator.js";

// Test 1: Valid filters
assert.equal(validateEventFilters({ category: 'AI/ML' }).isValid, true, "valid category filter");
assert.equal(validateEventFilters({ type: 'workshop' }).isValid, true, "valid type filter");
assert.equal(validateEventFilters({ registrationStatus: 'open' }).isValid, true, "valid registrationStatus filter");

const dateRangeResult = validateEventFilters({ startDate: '2026-01-01', endDate: '2026-12-31' });
assert.equal(dateRangeResult.isValid, true, "valid date range");
assert.ok(dateRangeResult.validated.startDate instanceof Date, "startDate is Date object");
assert.ok(dateRangeResult.validated.endDate instanceof Date, "endDate is Date object");

assert.equal(validateEventFilters({ isVirtual: 'true' }).isValid, true, "valid isVirtual filter");

const multipleFiltersResult = validateEventFilters({
  category: 'Workshop',
  type: 'workshop',
  registrationStatus: 'open',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  isVirtual: 'false'
});
assert.equal(multipleFiltersResult.isValid, true, "multiple valid filters");

assert.equal(validateEventFilters({}).isValid, true, "empty query parameters");

// Test 2: Invalid startDate
const invalidStartDateResult = validateEventFilters({ startDate: 'invalid-date' });
assert.equal(invalidStartDateResult.isValid, false, "invalid startDate format");
assert.ok(invalidStartDateResult.errors.some(e => e.includes('Invalid startDate format')), "startDate error message");

const invalidStartDateResult2 = validateEventFilters({ startDate: 'not-a-date' });
assert.equal(invalidStartDateResult2.isValid, false, "invalid startDate with random text");

const invalidStartDateResult3 = validateEventFilters({ startDate: '01/01/2026' });
assert.equal(invalidStartDateResult3.isValid, false, "invalid startDate with wrong format");

// Test 3: Invalid endDate
const invalidEndDateResult = validateEventFilters({ endDate: 'invalid-date' });
assert.equal(invalidEndDateResult.isValid, false, "invalid endDate format");
assert.ok(invalidEndDateResult.errors.some(e => e.includes('Invalid endDate format')), "endDate error message");

const invalidEndDateResult2 = validateEventFilters({ endDate: 'not-a-date' });
assert.equal(invalidEndDateResult2.isValid, false, "invalid endDate with random text");

// Test 4: Invalid registrationStatus
const invalidRegStatusResult = validateEventFilters({ registrationStatus: 'hacked' });
assert.equal(invalidRegStatusResult.isValid, false, "invalid registrationStatus value");
assert.ok(invalidRegStatusResult.errors.some(e => e.includes('Invalid registrationStatus value')), "registrationStatus error message");

const invalidRegStatusResult2 = validateEventFilters({ registrationStatus: 'open<script>' });
assert.equal(invalidRegStatusResult2.isValid, false, "registrationStatus with special characters");

// Test 5: Invalid boolean value
const invalidBooleanResult = validateEventFilters({ isVirtual: 'abc' });
assert.equal(invalidBooleanResult.isValid, false, "invalid isVirtual value");
assert.ok(invalidBooleanResult.errors.some(e => e.includes('Invalid isVirtual value')), "isVirtual error message");

const invalidBooleanResult2 = validateEventFilters({ isVirtual: '123' });
assert.equal(invalidBooleanResult2.isValid, false, "isVirtual with numeric value");

const invalidBooleanResult3 = validateEventFilters({ isVirtual: 'yes' });
assert.equal(invalidBooleanResult3.isValid, false, "isVirtual with 'yes'");

const invalidBooleanResult4 = validateEventFilters({ isVirtual: 'no' });
assert.equal(invalidBooleanResult4.isValid, false, "isVirtual with 'no'");

// Test 6: Oversized category string
const longString = 'a'.repeat(101);
const oversizedCategoryResult = validateEventFilters({ category: longString });
assert.equal(oversizedCategoryResult.isValid, false, "oversized category string");
assert.ok(oversizedCategoryResult.errors.some(e => e.includes('category must be between 1 and 100 characters')), "category length error");

const oversizedTypeResult = validateEventFilters({ type: longString });
assert.equal(oversizedTypeResult.isValid, false, "oversized type string");
assert.ok(oversizedTypeResult.errors.some(e => e.includes('type must be between 1 and 100 characters')), "type length error");

const oversizedRegStatusResult = validateEventFilters({ registrationStatus: longString });
assert.equal(oversizedRegStatusResult.isValid, false, "oversized registrationStatus string");
assert.ok(oversizedRegStatusResult.errors.some(e => e.includes('registrationStatus must be between 1 and 100 characters')), "registrationStatus length error");

// Test 7: Date range validation
const invalidDateRangeResult = validateEventFilters({ startDate: '2026-12-31', endDate: '2026-01-01' });
assert.equal(invalidDateRangeResult.isValid, false, "startDate after endDate");
assert.ok(invalidDateRangeResult.errors.some(e => e.includes('startDate cannot be after endDate')), "date range error message");

const equalDateRangeResult = validateEventFilters({ startDate: '2026-01-01', endDate: '2026-01-01' });
assert.equal(equalDateRangeResult.isValid, true, "startDate equal to endDate");

const validDateRangeResult = validateEventFilters({ startDate: '2026-01-01', endDate: '2026-12-31' });
assert.equal(validDateRangeResult.isValid, true, "startDate before endDate");

// Test 8: Whitespace normalization
const whitespaceCategoryResult = validateEventFilters({ category: '  workshop  ' });
assert.equal(whitespaceCategoryResult.isValid, true, "trim whitespace from category");
assert.equal(whitespaceCategoryResult.validated.category, 'Workshop', "category normalized to proper casing");

const whitespaceTypeResult = validateEventFilters({ type: '  workshop  ' });
assert.equal(whitespaceTypeResult.isValid, true, "trim whitespace from type");
assert.equal(whitespaceTypeResult.validated.type, 'workshop', "type trimmed");

const whitespaceRegStatusResult = validateEventFilters({ registrationStatus: '  open  ' });
assert.equal(whitespaceRegStatusResult.isValid, true, "trim whitespace from registrationStatus");
assert.equal(whitespaceRegStatusResult.validated.registrationStatus, 'open', "registrationStatus trimmed");

const whitespaceBooleanResult = validateEventFilters({ isVirtual: '  true  ' });
assert.equal(whitespaceBooleanResult.isValid, true, "trim whitespace from isVirtual");
assert.equal(whitespaceBooleanResult.validated.isVirtual, true, "isVirtual trimmed and parsed");

// Invalid category
const invalidCategoryResult = validateEventFilters({ category: 'invalid-category' });
assert.equal(invalidCategoryResult.isValid, false, "invalid category value");
assert.ok(invalidCategoryResult.errors.some(e => e.includes('Invalid category value')), "category error message");

// Invalid type
const invalidTypeResult = validateEventFilters({ type: 'invalid-type' });
assert.equal(invalidTypeResult.isValid, false, "invalid type value");
assert.ok(invalidTypeResult.errors.some(e => e.includes('Invalid type value')), "type error message");

// Multiple validation errors
const multipleErrorsResult = validateEventFilters({
  category: 'invalid-category',
  type: 'invalid-type',
  startDate: 'invalid-date',
  isVirtual: 'abc'
});
assert.equal(multipleErrorsResult.isValid, false, "multiple validation errors");
assert.ok(multipleErrorsResult.errors.length > 1, "multiple errors collected");

// ISO date format validation
const isoDateWithTimeResult = validateEventFilters({ 
  startDate: '2026-01-01T00:00:00Z',
  endDate: '2026-12-31T23:59:59Z'
});
assert.equal(isoDateWithTimeResult.isValid, true, "ISO date with time");

const isoDateWithTimezoneResult = validateEventFilters({ 
  startDate: '2026-01-01T00:00:00+05:30'
});
assert.equal(isoDateWithTimezoneResult.isValid, true, "ISO date with timezone offset");

const malformedIsoDateResult = validateEventFilters({ startDate: '2026-13-01' });
assert.equal(malformedIsoDateResult.isValid, false, "malformed ISO date");
assert.ok(malformedIsoDateResult.errors.some(e => e.includes('Invalid startDate format')), "malformed date error message");
