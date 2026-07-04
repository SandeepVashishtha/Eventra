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

console.log('check-in utilities tests passed');
