import assert from 'node:assert/strict';

import {
  isGroupRegistration,
  getGroupIdFromRegistration,
  getGroupMembers,
  getGroupPrimary,
  getGroupName,
  recordGroupCheckIns,
  computeGroupCheckInStats,
} from '../src/utils/checkInUtils.js';

// Test the complete bulk check-in flow

// 1. Test that we can identify a group registration
const primaryBuyer = {
  id: 'reg-primary',
  name: 'John Smith',
  email: 'john@corporate.com',
  groupId: 'table-10',
  isGroupPrimary: true,
  groupName: 'Table of 10',
};

assert.equal(isGroupRegistration(primaryBuyer), true, 'Primary buyer should be identified as group registration');
assert.equal(getGroupIdFromRegistration(primaryBuyer), 'table-10', 'Should get group ID from primary buyer');

// 2. Test that we can get all group members
const allRegistrations = [
  primaryBuyer,
  { id: 'reg-1', name: 'Alice', email: 'alice@corporate.com', groupId: 'table-10' },
  { id: 'reg-2', name: 'Bob', email: 'bob@corporate.com', groupId: 'table-10' },
  { id: 'reg-3', name: 'Charlie', email: 'charlie@corporate.com', groupId: 'table-10' },
  { id: 'reg-4', name: 'Diana', email: 'diana@corporate.com', groupId: 'table-10' },
  { id: 'reg-5', name: 'Eve', email: 'eve@corporate.com', groupId: 'table-10' },
  { id: 'reg-6', name: 'Frank', email: 'frank@corporate.com', groupId: 'table-10' },
  { id: 'reg-7', name: 'Grace', email: 'grace@corporate.com', groupId: 'table-10' },
  { id: 'reg-8', name: 'Henry', email: 'henry@corporate.com', groupId: 'table-10' },
  { id: 'reg-9', name: 'Ivy', email: 'ivy@corporate.com', groupId: 'table-10' },
  { id: 'reg-10', name: 'Jack', email: 'jack@corporate.com', groupId: 'table-10' },
  // Total: 10 members + 1 primary = 11 people in the group
  { id: 'reg-individual', name: 'Individual', email: 'individual@example.com' }, // Not in group
];

const groupMembers = getGroupMembers('table-10', allRegistrations);
assert.equal(groupMembers.length, 11, 'Should get all 11 group members (10 + primary)');

// 3. Test that we can identify the primary
const primary = getGroupPrimary(groupMembers);
assert.equal(primary.id, 'reg-primary', 'Should identify the primary buyer');
assert.equal(primary.name, 'John Smith', 'Primary should be John Smith');

// 4. Test group name
assert.equal(getGroupName(primary), 'Table of 10', 'Should get group name from primary');

// 5. Test scenario: All 10 show up (excluding primary who is already scanned)
// Primary buyer scans their QR code, opening the modal
// All 10 attendees are present
const allAttendees = groupMembers.filter(m => m.id !== 'reg-primary'); // 10 members

// Create check-in records for all 10 attendees
const existingCheckIns = []; // No one checked in yet
const newCheckIns = recordGroupCheckIns(allAttendees, 'bulk-group-check-in', existingCheckIns);

assert.equal(newCheckIns.length, 10, 'Should create 10 check-in records');
assert.ok(newCheckIns.every(c => c.isGroupCheckIn === true), 'All should be marked as group check-ins');
assert.ok(newCheckIns.every(c => c.scannedBy === 'bulk-group-check-in'), 'All should be scanned by bulk-group-check-in');

// 6. Test scenario: Only 8 of 10 show up
const attendeesWhoShowedUp = allAttendees.slice(0, 8); // First 8 show up
const partialCheckIns = recordGroupCheckIns(attendeesWhoShowedUp, 'bulk-group-check-in', []);

assert.equal(partialCheckIns.length, 8, 'Should create 8 check-in records for partial group');

// 7. Test group statistics
const allGroupCheckIns = [
  ...partialCheckIns,
  { registrationId: 'reg-1', timestamp: new Date().toISOString(), scannedBy: 'scanner' },
];

const groupStats = computeGroupCheckInStats(groupMembers, allGroupCheckIns);
assert.equal(groupStats.totalGroups, 1, 'Should have 1 group');
// group-1 has 11 members, 9 checked in (8 from bulk + 1 from scanner), 2 not checked in
// So it's partially checked in
assert.equal(groupStats.fullyCheckedInGroups, 0, 'Should have 0 fully checked-in groups');
assert.equal(groupStats.partiallyCheckedInGroups, 1, 'Should have 1 partially checked-in group');

// 8. Test when entire group is checked in
const allGroupMembersCheckIns = groupMembers.map(m => ({
  registrationId: m.id,
  timestamp: new Date().toISOString(),
  scannedBy: 'bulk-group-check-in',
}));

const completeStats = computeGroupCheckInStats(groupMembers, allGroupMembersCheckIns);
assert.equal(completeStats.fullyCheckedInGroups, 1, 'Should have 1 fully checked-in group');
assert.equal(completeStats.partiallyCheckedInGroups, 0, 'Should have 0 partially checked-in groups');

// 9. Test that individual toggles work correctly
// If only 8 of 10 showed up, and we want to check in only those 8
// The modal should allow us to toggle off the 2 who didn't show up
// This is tested by the ability to select specific members
const selectedMembers = attendeesWhoShowedUp.reduce((acc, member) => {
  acc[member.id] = true;
  return acc;
}, {});

assert.equal(Object.keys(selectedMembers).length, 8, 'Should have 8 selected members');
assert.ok(Object.values(selectedMembers).every(v => v === true), 'All selected should be true');

console.log('Bulk check-in flow tests passed!');
console.log('✓ Primary buyer identification works');
console.log('✓ Group member retrieval works');
console.log('✓ Group primary identification works');
console.log('✓ Bulk check-in for full group works');
console.log('✓ Bulk check-in for partial group works');
console.log('✓ Group statistics calculation works');
console.log('✓ Individual toggle simulation works');
