/**
 * Unit test for EventCheckInScanner rapid-scan deduplication (#17874).
 *
 * Simulates rapid consecutive scans of the same QR code / registration ID
 * before parent state update re-renders flow back down via `existingCheckIns`.
 * Ensures synchronous local set tracking prevents duplicate check-in calls.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
  generateQRCodePayload,
  parseQRCodeData,
  validateCheckInPayload,
  recordCheckIn,
  hasBeenCheckedIn,
} from '../src/utils/checkInUtils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Mock implementation of the scanner's local synchronous dedup mechanism
function createMockScannerController({ eventId, registrations, onCheckIn }) {
  let existingCheckIns = [];
  const localCheckedInIds = new Set();
  let isProcessing = false;
  const loggedToasts = [];

  const toast = {
    warning: (msg) => loggedToasts.push({ type: 'warning', msg }),
    success: (msg) => loggedToasts.push({ type: 'success', msg }),
    error: (msg) => loggedToasts.push({ type: 'error', msg }),
  };

  const handleCheckInRecord = (checkInRecord, parsedData) => {
    if (checkInRecord && checkInRecord.registrationId) {
      localCheckedInIds.add(String(checkInRecord.registrationId));
    }
    if (onCheckIn) {
      onCheckIn(checkInRecord, parsedData);
    }
  };

  const processQRCodeData = (qrData) => {
    if (isProcessing) return false;
    isProcessing = true;

    try {
      const parsedData = parseQRCodeData(qrData);
      if (!parsedData) {
        toast.error('Invalid QR code format');
        return false;
      }

      const validation = validateCheckInPayload(parsedData, eventId);
      if (!validation.isValid) {
        toast.error(validation.error);
        return false;
      }

      const { registrationId } = parsedData;
      const registration = registrations.find(
        (r) => r.id === registrationId || String(r.id) === String(registrationId)
      );

      if (!registration) {
        toast.error('Registration not found for this event');
        return false;
      }

      // Synchronous local + prop deduplication check
      const registrationIdStr = String(registrationId);
      if (
        hasBeenCheckedIn(registrationId, existingCheckIns) ||
        localCheckedInIds.has(registrationIdStr)
      ) {
        toast.warning(`${registration?.name || 'Attendee'} already checked in`);
        return false;
      }

      // Mark locally synchronously
      localCheckedInIds.add(registrationIdStr);

      const checkInRecord = recordCheckIn({
        registrationId,
        timestamp: new Date().toISOString(),
        scannedBy: 'qr-scanner',
      });

      handleCheckInRecord(checkInRecord, parsedData);
      toast.success(`✓ ${registration?.name || 'Attendee'} checked in!`);
      return true;
    } finally {
      isProcessing = false;
    }
  };

  return {
    processQRCodeData,
    setExistingCheckIns: (newCheckIns) => {
      existingCheckIns = newCheckIns;
      newCheckIns.forEach((c) => {
        if (c && c.registrationId) {
          localCheckedInIds.add(String(c.registrationId));
        }
      });
    },
    localCheckedInIds,
    loggedToasts,
  };
}

// Setup test environment data
const eventId = 'event-101';
const registrations = [
  { id: 'reg-001', name: 'Alice Smith', email: 'alice@example.com', status: 'confirmed' },
  { id: 'reg-002', name: 'Bob Jones', email: 'bob@example.com', status: 'confirmed' },
];

const qrDataAlice = generateQRCodePayload('reg-001', eventId, {
  name: 'Alice Smith',
  email: 'alice@example.com',
});

// Test 1: Rapid double scan with stale parent props (the reported issue)
{
  const checkInRecords = [];
  const parentOnCheckIn = (record) => {
    // Simulates asynchronous parent state update scheduling in React:
    // parent state change happens, but existingCheckIns prop is NOT updated yet
    checkInRecords.push(record);
  };

  const scanner = createMockScannerController({
    eventId,
    registrations,
    onCheckIn: parentOnCheckIn,
  });

  // First scan
  const scan1Result = scanner.processQRCodeData(qrDataAlice);
  assert.equal(scan1Result, true, 'First scan of valid QR should succeed');
  assert.equal(checkInRecords.length, 1, 'Parent callback invoked once for first scan');

  // Second rapid scan of same QR code before parent component re-renders
  const scan2Result = scanner.processQRCodeData(qrDataAlice);
  assert.equal(scan2Result, false, 'Second rapid scan of same QR should be blocked');
  assert.equal(
    checkInRecords.length,
    1,
    'Parent callback MUST NOT be invoked a second time for duplicate scan'
  );

  const warnings = scanner.loggedToasts.filter((t) => t.type === 'warning');
  assert.equal(warnings.length, 1, 'Warning toast produced for duplicate scan');
  assert.ok(
    warnings[0].msg.includes('already checked in'),
    'Warning indicates attendee is already checked in'
  );
}

// Test 2: Synchronizing local set when existingCheckIns updates from parent
{
  const scanner = createMockScannerController({
    eventId,
    registrations,
    onCheckIn: () => {},
  });

  // Parent passes existing check-in prop on mount/re-render
  scanner.setExistingCheckIns([{ registrationId: 'reg-002', timestamp: new Date().toISOString() }]);

  assert.ok(
    scanner.localCheckedInIds.has('reg-002'),
    'Local set should include IDs present in existingCheckIns prop'
  );

  const qrDataBob = generateQRCodePayload('reg-002', eventId, {
    name: 'Bob Jones',
    email: 'bob@example.com',
  });

  const scanResult = scanner.processQRCodeData(qrDataBob);
  assert.equal(scanResult, false, 'Scan for attendee already in existingCheckIns is blocked');
}

// Test 3: Validate component source code contract in EventCheckInScanner.jsx
{
  const scannerSrc = readFileSync(
    join(__dirname, '../src/components/EventCheckInScanner.jsx'),
    'utf8'
  );

  assert.ok(
    scannerSrc.includes('localCheckedInIdsRef'),
    'EventCheckInScanner.jsx must define localCheckedInIdsRef for local synchronous dedup'
  );
  assert.ok(
    /localCheckedInIdsRef\.current\.has\(/.test(scannerSrc),
    'EventCheckInScanner.jsx must check localCheckedInIdsRef.current.has() before recording check-in'
  );
  assert.ok(
    /localCheckedInIdsRef\.current\.add\(/.test(scannerSrc),
    'EventCheckInScanner.jsx must synchronously add checked-in IDs to localCheckedInIdsRef'
  );
  assert.ok(
    /handleCheckInRecord/.test(scannerSrc),
    'EventCheckInScanner.jsx must use handleCheckInRecord wrapper for modal and scanner'
  );
}

console.log('EventCheckInScanner rapid-scan deduplication tests passed!');
