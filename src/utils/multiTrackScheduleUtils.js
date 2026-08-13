/**
 * Multi-Track Event Schedule Builder Utilities
 * Handles conflict detection, session assignment, and schedule management
 */

/**
 * Detect conflicts between sessions in a schedule
 * @param {Array} sessions - Array of session objects with startTime and endTime
 * @param {Array} tracks - Array of available tracks
 * @returns {Object} Conflict detection results
 */
export const detectSessionConflicts = (sessions, tracks = []) => {
  const conflicts = [];
  const sessionsByTrack = new Map();

  // Initialize tracks map
  tracks.forEach(track => {
    sessionsByTrack.set(track.id, []);
  });

  // Group sessions by track
  sessions.forEach(session => {
    if (session.trackId) {
      const trackSessions = sessionsByTrack.get(session.trackId) || [];
      trackSessions.push(session);
      sessionsByTrack.set(session.trackId, trackSessions);
    }
  });

  // Check for overlaps within each track
  sessionsByTrack.forEach((trackSessions, trackId) => {
    for (let i = 0; i < trackSessions.length; i++) {
      for (let j = i + 1; j < trackSessions.length; j++) {
        const session1 = trackSessions[i];
        const session2 = trackSessions[j];

        if (hasTimeOverlap(session1, session2)) {
          conflicts.push({
            type: 'TRACK_CONFLICT',
            severity: 'HIGH',
            session1Id: session1.id,
            session2Id: session2.id,
            trackId,
            message: `Sessions "${session1.title}" and "${session2.title}" overlap on track "${trackId}"`,
            overlapMinutes: calculateOverlapMinutes(session1, session2),
          });
        }
      }
    }
  });

  // Check for speaker conflicts across tracks
  const speakerSchedule = new Map();
  sessions.forEach(session => {
    if (session.speakerId) {
      if (!speakerSchedule.has(session.speakerId)) {
        speakerSchedule.set(session.speakerId, []);
      }
      speakerSchedule.get(session.speakerId).push(session);
    }
  });

  speakerSchedule.forEach((speakerSessions, speakerId) => {
    for (let i = 0; i < speakerSessions.length; i++) {
      for (let j = i + 1; j < speakerSessions.length; j++) {
        const session1 = speakerSessions[i];
        const session2 = speakerSessions[j];

        if (hasTimeOverlap(session1, session2)) {
          conflicts.push({
            type: 'SPEAKER_CONFLICT',
            severity: 'HIGH',
            session1Id: session1.id,
            session2Id: session2.id,
            speakerId,
            message: `Speaker has conflicting sessions: "${session1.title}" and "${session2.title}"`,
            overlapMinutes: calculateOverlapMinutes(session1, session2),
          });
        }
      }
    }
  });

  // Check for attendee conflicts across tracks
  const attendeeConflicts = detectAttendeeConflicts(sessions);
  conflicts.push(...attendeeConflicts);

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
    conflictCount: conflicts.length,
    highSeverityCount: conflicts.filter(c => c.severity === 'HIGH').length,
    warningCount: conflicts.filter(c => c.severity === 'WARNING').length,
  };
};

/**
 * Detect conflicts for attendees across tracks
 * @param {Array} sessions - Array of session objects
 * @returns {Array} Array of attendee conflicts
 */
const detectAttendeeConflicts = (sessions) => {
  const conflicts = [];
  const attendeeSchedule = new Map();

  // Build attendee schedule
  sessions.forEach(session => {
    if (session.attendeeIds && Array.isArray(session.attendeeIds)) {
      session.attendeeIds.forEach(attendeeId => {
        if (!attendeeSchedule.has(attendeeId)) {
          attendeeSchedule.set(attendeeId, []);
        }
        attendeeSchedule.get(attendeeId).push(session);
      });
    }
  });

  // Check for overlaps per attendee
  attendeeSchedule.forEach((attendeeSessions, attendeeId) => {
    for (let i = 0; i < attendeeSessions.length; i++) {
      for (let j = i + 1; j < attendeeSessions.length; j++) {
        const session1 = attendeeSessions[i];
        const session2 = attendeeSessions[j];

        if (hasTimeOverlap(session1, session2)) {
          conflicts.push({
            type: 'ATTENDEE_CONFLICT',
            severity: 'WARNING',
            session1Id: session1.id,
            session2Id: session2.id,
            attendeeId,
            message: `Attendee registered for overlapping sessions: "${session1.title}" and "${session2.title}"`,
            overlapMinutes: calculateOverlapMinutes(session1, session2),
          });
        }
      }
    }
  });

  return conflicts;
};

/**
 * Check if two sessions have time overlap
 * @param {Object} session1 - First session
 * @param {Object} session2 - Second session
 * @returns {boolean} True if sessions overlap
 */
export const hasTimeOverlap = (session1, session2) => {
  const start1 = new Date(session1.startTime).getTime();
  const end1 = new Date(session1.endTime).getTime();
  const start2 = new Date(session2.startTime).getTime();
  const end2 = new Date(session2.endTime).getTime();

  return start1 < end2 && start2 < end1;
};

/**
 * Calculate overlap duration between two sessions
 * @param {Object} session1 - First session
 * @param {Object} session2 - Second session
 * @returns {number} Overlap duration in minutes
 */
export const calculateOverlapMinutes = (session1, session2) => {
  const start1 = new Date(session1.startTime).getTime();
  const end1 = new Date(session1.endTime).getTime();
  const start2 = new Date(session2.startTime).getTime();
  const end2 = new Date(session2.endTime).getTime();

  const overlapStart = Math.max(start1, start2);
  const overlapEnd = Math.min(end1, end2);

  if (overlapEnd <= overlapStart) return 0;

  return Math.round((overlapEnd - overlapStart) / (1000 * 60));
};

/**
 * Auto-assign sessions to tracks using a greedy algorithm
 * @param {Array} sessions - Unassigned sessions
 * @param {Array} tracks - Available tracks
 * @returns {Array} Sessions with assigned tracks
 */
export const autoAssignSessionsToTracks = (sessions, tracks) => {
  const assignedSessions = sessions.map(session => ({ ...session }));
  const trackOccupancy = new Map();

  // Initialize track occupancy
  tracks.forEach(track => {
    trackOccupancy.set(track.id, []);
  });

  // Sort sessions by duration (longest first) for better packing
  assignedSessions.sort((a, b) => {
    const durationA = new Date(a.endTime) - new Date(a.startTime);
    const durationB = new Date(b.endTime) - new Date(b.startTime);
    return durationB - durationA;
  });

  // Assign each session to the best available track
  assignedSessions.forEach(session => {
    const bestTrack = findBestAvailableTrack(session, tracks, trackOccupancy);
    if (bestTrack) {
      session.trackId = bestTrack.id;
      const occupancy = trackOccupancy.get(bestTrack.id) || [];
      occupancy.push(session);
      trackOccupancy.set(bestTrack.id, occupancy);
    }
  });

  return assignedSessions;
};

/**
 * Find the best available track for a session
 * @param {Object} session - Session to assign
 * @param {Array} tracks - Available tracks
 * @param {Map} trackOccupancy - Current track occupancy
 * @returns {Object} Best available track or null
 */
const findBestAvailableTrack = (session, tracks, trackOccupancy) => {
  for (const track of tracks) {
    const trackSessions = trackOccupancy.get(track.id) || [];
    const hasConflict = trackSessions.some(s => hasTimeOverlap(s, session));

    if (!hasConflict) {
      return track;
    }
  }

  // If all tracks have conflicts, return the track with fewest sessions
  let leastOccupiedTrack = null;
  let minSessions = Infinity;

  tracks.forEach(track => {
    const trackSessions = trackOccupancy.get(track.id) || [];
    if (trackSessions.length < minSessions) {
      minSessions = trackSessions.length;
      leastOccupiedTrack = track;
    }
  });

  return leastOccupiedTrack;
};

/**
 * Get available time slots for a session in a track
 * @param {Date} startDate - Event start date
 * @param {Date} endDate - Event end date
 * @param {number} slotDurationMinutes - Duration of each slot
 * @param {string} trackId - Track ID
 * @param {Array} occupiedSlots - Already occupied time slots
 * @returns {Array} Available time slots
 */
export const getAvailableTimeSlots = (
  startDate,
  endDate,
  slotDurationMinutes = 60,
  trackId,
  occupiedSlots = []
) => {
  const slots = [];
  let currentTime = new Date(startDate);
  const endTime = new Date(endDate);

  while (currentTime < endTime) {
    const slotStart = new Date(currentTime);
    const slotEnd = new Date(currentTime.getTime() + slotDurationMinutes * 60 * 1000);

    if (slotEnd > endTime) break;

    const isOccupied = occupiedSlots.some(slot => {
      if (slot.trackId !== trackId) return false;
      const occupiedStart = new Date(slot.startTime);
      const occupiedEnd = new Date(slot.endTime);
      return slotStart < occupiedEnd && slotEnd > occupiedStart;
    });

    if (!isOccupied) {
      slots.push({
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        trackId,
        available: true,
      });
    }

    currentTime = new Date(currentTime.getTime() + slotDurationMinutes * 60 * 1000);
  }

  return slots;
};

/**
 * Calculate track utilization
 * @param {Array} sessions - Sessions assigned to tracks
 * @param {Array} tracks - Available tracks
 * @param {Date} eventStart - Event start date
 * @param {Date} eventEnd - Event end date
 * @returns {Object} Utilization statistics
 */
export const calculateTrackUtilization = (sessions, tracks, eventStart, eventEnd) => {
  const trackUtilization = {};
  const totalEventMinutes = (new Date(eventEnd) - new Date(eventStart)) / (1000 * 60);
  let totalUsedMinutes = 0;

  tracks.forEach(track => {
    const trackSessions = sessions.filter(s => s.trackId === track.id);
    let usedMinutes = 0;

    trackSessions.forEach(session => {
      const duration = (new Date(session.endTime) - new Date(session.startTime)) / (1000 * 60);
      usedMinutes += duration;
    });

    trackUtilization[track.id] = {
      trackName: track.name,
      usedMinutes,
      totalMinutes: totalEventMinutes,
      utilization: ((usedMinutes / totalEventMinutes) * 100).toFixed(2) + '%',
      sessionCount: trackSessions.length,
    };

    totalUsedMinutes += usedMinutes;
  });

  return {
    trackUtilization,
    overallUtilization: ((totalUsedMinutes / (totalEventMinutes * tracks.length)) * 100).toFixed(2) + '%',
    totalSessionMinutes: totalUsedMinutes,
    averageUtilization: (totalUsedMinutes / (totalEventMinutes * tracks.length)).toFixed(2),
  };
};

/**
 * Generate schedule summary by track
 * @param {Array} sessions - All sessions
 * @param {Array} tracks - All tracks
 * @returns {Object} Schedule summary organized by track
 */
export const generateScheduleSummary = (sessions, tracks) => {
  const summary = {};

  tracks.forEach(track => {
    const trackSessions = sessions
      .filter(s => s.trackId === track.id)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    summary[track.id] = {
      trackName: track.name,
      trackDescription: track.description,
      sessionCount: trackSessions.length,
      sessions: trackSessions.map(s => ({
        id: s.id,
        title: s.title,
        startTime: s.startTime,
        endTime: s.endTime,
        speaker: s.speaker,
        capacity: s.capacity,
        registered: s.attendeeIds?.length || 0,
      })),
    };
  });

  return summary;
};

/**
 * Validate schedule integrity
 * @param {Array} sessions - Sessions to validate
 * @param {Array} tracks - Available tracks
 * @returns {Object} Validation results
 */
export const validateScheduleIntegrity = (sessions, tracks) => {
  const issues = [];
  const warnings = [];

  // Check for unassigned sessions
  const unassignedSessions = sessions.filter(s => !s.trackId);
  if (unassignedSessions.length > 0) {
    issues.push(`${unassignedSessions.length} session(s) are not assigned to any track`);
  }

  // Check for sessions on non-existent tracks
  const validTrackIds = new Set(tracks.map(t => t.id));
  sessions.forEach(session => {
    if (session.trackId && !validTrackIds.has(session.trackId)) {
      issues.push(`Session "${session.title}" is assigned to non-existent track "${session.trackId}"`);
    }
  });

  // Check for empty tracks
  const usedTrackIds = new Set(sessions.map(s => s.trackId).filter(Boolean));
  const emptyTracks = tracks.filter(t => !usedTrackIds.has(t.id));
  if (emptyTracks.length > 0) {
    warnings.push(`${emptyTracks.length} track(s) have no sessions assigned`);
  }

  // Check for conflicting sessions (using conflict detection)
  const conflicts = detectSessionConflicts(sessions, tracks);
  if (conflicts.hasConflicts) {
    issues.push(`Found ${conflicts.conflictCount} scheduling conflict(s)`);
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
    totalIssues: issues.length,
    totalWarnings: warnings.length,
  };
};
