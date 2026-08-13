/**
 * checkInUtils.js
 * Utilities for managing event check-ins, QR code generation,
 * and check-in statistics.
 * Now includes support for group/bulk check-ins.
 */

/**
 * Generates QR code data for a registration
 * @param {string} registrationId - Unique registration ID
 * @param {string} eventId - Event ID
 * @param {Object} attendee - Attendee information {name, email}
 * @returns {string} QR code payload
 */
export const generateQRCodePayload = (registrationId, eventId, attendee = {}) => {
  const payload = {
    registrationId,
    eventId,
    timestamp: new Date().toISOString(),
    attendeeName: attendee.name || 'Unknown',
    attendeeEmail: attendee.email || 'unknown@example.com',
  };

  // Return as JSON string for QR encoding
  return JSON.stringify(payload);
};

/**
 * Parses QR code data
 * @param {string} qrData - QR code payload
 * @returns {Object|null} Parsed data or null if invalid
 */
export const parseQRCodeData = (qrData) => {
  try {
    return JSON.parse(qrData);
  } catch (err) {
    console.error('Invalid QR code data:', err);
    return null;
  }
};

/**
 * Validates a check-in payload
 * @param {Object} payload - QR code payload object
 * @param {string} currentEventId - Current event ID to validate against
 * @returns {Object} {isValid, error, payload}
 */
export const validateCheckInPayload = (payload, currentEventId) => {
  if (!payload) {
    return {
      isValid: false,
      error: 'Invalid QR code format',
      payload: null,
    };
  }

  if (!payload.registrationId) {
    return {
      isValid: false,
      error: 'Missing registration ID',
      payload,
    };
  }

  if (payload.eventId !== currentEventId) {
    return {
      isValid: false,
      error: 'QR code is for a different event',
      payload,
    };
  }

  return {
    isValid: true,
    error: null,
    payload,
  };
};

/**
 * Records a check-in for an attendee
 * @param {Object} checkIn - Check-in data {registrationId, timestamp, scannedBy}
 * @returns {Object} Recorded check-in with ID
 */
export const recordCheckIn = (checkIn) => {
  if (!checkIn.registrationId) {
    throw new Error('Registration ID is required for check-in');
  }

  return {
    id: `checkin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    registrationId: checkIn.registrationId,
    timestamp: checkIn.timestamp || new Date().toISOString(),
    scannedBy: checkIn.scannedBy || 'system',
    status: 'completed',
  };
};

/**
 * Computes check-in statistics
 * @param {Array} registrations - All registrations for the event
 * @param {Array} checkIns - All check-ins recorded
 * @returns {Object} Statistics {totalRegistrations, checkedIn, notCheckedIn, checkInRate, recentCheckIns}
 */
export const computeCheckInStats = (registrations = [], checkIns = []) => {
  const totalRegistrations = registrations.length;
  const activeRegistrations = registrations.filter((r) => r.status !== 'cancelled');
  const activeRegistrationsCount = activeRegistrations.length;

  // Count only check-ins that reference an active (non-cancelled) registration,
  // so stale offline replay, cancelled-then-rescanned tickets, or check-ins
  // synced from another event cannot make the counts negative or exceed 100%.
  const activeIds = new Set(activeRegistrations.map((r) => r.id));
  const checkedIn = [...new Set(checkIns.map((c) => c.registrationId))]
    .filter((id) => activeIds.has(id)).length;
  const notCheckedIn = activeRegistrationsCount - checkedIn;

  // Calculate check-in rate
  const checkInRate =
    activeRegistrationsCount > 0
      ? Math.round((checkedIn / activeRegistrationsCount) * 10000) / 100
      : 0;

  // Get recent check-ins (last 10) — sort a copy so the caller's array is not mutated
  const recentCheckIns = [...checkIns]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10)
    .map((c) => {
      const reg = registrations.find((r) => r.id === c.registrationId);
      return {
        ...c,
        attendeeName: reg?.name || 'Unknown',
        attendeeEmail: reg?.email || 'unknown@example.com',
      };
    });

  return {
    totalRegistrations,
    activeRegistrations: activeRegistrationsCount,
    checkedIn,
    notCheckedIn,
    checkInRate,
    recentCheckIns,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Checks if an attendee has already been checked in
 * @param {string} registrationId - Registration ID
 * @param {Array} checkIns - Array of check-ins
 * @returns {boolean} True if already checked in
 */
export const hasBeenCheckedIn = (registrationId, checkIns = []) => {
  return checkIns.some((c) => c.registrationId === registrationId);
};

/**
 * Gets check-in history for an attendee
 * @param {string} registrationId - Registration ID
 * @param {Array} checkIns - Array of check-ins
 * @returns {Array} Check-in records for this attendee
 */
export const getCheckInHistory = (registrationId, checkIns = []) => {
  return checkIns
    .filter((c) => c.registrationId === registrationId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

/**
 * Gets check-in statistics by session (for multi-track events)
 * @param {Array} sessions - Array of sessions
 * @param {Array} attendanceLogs - Attendance logs with sessionId and registrationId
 * @param {Array} checkIns - Check-in records
 * @returns {Object} Session-wise check-in statistics
 */
export const computeSessionCheckInStats = (sessions = [], attendanceLogs = [], checkIns = []) => {
  const checkedInIds = new Set(checkIns.map((c) => c.registrationId));
  const sessionStats = {};

  sessions.forEach((session) => {
    const sessionAttendees = attendanceLogs.filter((a) => a.sessionId === session.id);
    const sessionCheckedIn = sessionAttendees.filter((a) => checkedInIds.has(a.registrationId));

    const checkInRate =
      sessionAttendees.length > 0
        ? Math.round((sessionCheckedIn.length / sessionAttendees.length) * 10000) / 100
        : 0;

    sessionStats[session.id] = {
      sessionName: session.name,
      sessionTrack: session.track,
      totalAttendees: sessionAttendees.length,
      checkedIn: sessionCheckedIn.length,
      notCheckedIn: sessionAttendees.length - sessionCheckedIn.length,
      checkInRate,
    };
  });

  return sessionStats;
};

/**
 * Computes group-specific check-in statistics
 * @param {Array} registrations - All registrations for the event
 * @param {Array} checkIns - All check-ins recorded
 * @returns {Object} Group statistics {totalGroups, fullyCheckedInGroups, partiallyCheckedInGroups, groupCheckInRate}
 */
export const computeGroupCheckInStats = (registrations = [], checkIns = []) => {
  const checkedInIds = new Set(checkIns.map((c) => c.registrationId));
  
  // Group registrations by groupId
  const groups = {};
  registrations.forEach((reg) => {
    if (reg.groupId) {
      if (!groups[reg.groupId]) {
        groups[reg.groupId] = [];
      }
      groups[reg.groupId].push(reg);
    }
  });

  const totalGroups = Object.keys(groups).length;
  
  if (totalGroups === 0) {
    return {
      totalGroups: 0,
      fullyCheckedInGroups: 0,
      partiallyCheckedInGroups: 0,
      groupCheckInRate: 0,
      groups,
    };
  }

  let fullyCheckedInGroups = 0;
  let partiallyCheckedInGroups = 0;

  Object.values(groups).forEach((groupMembers) => {
    const allCheckedIn = groupMembers.every((m) => checkedInIds.has(m.id));
    const someCheckedIn = groupMembers.some((m) => checkedInIds.has(m.id));

    if (allCheckedIn) {
      fullyCheckedInGroups++;
    } else if (someCheckedIn) {
      partiallyCheckedInGroups++;
    }
  });

  const groupCheckInRate = totalGroups > 0
    ? Math.round(((fullyCheckedInGroups + partiallyCheckedInGroups) / totalGroups) * 10000) / 100
    : 0;

  return {
    totalGroups,
    fullyCheckedInGroups,
    partiallyCheckedInGroups,
    groupCheckInRate,
    groups,
  };
};

/**
 * Exports check-in data as CSV
 * @param {Object} stats - Check-in statistics from computeCheckInStats
 * @param {Array} registrations - All registrations
 * @param {Array} checkIns - All check-ins
 * @returns {string} CSV content
 */
export const generateCheckInCSV = (stats, registrations = [], checkIns = []) => {
  let csv = 'Event Check-In Report\n\n';

  // Summary section
  csv += 'CHECK-IN SUMMARY\n';
  csv += 'Metric,Value\n';
  csv += `Total Registrations,${stats.totalRegistrations}\n`;
  csv += `Active Registrations,${stats.activeRegistrations}\n`;
  csv += `Checked In,${stats.checkedIn}\n`;
  csv += `Not Checked In,${stats.notCheckedIn}\n`;
  csv += `Check-In Rate,${stats.checkInRate}%\n`;
  csv += `Report Generated,${stats.timestamp}\n\n`;

  // Detailed check-ins
  csv += 'DETAILED CHECK-INS\n';
  csv += 'Registration ID,Attendee Name,Email,Check-In Time,Scanned By\n';
  checkIns.forEach((checkIn) => {
    const reg = registrations.find((r) => r.id === checkIn.registrationId);
    const name = (reg?.name || 'Unknown').replace(/,/g, ' ');
    const email = (reg?.email || 'unknown@example.com').replace(/,/g, ' ');
    const time = new Date(checkIn.timestamp).toLocaleString();
    csv += `${checkIn.registrationId},${name},${email},${time},${checkIn.scannedBy}\n`;
  });

  return csv;
};

/**
 * Exports check-in data as CSV file
 * @param {Object} stats - Check-in statistics
 * @param {Array} registrations - All registrations
 * @param {Array} checkIns - All check-ins
 * @param {string} eventName - Event name for filename
 */
export const exportCheckInAsCSV = (stats, registrations, checkIns, eventName = 'event') => {
  const csv = generateCheckInCSV(stats, registrations, checkIns);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `${eventName}-check-ins-${new Date().toISOString().split('T')[0]}.csv`
  );
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Checks if a registration is part of a group
 * @param {Object} registration - Registration object
 * @returns {boolean} True if this is a group registration
 */
export const isGroupRegistration = (registration) => {
  return !!(registration && (registration.groupId || registration.isGroupPrimary));
};

/**
 * Gets the group ID from a registration
 * @param {Object} registration - Registration object
 * @returns {string|null} Group ID or null if not part of a group
 */
export const getGroupIdFromRegistration = (registration) => {
  return registration?.groupId || null;
};

/**
 * Finds all registrations in the same group
 * @param {string} groupId - The group ID to search for
 * @param {Array} registrations - All registrations for the event
 * @returns {Array} All registrations that belong to this group
 */
export const getGroupMembers = (groupId, registrations = []) => {
  if (!groupId) return [];
  return registrations.filter((reg) => reg.groupId === groupId);
};

/**
 * Finds the primary buyer for a group
 * @param {Array} groupMembers - Array of group member registrations
 * @returns {Object|null} The primary buyer's registration or null
 */
export const getGroupPrimary = (groupMembers = []) => {
  return groupMembers.find((reg) => reg.isGroupPrimary) || groupMembers[0] || null;
};

/**
 * Checks if all members of a group are already checked in
 * @param {Array} groupMembers - Array of group member registrations
 * @param {Array} checkIns - All check-ins
 * @returns {boolean} True if all group members are checked in
 */
export const isEntireGroupCheckedIn = (groupMembers = [], checkIns = []) => {
  const checkedInIds = new Set(checkIns.map((c) => c.registrationId));
  return groupMembers.every((member) => checkedInIds.has(member.id));
};

/**
 * Gets the group name from a registration or group members
 * @param {Object|Array} registrationOrGroup - Registration object or array of group members
 * @returns {string} Group name or a default name
 */
export const getGroupName = (registrationOrGroup) => {
  if (Array.isArray(registrationOrGroup)) {
    const primary = getGroupPrimary(registrationOrGroup);
    return primary?.groupName || `Group of ${registrationOrGroup.length}`;
  }
  return registrationOrGroup?.groupName || 'Group';
};

/**
 * Records check-ins for multiple group members at once
 * @param {Array} groupMembers - Array of group member registrations
 * @param {string} scannedBy - Who performed the check-in
 * @param {Array} existingCheckIns - Existing check-ins to avoid duplicates
 * @returns {Array} Array of new check-in records
 */
export const recordGroupCheckIns = (groupMembers = [], scannedBy = 'group-check-in', existingCheckIns = []) => {
  const existingIds = new Set(existingCheckIns.map((c) => c.registrationId));
  const timestamp = new Date().toISOString();

  return groupMembers
    .filter((member) => !existingIds.has(member.id))
    .map((member) => ({
      id: `checkin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      registrationId: member.id,
      timestamp,
      scannedBy,
      status: 'completed',
      groupId: member.groupId,
      groupName: member.groupName,
      isGroupCheckIn: true,
    }));
};
