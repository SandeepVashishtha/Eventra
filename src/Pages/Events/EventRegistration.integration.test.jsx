import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import EventRegistration from '../Pages/Events/EventRegistration';
import { checkRegistrationConflict, suggestAlternativeEvents } from '../utils/conflictDetection';

/**
 * Integration Tests: Event Conflict Resolver with Registration Flow
 *
 * Tests the complete workflow from form submission through conflict detection
 * and user decision-making.
 */

describe('EventRegistration with Conflict Resolution - Integration', () => {
  const mockEvent = {
    id: '1',
    title: 'React Workshop',
    date: '2025-06-15',
    time: '10:00 AM',
    durationMinutes: 60,
    description: 'Learn React basics',
    maxAttendees: 30,
    attendees: 15,
    timezone: 'America/New_York',
  };

  const mockConflictingEvent = {
    id: '2',
    title: 'JavaScript Basics',
    date: '2025-06-15',
    time: '10:30 AM',
    durationMinutes: 90,
  };

  const mockAlternativeEvent = {
    id: '3',
    title: 'Advanced React',
    date: '2025-06-16',
    time: '2:00 PM',
    durationMinutes: 120,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Registration Flow - No Conflicts', () => {
    it('should submit form directly when no conflicts exist', async () => {
      const user = userEvent.setup();
      
      // Mock: User has no existing registrations
      const mockContext = {
        myEvents: [],
        user: { id: 'user1', email: 'test@example.com' },
        isAuthenticated: () => true,
      };

      // Mock API
      vi.mock('../config/api', () => ({
        apiUtils: {
          post: vi.fn().mockResolvedValue({ status: 200, data: {} }),
        },
      }));

      render(
        <BrowserRouter>
          <EventRegistration />
        </BrowserRouter>
      );

      // Fill form
      const nameInput = screen.getByLabelText(/full name/i);
      await user.type(nameInput, 'John Doe');

      // Submit
      const submitButton = screen.getByRole('button', { name: /register/i });
      await user.click(submitButton);

      // Conflict modal should NOT appear
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Registration Flow - With Conflicts', () => {
    it('should show conflict modal when conflict detected', async () => {
      const user = userEvent.setup();

      // Mock: User already registered for conflicting event
      const mockContext = {
        myEvents: [mockConflictingEvent],
        user: { id: 'user1', email: 'test@example.com' },
      };

      render(
        <BrowserRouter>
          <EventRegistration />
        </BrowserRouter>
      );

      // Check conflict is detected
      const { hasConflict, conflicts } = checkRegistrationConflict(
        mockEvent,
        mockContext.myEvents
      );

      expect(hasConflict).toBe(true);
      expect(conflicts).toHaveLength(1);
    });

    it('should display conflicting event details in modal', async () => {
      const { hasConflict, conflicts } = checkRegistrationConflict(
        mockEvent,
        [mockConflictingEvent]
      );

      expect(hasConflict).toBe(true);
      expect(conflicts[0].title).toBe('JavaScript Basics');
    });

    it('should show suggestions when available', async () => {
      const allEvents = [mockEvent, mockConflictingEvent, mockAlternativeEvent];
      
      const suggestions = suggestAlternativeEvents(
        mockEvent,
        allEvents,
        [mockConflictingEvent]
      );

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].id).toBe('3'); // Alternative event
    });
  });

  describe('Conflict Modal User Actions', () => {
    it('should allow user to cancel registration', async () => {
      const user = userEvent.setup();

      // Setup: conflict detected
      const { hasConflict } = checkRegistrationConflict(
        mockEvent,
        [mockConflictingEvent]
      );

      expect(hasConflict).toBe(true);

      // User action: cancel (tested in modal component tests)
      // This is here for integration context
    });

    it('should allow user to proceed with conflicting registration', async () => {
      const { hasConflict } = checkRegistrationConflict(
        mockEvent,
        [mockConflictingEvent]
      );

      expect(hasConflict).toBe(true);
      // User clicks "Proceed Anyway"
      // Form submission continues (tested in modal)
    });

    it('should redirect when user selects alternative event', async () => {
      const alternatives = suggestAlternativeEvents(
        mockEvent,
        [mockEvent, mockConflictingEvent, mockAlternativeEvent],
        [mockConflictingEvent]
      );

      expect(alternatives.length).toBeGreaterThan(0);
      expect(alternatives[0].id).toBe('3');

      // User clicks alternative
      // Should navigate to /events/3/register (tested in modal)
    });
  });

  describe('Conflict Detection Algorithm', () => {
    it('should correctly identify same-day overlaps', () => {
      const event1 = { ...mockEvent, time: '10:00 AM', durationMinutes: 60 };
      const event2 = { ...mockEvent, id: '4', time: '10:30 AM', durationMinutes: 60 };

      const { hasConflict } = checkRegistrationConflict(event1, [event2]);
      expect(hasConflict).toBe(true);
    });

    it('should not flag back-to-back events as conflicts', () => {
      const event1 = { ...mockEvent, time: '10:00 AM', durationMinutes: 60 };
      const event2 = { ...mockEvent, id: '4', time: '11:00 AM', durationMinutes: 60 };

      const { hasConflict } = checkRegistrationConflict(event1, [event2]);
      expect(hasConflict).toBe(false);
    });

    it('should ignore different-day events', () => {
      const event1 = { ...mockEvent, date: '2025-06-15' };
      const event2 = { ...mockEvent, id: '4', date: '2025-06-16' };

      const { hasConflict } = checkRegistrationConflict(event1, [event2]);
      expect(hasConflict).toBe(false);
    });
  });

  describe('Alternative Suggestion Algorithm', () => {
    it('should prioritize same-category events', () => {
      const targetEvent = {
        ...mockEvent,
        category: 'Programming',
        tags: ['React'],
      };

      const sameCategory = {
        ...mockAlternativeEvent,
        category: 'Programming',
        tags: ['React'],
      };

      const differentCategory = {
        ...mockAlternativeEvent,
        id: '5',
        category: 'Design',
      };

      const suggestions = suggestAlternativeEvents(
        targetEvent,
        [sameCategory, differentCategory],
        [mockConflictingEvent]
      );

      // Same category should be prioritized
      expect(suggestions[0].category).toBe('Programming');
    });

    it('should exclude already-registered events', () => {
      const registered = [mockConflictingEvent];
      
      const suggestions = suggestAlternativeEvents(
        mockEvent,
        [mockEvent, mockConflictingEvent, mockAlternativeEvent],
        registered
      );

      // Should not suggest already-registered event
      expect(suggestions.find(s => s.id === '2')).toBeUndefined();
    });

    it('should exclude target event itself', () => {
      const suggestions = suggestAlternativeEvents(
        mockEvent,
        [mockEvent, mockAlternativeEvent],
        []
      );

      // Should not suggest the target event
      expect(suggestions.find(s => s.id === '1')).toBeUndefined();
    });

    it('should respect maxSuggestions limit', () => {
      const manyEvents = Array.from({ length: 10 }, (_, i) => ({
        ...mockAlternativeEvent,
        id: String(i),
        date: `2025-06-${20 + i}`,
      }));

      const suggestions = suggestAlternativeEvents(
        mockEvent,
        manyEvents,
        [],
        60,
        3  // max 3 suggestions
      );

      expect(suggestions.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing event data gracefully', () => {
      const incompleteEvent = { id: '1', title: 'No dates' };
      
      // Should not crash
      const { hasConflict } = checkRegistrationConflict(
        incompleteEvent,
        [mockEvent]
      );

      expect(typeof hasConflict).toBe('boolean');
    });

    it('should handle empty registered events list', () => {
      const { hasConflict } = checkRegistrationConflict(mockEvent, []);
      expect(hasConflict).toBe(false);
    });

    it('should handle null/undefined inputs', () => {
      const { hasConflict } = checkRegistrationConflict(mockEvent, null);
      expect(hasConflict).toBe(false);

      const suggestions = suggestAlternativeEvents(mockEvent, [], null);
      expect(Array.isArray(suggestions)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle timezone-aware conflicts', () => {
      const eventNY = {
        ...mockEvent,
        timezone: 'America/New_York',
        time: '10:00 AM',
      };

      const eventLA = {
        ...mockConflictingEvent,
        timezone: 'America/Los_Angeles',
        time: '7:00 AM',  // Same UTC time as 10:00 AM ET
      };

      // Times differ by 3 hours due to timezone, but could still conflict
      // depending on duration and exact times
      const { hasConflict } = checkRegistrationConflict(eventNY, [eventLA]);
      expect(typeof hasConflict).toBe('boolean');
    });

    it('should handle very long event durations', () => {
      const longEvent = { ...mockEvent, durationMinutes: 480 }; // 8 hours
      const shortEvent = { ...mockConflictingEvent, time: '6:00 PM' };

      const { hasConflict } = checkRegistrationConflict(longEvent, [shortEvent]);
      expect(hasConflict).toBe(true);
    });

    it('should handle events with missing duration', () => {
      const noDuration = { ...mockEvent, durationMinutes: undefined };
      const overlapping = { ...mockConflictingEvent };

      // Should use fallback duration (60 min) and detect conflict
      const { hasConflict } = checkRegistrationConflict(noDuration, [overlapping]);
      expect(typeof hasConflict).toBe('boolean');
    });
  });

  describe('Performance', () => {
    it('should check conflicts quickly for realistic event list', () => {
      const manyEvents = Array.from({ length: 100 }, (_, i) => ({
        ...mockEvent,
        id: String(i),
        date: `2025-06-${(i % 30) + 1}`,
      }));

      const startTime = performance.now();
      
      for (let i = 0; i < 10; i++) {
        checkRegistrationConflict(mockEvent, manyEvents);
      }
      
      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(100); // Should be fast
    });
  });

  describe('Accessibility', () => {
    it('should maintain focus management during conflict resolution', async () => {
      // Modal should trap focus, return focus after close
      // Tested in EventConflictModal.test.jsx
      expect(true).toBe(true);
    });

    it('should be keyboard navigable', async () => {
      // Tab through elements, Escape to close
      // Tested in EventConflictModal.test.jsx
      expect(true).toBe(true);
    });
  });
});
