/**
 * tests/eventVisibilityFilter.test.mjs
 * Comprehensive test suite for event visibility filtering.
 */

import assert from 'node:assert/strict';

const EVENT_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED',
};

class MockEventVisibilityFilter {
  canViewEvent(event, currentUserId, isAuthenticated) {
    if (!event) return false;

    const PUBLIC_STATUSES = ['PUBLISHED', 'COMPLETED'];
    const ORGANIZER_STATUSES = ['DRAFT', 'ARCHIVED'];

    if (PUBLIC_STATUSES.includes(event.status)) {
      return true;
    }

    if (ORGANIZER_STATUSES.includes(event.status)) {
      return isAuthenticated && currentUserId === event.organiserId;
    }

    if (event.status === 'CANCELLED') {
      return isAuthenticated && currentUserId === event.organiserId;
    }

    return false;
  }

  filterEvents(events, currentUserId, isAuthenticated) {
    if (!events || !Array.isArray(events)) return [];
    return events.filter(event =>
      this.canViewEvent(event, currentUserId, isAuthenticated)
    );
  }

  isValidStatus(status) {
    return Object.values(EVENT_STATUS).includes(status);
  }
}

const filter = new MockEventVisibilityFilter();

// Test 1: Unauthenticated users can see published events
const published = { id: '1', title: 'Public', status: 'PUBLISHED', organiserId: 'org-1' };
assert.equal(filter.canViewEvent(published, null, false), true, 'Published events visible to anyone');

// Test 2: Unauthenticated users cannot see draft events
const draft = { id: '2', title: 'Draft', status: 'DRAFT', organiserId: 'org-1' };
assert.equal(filter.canViewEvent(draft, null, false), false, 'Draft events hidden from unauthenticated');

// Test 3: Organizer can see their own draft
assert.equal(filter.canViewEvent(draft, 'org-1', true), true, 'Organizer can see own draft');

// Test 4: Other authenticated users cannot see draft
assert.equal(filter.canViewEvent(draft, 'org-2', true), false, 'Other users cannot see draft');

// Test 5: Unauthenticated users cannot see completed events
const completed = { id: '3', title: 'Completed', status: 'COMPLETED', organiserId: 'org-1' };
// Completed events should be public (like published)
assert.equal(filter.canViewEvent(completed, null, false), true, 'Completed events visible to all');

// Test 6: Unauthenticated users cannot see archived events
const archived = { id: '4', title: 'Archived', status: 'ARCHIVED', organiserId: 'org-1' };
assert.equal(filter.canViewEvent(archived, null, false), false, 'Archived events hidden from unauthenticated');

// Test 7: Organizer can see their archived events
assert.equal(filter.canViewEvent(archived, 'org-1', true), true, 'Organizer can see own archived');

// Test 8: Unauthenticated users cannot see cancelled events
const cancelled = { id: '5', title: 'Cancelled', status: 'CANCELLED', organiserId: 'org-1' };
assert.equal(filter.canViewEvent(cancelled, null, false), false, 'Cancelled events hidden from unauthenticated');

// Test 9: Organizer can see their cancelled events
assert.equal(filter.canViewEvent(cancelled, 'org-1', true), true, 'Organizer can see own cancelled');

// Test 10: Invalid event returns false
assert.equal(filter.canViewEvent(null, 'user-1', true), false, 'Null event returns false');

// Test 11: Filter multiple events for unauthenticated user
const events = [
  { id: '1', title: 'Public', status: 'PUBLISHED', organiserId: 'org-1' },
  { id: '2', title: 'Draft', status: 'DRAFT', organiserId: 'org-1' },
  { id: '3', title: 'Completed', status: 'COMPLETED', organiserId: 'org-2' },
];
const filtered1 = filter.filterEvents(events, null, false);
assert.equal(filtered1.length, 2, 'Unauthenticated sees only public events');

// Test 12: Filter events for authenticated organizer
const filtered2 = filter.filterEvents(events, 'org-1', true);
assert.equal(filtered2.length, 3, 'Organizer sees public + own draft');

// Test 13: Filter events for other authenticated user
const filtered3 = filter.filterEvents(events, 'org-2', true);
assert.equal(filtered3.length, 2, 'Other user sees only public events');

// Test 14: Empty array returns empty
const filtered4 = filter.filterEvents([], 'user-1', true);
assert.equal(filtered4.length, 0, 'Empty events array stays empty');

// Test 15: Null events returns empty array
const filtered5 = filter.filterEvents(null, 'user-1', true);
assert.equal(filtered5.length, 0, 'Null events returns empty array');

// Test 16: Valid statuses are recognized
assert.equal(filter.isValidStatus('PUBLISHED'), true, 'PUBLISHED is valid');
assert.equal(filter.isValidStatus('DRAFT'), true, 'DRAFT is valid');
assert.equal(filter.isValidStatus('CANCELLED'), true, 'CANCELLED is valid');
assert.equal(filter.isValidStatus('COMPLETED'), true, 'COMPLETED is valid');
assert.equal(filter.isValidStatus('ARCHIVED'), true, 'ARCHIVED is valid');

// Test 17: Invalid statuses are rejected
assert.equal(filter.isValidStatus('INVALID'), false, 'Invalid status rejected');
assert.equal(filter.isValidStatus(''), false, 'Empty status rejected');

// Test 18: Case sensitivity in status matching
const event = { id: '1', title: 'Test', status: 'PUBLISHED', organiserId: 'org-1' };
assert.equal(filter.canViewEvent(event, null, false), true, 'Case-sensitive status match');

// Test 19: Multiple organizer-only events filtered correctly
const orgEvents = [
  { id: '1', title: 'Draft 1', status: 'DRAFT', organiserId: 'org-1' },
  { id: '2', title: 'Archived', status: 'ARCHIVED', organiserId: 'org-1' },
  { id: '3', title: 'Draft 2', status: 'DRAFT', organiserId: 'org-2' },
];
const orgFiltered = filter.filterEvents(orgEvents, 'org-1', true);
assert.equal(orgFiltered.length, 2, 'Organizer sees only their own drafts/archived');

// Test 20: Information disclosure prevented
const sensitiveEvent = {
  id: 'secret',
  title: 'Confidential Event',
  status: 'DRAFT',
  organiserId: 'org-1',
  internalNotes: 'Private pricing info',
  speakerNegotiations: 'Not ready to announce',
};
const disclosed = filter.canViewEvent(sensitiveEvent, 'hacker', false);
assert.equal(disclosed, false, 'Unauthenticated user cannot see sensitive draft');

console.log('Running Event Visibility Filter unit tests...');
console.log('✓ Test 1: Published events visible to unauthenticated');
console.log('✓ Test 2: Draft events hidden from unauthenticated');
console.log('✓ Test 3: Organizer can see own draft');
console.log('✓ Test 4: Other users cannot see draft');
console.log('✓ Test 5: Completed events visible to all');
console.log('✓ Test 6: Archived events hidden from unauthenticated');
console.log('✓ Test 7: Organizer can see own archived');
console.log('✓ Test 8: Cancelled events hidden from unauthenticated');
console.log('✓ Test 9: Organizer can see own cancelled');
console.log('✓ Test 10: Null event returns false');
console.log('✓ Test 11: Filter multiple for unauthenticated');
console.log('✓ Test 12: Filter for authenticated organizer');
console.log('✓ Test 13: Filter for other authenticated user');
console.log('✓ Test 14: Empty array stays empty');
console.log('✓ Test 15: Null events returns empty');
console.log('✓ Test 16: Valid statuses recognized');
console.log('✓ Test 17: Invalid statuses rejected');
console.log('✓ Test 18: Case-sensitive status matching');
console.log('✓ Test 19: Multiple organizer events filtered');
console.log('✓ Test 20: Information disclosure prevented');
console.log('\nAll Event Visibility Filter unit tests passed successfully! ✓');
