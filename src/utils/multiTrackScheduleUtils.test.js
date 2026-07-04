/**
 * Tests for Multi-Track Schedule Builder Utilities
 */

import {
  detectSessionConflicts,
  hasTimeOverlap,
  calculateOverlapMinutes,
  autoAssignSessionsToTracks,
  getAvailableTimeSlots,
  calculateTrackUtilization,
  generateScheduleSummary,
  validateScheduleIntegrity,
} from './multiTrackScheduleUtils';

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

      expect(hasTimeOverlap(session1, session2)).toBe(true);
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

      expect(hasTimeOverlap(session1, session2)).toBe(false);
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

      expect(hasTimeOverlap(session1, session2)).toBe(true);
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

      expect(calculateOverlapMinutes(session1, session2)).toBe(30);
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

      expect(calculateOverlapMinutes(session1, session2)).toBe(0);
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

      expect(calculateOverlapMinutes(session1, session2)).toBe(60);
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

      expect(result.hasConflicts).toBe(true);
      expect(result.conflicts.some(c => c.type === 'TRACK_CONFLICT')).toBe(true);
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

      expect(result.hasConflicts).toBe(true);
      expect(result.conflicts.some(c => c.type === 'SPEAKER_CONFLICT')).toBe(true);
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

      expect(result.hasConflicts).toBe(false);
      expect(result.conflictCount).toBe(0);
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

      expect(result.every(s => s.trackId)).toBe(true);
      expect(result.some(s => s.trackId === 'track-1')).toBe(true);
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
      expect(session2.trackId).toBe('track-2');
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

      expect(slots.length).toBeGreaterThan(0);
      expect(slots[0]).toHaveProperty('startTime');
      expect(slots[0]).toHaveProperty('endTime');
      expect(slots[0]).toHaveProperty('available', true);
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

      expect(slots.every(s => {
        const slotStart = new Date(s.startTime);
        const occupiedStart = new Date(occupiedSlots[0].startTime);
        const occupiedEnd = new Date(occupiedSlots[0].endTime);
        return slotStart.getTime() >= occupiedEnd.getTime() || slotStart.getTime() < occupiedStart.getTime();
      })).toBe(true);
    });
  });

  describe('calculateTrackUtilization', () => {
    it('should calculate utilization correctly', () => {
      const result = calculateTrackUtilization(mockSessions, mockTracks, eventStart, eventEnd);

      expect(result).toHaveProperty('trackUtilization');
      expect(result).toHaveProperty('overallUtilization');
      expect(result).toHaveProperty('totalSessionMinutes');
    });

    it('should show per-track utilization', () => {
      const result = calculateTrackUtilization(mockSessions, mockTracks, eventStart, eventEnd);

      expect(result.trackUtilization['track-1']).toBeDefined();
      expect(result.trackUtilization['track-2']).toBeDefined();
      expect(result.trackUtilization['track-1']).toHaveProperty('utilization');
      expect(result.trackUtilization['track-1']).toHaveProperty('sessionCount');
    });
  });

  describe('generateScheduleSummary', () => {
    it('should generate summary organized by track', () => {
      const result = generateScheduleSummary(mockSessions, mockTracks);

      expect(Object.keys(result).length).toBe(2);
      expect(result['track-1']).toBeDefined();
      expect(result['track-2']).toBeDefined();
    });

    it('should sort sessions by start time', () => {
      const result = generateScheduleSummary(mockSessions, mockTracks);
      const track1Sessions = result['track-1'].sessions;

      for (let i = 0; i < track1Sessions.length - 1; i++) {
        const current = new Date(track1Sessions[i].startTime);
        const next = new Date(track1Sessions[i + 1].startTime);
        expect(current.getTime()).toBeLessThanOrEqual(next.getTime());
      }
    });
  });

  describe('validateScheduleIntegrity', () => {
    it('should validate a valid schedule', () => {
      const result = validateScheduleIntegrity(mockSessions, mockTracks);

      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('warnings');
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

      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.includes('not assigned'))).toBe(true);
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

      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.includes('non-existent track'))).toBe(true);
    });

    it('should warn about empty tracks', () => {
      const result = validateScheduleIntegrity([mockSessions[0]], mockTracks);

      expect(result.warnings.some(w => w.includes('no sessions'))).toBe(true);
    });
  });
});
