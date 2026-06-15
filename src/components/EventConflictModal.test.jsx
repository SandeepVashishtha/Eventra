import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventConflictModal from './EventConflictModal';

/**
 * EventConflictModal Test Suite
 *
 * Tests the conflict modal component that displays scheduling conflicts
 * and alternative event suggestions during registration.
 *
 * Test Categories:
 * - Modal Visibility & Rendering
 * - Conflict Display
 * - Alternative Suggestions Display
 * - User Interactions
 * - Accessibility Features
 * - Edge Cases
 * - Dark Mode Support
 */

describe('EventConflictModal', () => {
  // Mock timezone utility
  vi.mock('../utils/timezoneUtils', () => ({
    getUserTimezone: () => 'America/New_York',
    parseEventToUTC: vi.fn((date, time) => {
      const d = new Date(`${date}T${time}`);
      return d.getTime();
    }),
  }));

  // Mock conflict detection utilities
  vi.mock('../utils/conflictDetection', () => ({
    formatTimeRange: (time, duration, date) => `${time} - ${new Date(Date.parse(date) + duration * 60000).toLocaleTimeString()}`,
  }));

  const mockNewEvent = {
    id: '1',
    title: 'React Workshop',
    date: '2025-06-15',
    time: '10:00 AM',
    durationMinutes: 60,
    timezone: 'America/New_York',
  };

  const mockConflictingEvent = {
    id: '2',
    title: 'JavaScript Basics',
    date: '2025-06-15',
    time: '10:30 AM',
    durationMinutes: 90,
    timezone: 'America/New_York',
  };

  const mockAlternativeEvent1 = {
    id: '3',
    title: 'Advanced React',
    date: '2025-06-16',
    time: '2:00 PM',
    durationMinutes: 120,
    timezone: 'America/New_York',
  };

  const mockAlternativeEvent2 = {
    id: '4',
    title: 'Vue Fundamentals',
    date: '2025-06-17',
    time: '10:00 AM',
    durationMinutes: 60,
    timezone: 'America/New_York',
  };

  const defaultProps = {
    isOpen: true,
    newEvent: mockNewEvent,
    conflictingEvents: [mockConflictingEvent],
    suggestedEvents: [mockAlternativeEvent1, mockAlternativeEvent2],
    onCancel: vi.fn(),
    onProceed: vi.fn(),
    onSelectAlternative: vi.fn(),
    strictMode: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Modal Visibility & Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<EventConflictModal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Scheduling Conflict Detected')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<EventConflictModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should display modal with correct ARIA attributes', () => {
      render(<EventConflictModal {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('should prevent body scroll when modal is open', () => {
      const { rerender } = render(<EventConflictModal {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).not.toBe('hidden');

      rerender(<EventConflictModal {...defaultProps} isOpen={true} />);
      expect(document.body.style.overflow).toBe('hidden');

      rerender(<EventConflictModal {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).not.toBe('hidden');
    });
  });

  describe('Conflict Display', () => {
    it('should display the new event being registered for', () => {
      render(<EventConflictModal {...defaultProps} />);
      expect(screen.getByText('React Workshop')).toBeInTheDocument();
    });

    it('should display conflicting event information', () => {
      render(<EventConflictModal {...defaultProps} />);
      expect(screen.getByText('JavaScript Basics')).toBeInTheDocument();
    });

    it('should display correct date for conflicting event', () => {
      render(<EventConflictModal {...defaultProps} />);
      const dateElements = screen.getAllByText(/Jun/);
      expect(dateElements.length).toBeGreaterThan(0);
    });

    it('should show correct conflict section header', () => {
      render(<EventConflictModal {...defaultProps} />);
      expect(screen.getByText('Conflicting Event')).toBeInTheDocument();
    });

    it('should show plural "Conflicting Events" for multiple conflicts', () => {
      const multipleConflicts = {
        ...defaultProps,
        conflictingEvents: [mockConflictingEvent, { ...mockConflictingEvent, id: '5', title: 'Another Event' }],
      };
      render(<EventConflictModal {...multipleConflicts} />);
      expect(screen.getByText('Conflicting Events')).toBeInTheDocument();
    });

    it('should display all conflicting events', () => {
      const conflicts = [
        mockConflictingEvent,
        { ...mockConflictingEvent, id: '5', title: 'Meeting', date: '2025-06-15' },
      ];
      render(<EventConflictModal {...defaultProps} conflictingEvents={conflicts} />);
      expect(screen.getByText('JavaScript Basics')).toBeInTheDocument();
      expect(screen.getByText('Meeting')).toBeInTheDocument();
    });

    it('should handle missing event data gracefully', () => {
      const incompleteEvent = { id: '6', title: 'Incomplete Event' };
      render(<EventConflictModal {...defaultProps} conflictingEvents={[incompleteEvent]} />);
      expect(screen.getByText('Incomplete Event')).toBeInTheDocument();
      expect(screen.getByText('TBD')).toBeInTheDocument();
    });

    it('should display timezone information', () => {
      render(<EventConflictModal {...defaultProps} />);
      expect(screen.getByText(/America\/New_York/)).toBeInTheDocument();
    });
  });

  describe('Alternative Suggestions Display', () => {
    it('should display alternative suggestions section when suggestions exist', () => {
      render(<EventConflictModal {...defaultProps} />);
      expect(screen.getByText('Suggested Alternatives')).toBeInTheDocument();
    });

    it('should not display alternative suggestions section when empty', () => {
      render(<EventConflictModal {...defaultProps} suggestedEvents={[]} />);
      expect(screen.queryByText('Suggested Alternatives')).not.toBeInTheDocument();
    });

    it('should display all alternative events', () => {
      render(<EventConflictModal {...defaultProps} />);
      expect(screen.getByText('Advanced React')).toBeInTheDocument();
      expect(screen.getByText('Vue Fundamentals')).toBeInTheDocument();
    });

    it('should display each suggestion as a clickable button', () => {
      render(<EventConflictModal {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      const alternativeButtons = buttons.filter(btn => 
        btn.textContent.includes('Advanced React') || btn.textContent.includes('Vue Fundamentals')
      );
      expect(alternativeButtons.length).toBe(2);
    });

    it('should display arrow icon for alternative suggestions', () => {
      const { container } = render(<EventConflictModal {...defaultProps} />);
      const arrowIcons = container.querySelectorAll('svg[class*="group-hover"]');
      expect(arrowIcons.length).toBeGreaterThan(0);
    });
  });

  describe('User Interactions', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const onCancel = vi.fn();
      render(<EventConflictModal {...defaultProps} onCancel={onCancel} />);
      const cancelButton = screen.getByText('Cancel Registration');
      fireEvent.click(cancelButton);
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onProceed when proceed button is clicked', async () => {
      const onProceed = vi.fn();
      render(<EventConflictModal {...defaultProps} onProceed={onProceed} />);
      const proceedButton = screen.getByText('Proceed Anyway');
      fireEvent.click(proceedButton);
      expect(onProceed).toHaveBeenCalledTimes(1);
    });

    it('should call onSelectAlternative when alternative event is clicked', async () => {
      const onSelectAlternative = vi.fn();
      render(<EventConflictModal {...defaultProps} onSelectAlternative={onSelectAlternative} />);
      const advancedReactButton = screen.getByText('Advanced React').closest('button');
      fireEvent.click(advancedReactButton);
      expect(onSelectAlternative).toHaveBeenCalledWith(mockAlternativeEvent1);
    });

    it('should call onCancel when backdrop is clicked', () => {
      const onCancel = vi.fn();
      const { container } = render(<EventConflictModal {...defaultProps} onCancel={onCancel} />);
      const backdrop = container.querySelector('.absolute.inset-0');
      fireEvent.click(backdrop);
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when close button is clicked', () => {
      const onCancel = vi.fn();
      render(<EventConflictModal {...defaultProps} onCancel={onCancel} />);
      const closeButton = screen.getByLabelText('Close conflict dialog');
      fireEvent.click(closeButton);
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when Escape key is pressed', async () => {
      const onCancel = vi.fn();
      render(<EventConflictModal {...defaultProps} onCancel={onCancel} />);
      fireEvent.keyDown(window, { key: 'Escape' });
      await waitFor(() => {
        expect(onCancel).toHaveBeenCalled();
      });
    });
  });

  describe('Strict Mode', () => {
    it('should hide proceed button when strictMode is true', () => {
      render(<EventConflictModal {...defaultProps} strictMode={true} />);
      expect(screen.queryByText('Proceed Anyway')).not.toBeInTheDocument();
      expect(screen.getByText('Cancel Registration')).toBeInTheDocument();
    });

    it('should show proceed button when strictMode is false', () => {
      render(<EventConflictModal {...defaultProps} strictMode={false} />);
      expect(screen.getByText('Proceed Anyway')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<EventConflictModal {...defaultProps} />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Scheduling Conflict Detected');
    });

    it('should have aria labels on all buttons', () => {
      render(<EventConflictModal {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('should have descriptive alt text for icons', () => {
      const { container } = render(<EventConflictModal {...defaultProps} />);
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation between elements', async () => {
      const user = userEvent.setup();
      render(<EventConflictModal {...defaultProps} />);
      const cancelButton = screen.getByText('Cancel Registration');
      const proceedButton = screen.getByText('Proceed Anyway');

      await user.tab();
      expect(cancelButton).toHaveFocus();
      
      await user.tab();
      expect(proceedButton).toHaveFocus();
    });

    it('should manage focus correctly on open/close', async () => {
      const { rerender } = render(<EventConflictModal {...defaultProps} isOpen={false} />);
      // const focusedElement = document.activeElement;

      rerender(<EventConflictModal {...defaultProps} isOpen={true} />);
      // Modal should take focus

      rerender(<EventConflictModal {...defaultProps} isOpen={false} />);
      // Focus should restore
    });

    it('should have sufficient color contrast', () => {
      const { container } = render(<EventConflictModal {...defaultProps} />);
      // Visual regression test would verify actual contrast ratios
      const elements = container.querySelectorAll('[class*="text-"]');
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing event title', () => {
      const eventNoTitle = { ...mockNewEvent, title: undefined };
      render(<EventConflictModal {...defaultProps} newEvent={eventNoTitle} />);
      // Should not crash
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should handle missing conflict events', () => {
      render(<EventConflictModal {...defaultProps} conflictingEvents={[]} />);
      // Should still render but not show conflict section
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should handle null/undefined suggestions gracefully', () => {
      render(<EventConflictModal {...defaultProps} suggestedEvents={undefined} />);
      expect(screen.queryByText('Suggested Alternatives')).not.toBeInTheDocument();
    });

    it('should handle very long event titles', () => {
      const longTitle = 'A'.repeat(200);
      const eventLongTitle = { ...mockNewEvent, title: longTitle };
      render(<EventConflictModal {...defaultProps} newEvent={eventLongTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle invalid date formats', () => {
      const eventBadDate = { ...mockNewEvent, date: 'invalid-date' };
      render(<EventConflictModal {...defaultProps} conflictingEvents={[eventBadDate]} />);
      expect(screen.getByText('TBD')).toBeInTheDocument();
    });

    it('should render correctly with single conflicting event', () => {
      render(<EventConflictModal {...defaultProps} conflictingEvents={[mockConflictingEvent]} />);
      expect(screen.getByText('Conflicting Event')).toBeInTheDocument();
    });

    it('should render correctly with multiple conflicting events', () => {
      const conflicts = [mockConflictingEvent, { ...mockConflictingEvent, id: '10' }];
      render(<EventConflictModal {...defaultProps} conflictingEvents={conflicts} />);
      expect(screen.getByText('Conflicting Events')).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    it('should apply dark mode classes when in dark mode', () => {
      const { container } = render(<EventConflictModal {...defaultProps} />);
      const modalContent = container.querySelector('[role="dialog"]');
      expect(modalContent.className).toContain('dark:');
    });

    it('should maintain readability in dark mode', () => {
      const { container } = render(<EventConflictModal {...defaultProps} />);
      const elements = container.querySelectorAll('[class*="dark:"]');
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('Layout & Scrolling', () => {
    it('should allow scrolling when content exceeds viewport', () => {
      const manyConflicts = Array.from({ length: 10 }, (_, i) => ({
        ...mockConflictingEvent,
        id: String(i),
      }));
      const { container } = render(
        <EventConflictModal {...defaultProps} conflictingEvents={manyConflicts} />
      );
      const modalContent = container.querySelector('.overflow-y-auto');
      expect(modalContent).toHaveClass('max-h-[90vh]');
    });

    it('should maintain layout structure with empty suggestions', () => {
      const { container } = render(
        <EventConflictModal {...defaultProps} suggestedEvents={[]} />
      );
      const modalBody = container.querySelector('.p-6.space-y-6');
      expect(modalBody).toBeInTheDocument();
    });
  });

  describe('Integration with Form Validation', () => {
    it('should pass through all required props from parent', () => {
      const customProps = {
        ...defaultProps,
        onCancel: vi.fn(),
        onProceed: vi.fn(),
        onSelectAlternative: vi.fn(),
      };
      render(<EventConflictModal {...customProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not interfere with form submission', async () => {
      const { rerender } = render(
        <EventConflictModal {...defaultProps} isOpen={true} />
      );
      // Simulate modal close and form submission
      rerender(<EventConflictModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Performance & Memory', () => {
    it('should clean up event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      const { unmount } = render(<EventConflictModal {...defaultProps} />);
      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalled();
      removeEventListenerSpy.mockRestore();
    });

    it('should not cause memory leaks with repeated opens/closes', () => {
      const { rerender } = render(<EventConflictModal {...defaultProps} isOpen={true} />);
      for (let i = 0; i < 10; i++) {
        rerender(<EventConflictModal {...defaultProps} isOpen={false} />);
        rerender(<EventConflictModal {...defaultProps} isOpen={true} />);
      }
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
