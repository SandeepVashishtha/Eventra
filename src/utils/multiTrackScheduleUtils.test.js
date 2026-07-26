import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  detectSessionConflicts,
  hasTimeOverlap,
  calculateOverlapMinutes,
  autoAssignSessionsToTracks,
  getAvailableTimeSlots,
  calculateTrackUtilization,
  generateScheduleSummary,
  validateScheduleIntegrity,
} from './multiTrackScheduleUtils.js';

describe('multiTrackScheduleUtils', () => {
  const eventStart = new Date('2024-01-15T08:00:00Z').toISOString();
  const eventEnd = new Date('2024-01-15T18:00:00Z').toISOString();

  const mockTracks = [
    { id: 'track-1', name: 'Main Hall', description: 'Primary track', capacity: 'unlimited' },
    { id: 'track-2', name: 'Room A', description: 'Secondary track', capacity: 'unlimited' },
  ];

  const mockSessions = [
    {
      id: 'session-1',
      title: 'Keynote',
      startTime: new Date('2024-01-15T09:00:00Z').toISOString(),
      endTime: new Date('2024-01-15T10:00:00Z').toISOString(),
      trackId: 'track-1',
      speaker: 'Speaker A',
      speakerId: 'speaker-1',
      capacity: 100,
      attendeeIds: ['attendee-1', 'attendee-2'],
      description: 'Opening keynote',
    },
    {
      id: 'session-2',
      title: 'Workshop',
      startTime: new Date('2024-01-15T10:30:00Z').toISOString(),
      endTime: new Date('2024-01-15T11:30:00Z').toISOString(),
      trackId: 'track-1',
      speaker: 'Speaker B',
      speakerId: 'speaker-2',
      capacity: 50,
      attendeeIds: ['attendee-1'],
      description: 'Technical workshop',
    },
    {
      id: 'session-3',
      title: 'Panel Discussion',
      startTime: new Date('2024-01-15T10:00:00Z').toISOString(),
      endTime: new Date('2024-01-15T11:00:00Z').toISOString(),
      trackId: 'track-2',
      speaker: 'Speaker C',
      speakerId: 'speaker-3',
      capacity: 75,
      attendeeIds: ['attendee-3'],
      description: 'Panel discussion',
    },
  ];

  describe('hasTimeOverlap', () => {
    it('should detect overlapping sessions', () => {
      const session1 = {
        startTime: new Date('2024-01-15T09:00:00Z').toISOString(),
        endTime: new Date('2024-01-15T10:00:00Z').toISOString(),
      };
      const session2 = {
        startTime: new Date('2024-01-15T09:30:00Z').toISOString(),
        endTime: new Date('2024-01-15T10:30:00Z').toISOString(),
      };

      assert.strictEqual(hasTimeOverlap(session1, session2), true);
    });

    it('should not detect overlap for non-overlapping sessions', () => {
      const session1 = {
        startTime: new Date('2024-01-15T09:00:00Z').toISOString(),
        endTime: new Date('2024-01-15T10:00:00Z').toISOString(),
      };
      const session2 = {
        startTime: new Date('2024-01-15T10:00:00Z').toISOString(),
        endTime: new Date('2024-01-15T11:00:00Z').toISOString(),
      };

      assert.strictEqual(hasTimeOverlap(session1, session2), false);
    });

    it('should detect full overlap', () => {
      const session1 = {
        startTime: new Date('2024-01-15T09:00:00Z').toISOString(),
        endTime: new Date('2024-01-15T11:00:00Z').toISOString(),
      };
      const session2 = {
        startTime: new Date('2024-01-15T09:30:00Z').toISOString(),
        endTime: new Date('2024-01-15T10:30:00Z').toISOString(),
      };

      assert.strictEqual(hasTimeOverlap(session1, session2), true);
    });
  });

  describe('calculateOverlapMinutes', () => {
    it('should calculate overlap duration correctly', () => {
      const session1 = {
        startTime: new Date('2024-01-15T09:00:00Z').toISOString(),
        endTime: new Date('2024-01-15T10:00:00Z').toISOString(),
      };
      const session2 = {
        startTime: new Date('2024-01-15T09:30:00Z').toISOString(),
        endTime: new Date('2024-01-15T10:30:00Z').toISOString(),
      };

      assert.strictEqual(calculateOverlapMinutes(session1, session2), 30);
    });

    it('should return 0 for non-overlapping sessions', () => {
      const session1 = {
        startTime: new Date('2024-01-15T09:00:00Z').toISOString(),
        endTime: new Date('2024-01-15T10:00:00Z').toISOString(),
      };
      const session2 = {
        startTime: new Date('2024-01-15T11:00:00Z').toISOString(),
        endTime: new Date('2024-01-15T12:00:00Z').toISOString(),
      };

      assert.strictEqual(calculateOverlapMinutes(session1, session2), 0);
    });

    it('should calculate full overlap correctly', () => {
      const session1 = {
        startTime: new Date('2024-01-15T09:00:00Z').toISOString(),
        endTime: new Date('2024-01-15T11:00:00Z').toISOString(),
      };
      const session2 = {
        startTime: new Date('2024-01-15T09:30:00Z').toISOString(),
        endTime: new Date('2024-01-15T10:30:00Z').toISOString(),
      };

      assert.strictEqual(calculateOverlapMinutes(session1, session2), 60);
    });
  });

  describe('detectSessionConflicts', () => {
    it('should detect track conflicts', () => {
      const conflictingSessions = [
        {
          id: 'session-1',
          title: 'Session 1',
          startTime: new Date('2024-01-15T09:00:00Z').toISOString(),
          endTime: new Date('2024-01-15T10:00:00Z').toISOString(),
          trackId: 'track-1',
        },
        {
          id: 'session-2',
          title: 'Session 2',
          startTime: new Date('2024-01-15T09:30:00Z').toISOString(),
          endTime: new Date('2024-01-15T10:30:00Z').toISOString(),
          trackId: 'track-1',
        },
      ];

      const result = detectSessionConflicts(conflictingSessions, mockTracks);

      assert.strictEqual(result.hasConflicts, true);
      assert.strictEqual(result.conflicts.some(c => c.type === 'TRACK_CONFLICT'), true);
    });

    it('should detect speaker conflicts', () => {
      const conflictingSessions = [
        {
          id: 'session-1',
          title: 'Session 1',
          startTime: new Date('2024-01-15T09:00:00Z').toISOString(),
          endTime: new Date('2024-01-15T10:00:00Z').toISOString(),
          trackId: 'track-1',
          speakerId: 'speaker-1',
        },
        {
          id: 'session-2',
          title: 'Session 2',
          startTime: new Date('2024-01-15T09:30:00Z').toISOString(),
          endTime: new Date('2024-01-15T10:30:00Z').toISOString(),
          trackId: 'track-2',
          speakerId: 'speaker-1',
        },
      ];

      const result = detectSessionConflicts(conflictingSessions, mockTracks);

      assert.strictEqual(result.hasConflicts, true);
      assert.strictEqual(result.conflicts.some(c => c.type === 'SPEAKER_CONFLICT'), true);
    });

    it('should not flag conflicts for non-overlapping sessions', () => {
      const noConflictSessions = [
        {
          id: 'session-1',
          title: 'Session 1',
          startTime: new Date('2024-01-15T09:00:00Z').toISOString(),
          endTime: new Date('2024-01-15T10:00:00Z').toISOString(),
          trackId: 'track-1',
        },
        {
          id: 'session-2',
          title: 'Session 2',
          startTime: new Date('2024-01-15T10:00:00Z').toISOString(),
          endTime: new Date('2024-01-15T11:00:00Z').toISOString(),
          trackId: 'track-1',
        },
      ];

      const result = detectSessionConflicts(noConflictSessions, mockTracks);

      assert.strictEqual(result.hasConflicts, false);
      assert.strictEqual(result.conflictCount, 0);
    });
  });

  describe('autoAssignSessionsToTracks', () => {
    it('should assign unassigned sessions to tracks', () => {
      const unassignedSessions = [
        {
          id: 'session-1',
          title: 'Session 1',
          startTime: new Date('2024-01-15T09:00:00Z').toISOString(),
          endTime: new Date('2024-01-15T10:00:00Z').toISOString(),
          trackId: null,
        },
        {
          id: 'session-2',
          title: 'Session 2',
          startTime: new Date('2024-01-15T11:00:00Z').toISOString(),
          endTime: new Date('2024-01-15T12:00:00Z').toISOString(),
          trackId: null,
        },
      ];

      const result = autoAssignSessionsToTracks(unassignedSessions, mockTracks);

      assert.strictEqual(result.every(s => s.trackId), true);
      assert.strictEqual(result.some(s => s.trackId === 'track-1'), true);
    });

    it('should avoid track conflicts when auto-assigning', () => {
      const sessions = [
        {
          id: 'session-1',
          title: 'Session 1',
          startTime: new Date('2024-01-15T09:00:00Z').toISOString(),
          endTime: new Date('2024-01-15T10:00:00Z').toISOString(),
          trackId: 'track-1',
        },
        {
          id: 'session-2',
          title: 'Session 2',
          startTime: new Date('2024-01-15T09:30:00Z').toISOString(),
          endTime: new Date('2024-01-15T10:30:00Z').toISOString(),
          trackId: null,
        },
      ];

      const result = autoAssignSessionsToTracks(sessions, mockTracks);

      // Session 2 should be assigned to track-2 to avoid conflict with session-1
      const session2 = result.find(s => s.id === 'session-2');
      assert.strictEqual(session2.trackId, 'track-2');
    });
  });

  describe('getAvailableTimeSlots', () => {
    it('should generate time slots correctly', () => {
      const slots = getAvailableTimeSlots(
        eventStart,
        new Date('2024-01-15T12:00:00Z').toISOString(),
        60,
        'track-1',
        []
      );

      assert.ok(slots.length > 0);
      assert.ok(slots[0].startTime !== undefined);
      assert.ok(slots[0].endTime !== undefined);
      assert.strictEqual(slots[0].available, true);
    });

    it('should exclude occupied slots', () => {
      const occupiedSlots = [
        {
          trackId: 'track-1',
          startTime: new Date('2024-01-15T09:00:00Z').toISOString(),
          endTime: new Date('2024-01-15T10:00:00Z').toISOString(),
        },
      ];

      const slots = getAvailableTimeSlots(
        eventStart,
        new Date('2024-01-15T11:00:00Z').toISOString(),
        60,
        'track-1',
        occupiedSlots
      );

      const allValid = slots.every(s => {
        const slotStart = new Date(s.startTime);
        const occupiedStart = new Date(occupiedSlots[0].startTime);
        const occupiedEnd = new Date(occupiedSlots[0].endTime);
        return slotStart.getTime() >= occupiedEnd.getTime() || slotStart.getTime() < occupiedStart.getTime();
      });
      assert.strictEqual(allValid, true);
    });
  });

  describe('calculateTrackUtilization', () => {
    it('should calculate utilization correctly', () => {
      const result = calculateTrackUtilization(mockSessions, mockTracks, eventStart, eventEnd);

      assert.ok((result)['trackUtilization'] !== undefined);
      assert.ok((result)['overallUtilization'] !== undefined);
      assert.ok((result)['totalSessionMinutes'] !== undefined);
    });

    it('should show per-track utilization', () => {
      const result = calculateTrackUtilization(mockSessions, mockTracks, eventStart, eventEnd);

      assert.ok((result.trackUtilization['track-1']) !== undefined);
      assert.ok((result.trackUtilization['track-2']) !== undefined);
      assert.ok((result.trackUtilization['track-1'])['utilization'] !== undefined);
      assert.ok((result.trackUtilization['track-1'])['sessionCount'] !== undefined);
    });
  });

  describe('generateScheduleSummary', () => {
    it('should generate summary organized by track', () => {
      const result = generateScheduleSummary(mockSessions, mockTracks);

      assert.strictEqual(Object.keys(result).length, 2);
      assert.ok((result['track-1']) !== undefined);
      assert.ok((result['track-2']) !== undefined);
    });

    it('should sort sessions by start time', () => {
      const result = generateScheduleSummary(mockSessions, mockTracks);
      const track1Sessions = result['track-1'].sessions;

      for (let i = 0; i < track1Sessions.length - 1; i++) {
        const current = new Date(track1Sessions[i].startTime);
        const next = new Date(track1Sessions[i + 1].startTime);
        assert.ok((current.getTime()) <= (next.getTime()));
      }
    });
  });

  describe('validateScheduleIntegrity', () => {
    it('should validate a valid schedule', () => {
      const result = validateScheduleIntegrity(mockSessions, mockTracks);

      assert.ok((result)['isValid'] !== undefined);
      assert.ok((result)['issues'] !== undefined);
      assert.ok((result)['warnings'] !== undefined);
    });

    it('should detect unassigned sessions', () => {
      const unassignedSessions = [
        ...mockSessions,
        {
          id: 'session-4',
          title: 'Unassigned Session',
          startTime: eventStart,
          endTime: new Date('2024-01-15T12:00:00Z').toISOString(),
          trackId: null,
        },
      ];

      const result = validateScheduleIntegrity(unassignedSessions, mockTracks);

      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.issues.some(i => i.includes('not assigned')), true);
    });

    it('should detect sessions on non-existent tracks', () => {
      const invalidSessions = [
        {
          id: 'session-1',
          title: 'Session 1',
          startTime: eventStart,
          endTime: new Date('2024-01-15T10:00:00Z').toISOString(),
          trackId: 'non-existent-track',
        },
      ];

      const result = validateScheduleIntegrity(invalidSessions, mockTracks);

      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.issues.some(i => i.includes('non-existent track')), true);
    });

    it('should warn about empty tracks', () => {
      const result = validateScheduleIntegrity([mockSessions[0]], mockTracks);

      assert.strictEqual(result.warnings.some(w => w.includes('no sessions')), true);
    });
  });
});
