import assert from 'node:assert/strict';

import {
  computeCheckInStats,
  computeSessionCheckInStats,
  exportCheckInAsCSV,
  generateCheckInCSV,
  generateQRCodePayload,
  getCheckInHistory,
  hasBeenCheckedIn,
  parseQRCodeData,
  recordCheckIn,
  validateCheckInPayload,
} from '../src/utils/checkInUtils.js';

// Test: generateQRCodePayload - basic generation
const qrPayload = generateQRCodePayload('reg-123', 'event-456', {
  name: 'John Doe',
  email: 'john@example.com',
});

assert.ok(qrPayload, 'QR payload should be generated');
const parsedPayload = JSON.parse(qrPayload);
assert.equal(parsedPayload.registrationId, 'reg-123', 'should contain registrationId');
assert.equal(parsedPayload.eventId, 'event-456', 'should contain eventId');
assert.equal(parsedPayload.attendeeName, 'John Doe', 'should contain attendee name');
assert.equal(parsedPayload.attendeeEmail, 'john@example.com', 'should contain attendee email');
assert.ok(parsedPayload.timestamp, 'should contain timestamp');

// Test: generateQRCodePayload - with missing attendee info
const qrPayloadMinimal = generateQRCodePayload('reg-789', 'event-999');
const parsedMinimal = JSON.parse(qrPayloadMinimal);
assert.equal(parsedMinimal.attendeeName, 'Unknown', 'should use "Unknown" for missing name');
assert.equal(parsedMinimal.attendeeEmail, 'unknown@example.com', 'should use default email');

// Test: parseQRCodeData - valid data
const parsedData = parseQRCodeData(qrPayload);
assert.deepEqual(
  parsedData,
  parsedPayload,
  'should parse valid QR code data correctly'
);

// Test: parseQRCodeData - invalid data
// Note: parseQRCodeData logs an error but returns null - this is expected behavior
const invalidParsed = parseQRCodeData('{"incomplete": ');
assert.strictEqual(invalidParsed, null, 'should return null for invalid JSON');

// Test: validateCheckInPayload - valid payload
const validResult = validateCheckInPayload(
  {
    registrationId: 'reg-123',
    eventId: 'event-456',
    timestamp: new Date().toISOString(),
    attendeeName: 'John Doe',
  },
  'event-456'
);
assert.equal(validResult.isValid, true, 'should validate matching event');
assert.equal(validResult.error, null, 'should have no error');

// Test: validateCheckInPayload - mismatched event
const mismatchResult = validateCheckInPayload(
  {
    registrationId: 'reg-123',
    eventId: 'event-456',
  },
  'event-999'
);
assert.equal(mismatchResult.isValid, false, 'should reject mismatched event');
assert.ok(
  mismatchResult.error.includes('different event'),
  'should indicate event mismatch'
);

// Test: validateCheckInPayload - missing registration ID
const missingRegResult = validateCheckInPayload(
  {
    eventId: 'event-456',
  },
  'event-456'
);
assert.equal(missingRegResult.isValid, false, 'should reject missing registration ID');
assert.ok(
  missingRegResult.error.includes('registration ID'),
  'should indicate missing registration ID'
);

// Test: validateCheckInPayload - null payload
const nullResult = validateCheckInPayload(null, 'event-456');
assert.equal(nullResult.isValid, false, 'should reject null payload');

// Test: recordCheckIn - basic recording
const checkInRecord = recordCheckIn({
  registrationId: 'reg-123',
  scannedBy: 'scanner-1',
});
assert.ok(checkInRecord.id, 'should generate check-in ID');
assert.equal(checkInRecord.registrationId, 'reg-123', 'should store registration ID');
assert.equal(checkInRecord.status, 'completed', 'should set status to completed');
assert.ok(checkInRecord.timestamp, 'should have timestamp');

// Test: recordCheckIn - missing registration ID
assert.throws(
  () => recordCheckIn({ scannedBy: 'scanner-1' }),
  'should throw error for missing registration ID'
);

// Test: hasBeenCheckedIn - checked in attendee
const checkIns = [
  { registrationId: 'reg-123', timestamp: new Date().toISOString() },
  { registrationId: 'reg-456', timestamp: new Date().toISOString() },
];
assert.equal(hasBeenCheckedIn('reg-123', checkIns), true, 'should return true for checked-in attendee');
assert.equal(hasBeenCheckedIn('reg-999', checkIns), false, 'should return false for not checked-in attendee');

// Test: hasBeenCheckedIn - empty check-ins
assert.equal(hasBeenCheckedIn('reg-123', []), false, 'should return false with empty check-ins');

// Test: getCheckInHistory - retrieve history
const history = getCheckInHistory('reg-123', checkIns);
assert.equal(history.length, 1, 'should return 1 record for reg-123');
assert.equal(history[0].registrationId, 'reg-123', 'should return correct registration');

// Test: getCheckInHistory - multiple check-ins for same registration
const multipleCheckIns = [
  { registrationId: 'reg-123', timestamp: new Date(Date.now() - 10000).toISOString(), id: 'c1' },
  { registrationId: 'reg-123', timestamp: new Date(Date.now() - 5000).toISOString(), id: 'c2' },
  { registrationId: 'reg-456', timestamp: new Date().toISOString(), id: 'c3' },
];
const multiHistory = getCheckInHistory('reg-123', multipleCheckIns);
assert.equal(multiHistory.length, 2, 'should return all check-ins for registration');
assert.equal(multiHistory[0].id, 'c2', 'should be sorted newest first');
assert.equal(multiHistory[1].id, 'c1', 'should be sorted newest first');

// Test: computeCheckInStats - basic stats
const registrations = [
  { id: 'reg-1', name: 'Alice', email: 'alice@example.com', status: 'confirmed' },
  { id: 'reg-2', name: 'Bob', email: 'bob@example.com', status: 'confirmed' },
  { id: 'reg-3', name: 'Charlie', email: 'charlie@example.com', status: 'cancelled' },
  { id: 'reg-4', name: 'Diana', email: 'diana@example.com', status: 'confirmed' },
];

const eventCheckIns = [
  { registrationId: 'reg-1', timestamp: new Date().toISOString(), scannedBy: 'scanner-1' },
  { registrationId: 'reg-2', timestamp: new Date().toISOString(), scannedBy: 'scanner-1' },
];

const stats = computeCheckInStats(registrations, eventCheckIns);
assert.equal(stats.totalRegistrations, 4, 'should count total registrations');
assert.equal(stats.activeRegistrations, 3, 'should exclude cancelled registrations');
assert.equal(stats.checkedIn, 2, 'should count checked-in attendees');
assert.equal(stats.notCheckedIn, 1, 'should count not checked-in attendees');
assert.equal(stats.checkInRate, 66.67, 'should calculate correct check-in rate');

// Test: computeCheckInStats - with recent check-ins
assert.ok(Array.isArray(stats.recentCheckIns), 'should have recent check-ins array');
assert.equal(stats.recentCheckIns.length, 2, 'should include 2 recent check-ins');
assert.equal(stats.recentCheckIns[0].attendeeName, 'Alice', 'should include attendee name');
assert.equal(stats.recentCheckIns[0].attendeeEmail, 'alice@example.com', 'should include attendee email');

// Test: computeCheckInStats - empty arrays
const emptyStats = computeCheckInStats([], []);
assert.equal(emptyStats.totalRegistrations, 0, 'should handle empty registrations');
assert.equal(emptyStats.checkInRate, 0, 'should set rate to 0 for no registrations');

// Test: computeCheckInStats - no checked-ins
const noCheckInStats = computeCheckInStats(registrations, []);
assert.equal(noCheckInStats.checkedIn, 0, 'should handle no check-ins');
assert.equal(noCheckInStats.notCheckedIn, 3, 'should count all as not checked in');

// Test: computeCheckInStats - check-ins outside the active set must not produce
// negative counts or a rate above 100%.
const staleCheckIns = [
  ...eventCheckIns,
  { registrationId: 'reg-3', timestamp: new Date().toISOString(), scannedBy: 'scanner-1' },
  { registrationId: 'reg-999', timestamp: new Date().toISOString(), scannedBy: 'scanner-1' },
];
const staleStats = computeCheckInStats(registrations, staleCheckIns);
assert.equal(staleStats.checkedIn, 2, 'should count only check-ins for active registrations');
assert.equal(staleStats.notCheckedIn, 1, 'should never report negative not-checked-in counts');
assert.ok(staleStats.checkInRate <= 100, 'check-in rate should never exceed 100%');
assert.equal(
  staleStats.checkInRate,
  66.67,
  'should compute the rate against active registrations only'
);

// Test: computeCheckInStats - must not mutate the caller's checkIns array.
const originalOrder = eventCheckIns.map((c) => c.registrationId);
computeCheckInStats(registrations, eventCheckIns);
assert.deepEqual(
  eventCheckIns.map((c) => c.registrationId),
  originalOrder,
  'should not reorder the caller checkIns array'
);

// Test: computeSessionCheckInStats - basic session stats
const sessions = [
  { id: 'session-1', name: 'Keynote', track: 'Main' },
  { id: 'session-2', name: 'Workshop', track: 'Side' },
];

const attendanceLogs = [
  { sessionId: 'session-1', registrationId: 'reg-1' },
  { sessionId: 'session-1', registrationId: 'reg-2' },
  { sessionId: 'session-2', registrationId: 'reg-2' },
  { sessionId: 'session-2', registrationId: 'reg-3' },
];

const sessionCheckIns = [
  { registrationId: 'reg-1', timestamp: new Date().toISOString() },
  { registrationId: 'reg-2', timestamp: new Date().toISOString() },
];

const sessionStats = computeSessionCheckInStats(sessions, attendanceLogs, sessionCheckIns);
assert.ok(sessionStats['session-1'], 'should have session-1 stats');
assert.ok(sessionStats['session-2'], 'should have session-2 stats');

assert.equal(sessionStats['session-1'].totalAttendees, 2, 'session-1 should have 2 attendees');
assert.equal(sessionStats['session-1'].checkedIn, 2, 'session-1 should have 2 checked-in');
assert.equal(sessionStats['session-1'].checkInRate, 100, 'session-1 should have 100% check-in rate');

assert.equal(sessionStats['session-2'].totalAttendees, 2, 'session-2 should have 2 attendees');
assert.equal(sessionStats['session-2'].checkedIn, 1, 'session-2 should have 1 checked-in');
assert.equal(sessionStats['session-2'].checkInRate, 50, 'session-2 should have 50% check-in rate');

// Test: generateCheckInCSV - CSV generation
const csv = generateCheckInCSV(stats, registrations, eventCheckIns);
assert.ok(csv.includes('CHECK-IN SUMMARY'), 'CSV should contain summary section');
assert.ok(csv.includes('DETAILED CHECK-INS'), 'CSV should contain detailed section');
assert.ok(csv.includes('Total Registrations,4'), 'CSV should contain total registrations');
assert.ok(csv.includes('Check-In Rate,' + stats.checkInRate + '%'), 'CSV should contain check-in rate');
assert.ok(csv.includes('Alice'), 'CSV should contain attendee name');
assert.ok(csv.includes('alice@example.com'), 'CSV should contain attendee email');

// Test: generateCheckInCSV - comma escaping in names
const registrationsWithCommas = [
  { id: 'reg-1', name: 'Smith, John', email: 'john@example.com', status: 'confirmed' },
];
const checkInsWithCommas = [
  { registrationId: 'reg-1', timestamp: new Date().toISOString(), scannedBy: 'scanner' },
];
const csvWithCommas = generateCheckInCSV(
  computeCheckInStats(registrationsWithCommas, checkInsWithCommas),
  registrationsWithCommas,
  checkInsWithCommas
);
// The generateCheckInCSV function replaces commas with spaces in names for CSV format
// "Smith, John" becomes "Smith  John" (with two spaces)
assert.ok(csvWithCommas.includes('Smith  John'), 'CSV should escape commas in names');

// Import group-related functions
import {
  isGroupRegistration,
  getGroupIdFromRegistration,
  getGroupMembers,
  getGroupPrimary,
  isEntireGroupCheckedIn,
  getGroupName,
  recordGroupCheckIns,
  computeGroupCheckInStats,
} from '../src/utils/checkInUtils.js';

// Test: isGroupRegistration - with groupId
const groupRegistration = {
  id: 'reg-1',
  name: 'Alice',
  email: 'alice@example.com',
  groupId: 'group-1',
  isGroupPrimary: true,
};
assert.equal(isGroupRegistration(groupRegistration), true, 'should identify group registration by groupId');

// Test: isGroupRegistration - with isGroupPrimary
const primaryRegistration = {
  id: 'reg-2',
  name: 'Bob',
  email: 'bob@example.com',
  isGroupPrimary: true,
};
assert.equal(isGroupRegistration(primaryRegistration), true, 'should identify group registration by isGroupPrimary');

// Test: isGroupRegistration - non-group registration
const individualRegistration = {
  id: 'reg-3',
  name: 'Charlie',
  email: 'charlie@example.com',
};
assert.equal(isGroupRegistration(individualRegistration), false, 'should return false for non-group registration');

// Test: isGroupRegistration - null/undefined
assert.equal(isGroupRegistration(null), false, 'should return false for null registration');
assert.equal(isGroupRegistration(undefined), false, 'should return false for undefined registration');

// Test: getGroupIdFromRegistration - with groupId
assert.equal(getGroupIdFromRegistration(groupRegistration), 'group-1', 'should return groupId');

// Test: getGroupIdFromRegistration - without groupId
assert.equal(getGroupIdFromRegistration(individualRegistration), null, 'should return null for non-group registration');

// Test: getGroupMembers - filter by groupId
const groupRegistrations = [
  { id: 'reg-1', name: 'Alice', groupId: 'group-1', isGroupPrimary: true },
  { id: 'reg-2', name: 'Bob', groupId: 'group-1' },
  { id: 'reg-3', name: 'Charlie', groupId: 'group-1' },
  { id: 'reg-4', name: 'Diana', groupId: 'group-2' },
];
const group1Members = getGroupMembers('group-1', groupRegistrations);
assert.equal(group1Members.length, 3, 'should return all members of group-1');
assert.equal(group1Members[0].name, 'Alice', 'should include Alice');
assert.equal(group1Members[1].name, 'Bob', 'should include Bob');
assert.equal(group1Members[2].name, 'Charlie', 'should include Charlie');

// Test: getGroupMembers - non-existent group
const nonExistentMembers = getGroupMembers('group-999', groupRegistrations);
assert.equal(nonExistentMembers.length, 0, 'should return empty array for non-existent group');

// Test: getGroupMembers - null/undefined groupId
assert.deepEqual(getGroupMembers(null, groupRegistrations), [], 'should return empty array for null groupId');
assert.deepEqual(getGroupMembers(undefined, groupRegistrations), [], 'should return empty array for undefined groupId');

// Test: getGroupPrimary - find primary by isGroupPrimary flag
const primary = getGroupPrimary(group1Members);
assert.equal(primary.id, 'reg-1', 'should return the primary member');

// Test: getGroupPrimary - fallback to first member
const groupWithoutPrimary = [
  { id: 'reg-5', name: 'Eve', groupId: 'group-3' },
  { id: 'reg-6', name: 'Frank', groupId: 'group-3' },
];
const fallbackPrimary = getGroupPrimary(groupWithoutPrimary);
assert.equal(fallbackPrimary.id, 'reg-5', 'should return first member as primary when no isGroupPrimary');

// Test: getGroupPrimary - empty array
assert.equal(getGroupPrimary([]), null, 'should return null for empty array');

// Test: getGroupName - from primary registration
const primaryWithGroupName = {
  id: 'reg-1',
  name: 'Alice',
  groupId: 'group-1',
  isGroupPrimary: true,
  groupName: 'Table of 10',
};
assert.equal(getGroupName(primaryWithGroupName), 'Table of 10', 'should return groupName from registration');

// Test: getGroupName - default name
const registrationWithoutGroupName = {
  id: 'reg-1',
  name: 'Alice',
  groupId: 'group-1',
  isGroupPrimary: true,
};
assert.equal(getGroupName(registrationWithoutGroupName), 'Group', 'should return default "Group" name');

// Test: getGroupName - from array
assert.equal(getGroupName(group1Members), 'Group of 3', 'should return "Group of N" for array without primary groupName');

// Test: isEntireGroupCheckedIn - all checked in
const allCheckedIn = [
  { registrationId: 'reg-1', timestamp: new Date().toISOString() },
  { registrationId: 'reg-2', timestamp: new Date().toISOString() },
  { registrationId: 'reg-3', timestamp: new Date().toISOString() },
];
assert.equal(isEntireGroupCheckedIn(group1Members, allCheckedIn), true, 'should return true when all members checked in');

// Test: isEntireGroupCheckedIn - some not checked in
const someCheckedIn = [
  { registrationId: 'reg-1', timestamp: new Date().toISOString() },
];
assert.equal(isEntireGroupCheckedIn(group1Members, someCheckedIn), false, 'should return false when not all members checked in');

// Test: isEntireGroupCheckedIn - none checked in
assert.equal(isEntireGroupCheckedIn(group1Members, []), false, 'should return false when no members checked in');

// Test: recordGroupCheckIns - basic recording
const groupMembersToCheckIn = [
  { id: 'reg-1', name: 'Alice', groupId: 'group-1', groupName: 'Table of 10' },
  { id: 'reg-2', name: 'Bob', groupId: 'group-1', groupName: 'Table of 10' },
];
const newCheckIns = recordGroupCheckIns(groupMembersToCheckIn, 'group-check-in', []);
assert.equal(newCheckIns.length, 2, 'should create check-in records for all group members');
assert.equal(newCheckIns[0].registrationId, 'reg-1', 'should include registrationId');
assert.equal(newCheckIns[0].scannedBy, 'group-check-in', 'should include scannedBy');
assert.equal(newCheckIns[0].isGroupCheckIn, true, 'should mark as group check-in');
assert.equal(newCheckIns[0].groupId, 'group-1', 'should include groupId');

// Test: recordGroupCheckIns - skip already checked in
const existingCheckIn = [
  { registrationId: 'reg-1', timestamp: new Date().toISOString(), scannedBy: 'scanner' },
];
const newCheckInsWithExisting = recordGroupCheckIns(groupMembersToCheckIn, 'group-check-in', existingCheckIn);
assert.equal(newCheckInsWithExisting.length, 1, 'should skip already checked-in members');
assert.equal(newCheckInsWithExisting[0].registrationId, 'reg-2', 'should only include non-checked-in members');

// Test: recordGroupCheckIns - empty group
assert.deepEqual(recordGroupCheckIns([], 'scanner', []), [], 'should return empty array for empty group');

// Test: computeGroupCheckInStats - basic stats
const groupRegistrationsForStats = [
  { id: 'reg-1', name: 'Alice', groupId: 'group-1', status: 'confirmed' },
  { id: 'reg-2', name: 'Bob', groupId: 'group-1', status: 'confirmed' },
  { id: 'reg-3', name: 'Charlie', groupId: 'group-1', status: 'confirmed' },
  { id: 'reg-4', name: 'Diana', groupId: 'group-2', status: 'confirmed' },
  { id: 'reg-5', name: 'Eve', status: 'confirmed' }, // Not in a group
];

const groupCheckIns = [
  { registrationId: 'reg-1', timestamp: new Date().toISOString() },
  { registrationId: 'reg-2', timestamp: new Date().toISOString() },
  { registrationId: 'reg-3', timestamp: new Date().toISOString() },
  { registrationId: 'reg-4', timestamp: new Date().toISOString() },
];

const groupStats = computeGroupCheckInStats(groupRegistrationsForStats, groupCheckIns);
assert.equal(groupStats.totalGroups, 2, 'should count 2 groups');
assert.equal(groupStats.fullyCheckedInGroups, 2, 'should count 2 fully checked-in groups (group-1 and group-2)');
assert.equal(groupStats.partiallyCheckedInGroups, 0, 'should count 0 partially checked-in groups');

// Test: computeGroupCheckInStats - partial check-in
const partialCheckIns = [
  { registrationId: 'reg-1', timestamp: new Date().toISOString() },
];
const partialStats = computeGroupCheckInStats(groupRegistrationsForStats, partialCheckIns);
assert.equal(partialStats.totalGroups, 2, 'should count 2 groups');
assert.equal(partialStats.fullyCheckedInGroups, 0, 'should count 0 fully checked-in groups');
assert.equal(partialStats.partiallyCheckedInGroups, 1, 'should count 1 partially checked-in group');

// Test: computeGroupCheckInStats - no groups
const noGroupStats = computeGroupCheckInStats([{ id: 'reg-5', name: 'Eve', status: 'confirmed' }], []);
assert.equal(noGroupStats.totalGroups, 0, 'should count 0 groups when no group registrations');

console.log('check-in utilities tests passed (including group functions)');
