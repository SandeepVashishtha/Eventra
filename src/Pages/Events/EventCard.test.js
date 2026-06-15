import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import EventCard from './EventCard';
import userEvent from '@testing-library/user-event';
import { getEventStatus } from '../../utils/eventUtils';

jest.mock('../../utils/timezoneUtils', () => ({
  getUserTimezone: jest.fn().mockReturnValue('UTC'),
}));

jest.mock('../../utils/relativeTime', () => ({
  getSmartDateLabel: jest.fn().mockReturnValue('Jun 15, 2027'),
}));

jest.mock('../../utils/calendarUtils', () => ({
  addEventToGoogleCalendar: jest.fn().mockReturnValue('https://calendar.google.com/'),
}));

jest.mock('../../utils/shareUtils', () => ({
  generateEventSharingData: jest.fn().mockReturnValue({}),
}));

const mockToggleBookmark = jest.fn();
const mockIsBookmarked = jest.fn().mockReturnValue(false);

jest.mock('../../hooks/useBookmarks', () => ({
  __esModule: true,
  default: () => ({
    bookmarks: [],
    toggleBookmark: mockToggleBookmark,
    isBookmarked: mockIsBookmarked,
    loading: false,
  }),
}));

jest.mock('../../utils/conflictDetection', () => ({
  checkRegistrationConflict: jest.fn().mockReturnValue({ hasConflict: false }),
}));

jest.mock('../../utils/eventUtils', () => ({
  getEventStatus: jest.fn().mockReturnValue('upcoming'),
}));

jest.mock('../../context/MyEventsContext', () => ({
  useMyEvents: jest.fn(),
}));

jest.mock('../../components/common/ShareMenu', () =>
  function ShareMenu({ children }) { return children || null; }
);

jest.mock('../../components/common/StatusBadge', () => () => null);

jest.mock('../../components/reminders/ReminderControls', () => () => null);

jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

const baseEvent = {
  id: 42,
  title: 'GSSoC Hackathon 2027',
  description: 'A global open source hackathon for developers.',
  location: 'Online',
  type: 'Hackathon',
  date: '2027-06-15',
  time: '10:00 AM',
  image: 'https://example.com/event.jpg',
};

const renderCard = (eventOverrides = {}) =>
  render(
    <BrowserRouter>
      <EventCard event={{ ...baseEvent, ...eventOverrides }} />
    </BrowserRouter>
  );

const { checkRegistrationConflict } = require('../../utils/conflictDetection');
const { useMyEvents } = require('../../context/MyEventsContext');

const defaultMyEvents = () => ({ myEvents: [], isRegistered: () => false });

describe('EventCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getEventStatus.mockReturnValue('upcoming');
    checkRegistrationConflict.mockReturnValue({ hasConflict: false });
    mockIsBookmarked.mockReturnValue(false);
    mockToggleBookmark.mockClear();
    useMyEvents.mockReturnValue(defaultMyEvents());
  });

  describe('rendering', () => {
    it('renders the event title', () => {
      renderCard();
      expect(screen.getByText('GSSoC Hackathon 2027')).toBeInTheDocument();
    });

    it('renders the event description', () => {
      renderCard();
      expect(screen.getByText(/global open source hackathon/i)).toBeInTheDocument();
    });

    it('renders the event location', () => {
      renderCard();
      expect(screen.getByText('Online')).toBeInTheDocument();
    });

    it('renders the event type', () => {
      renderCard();
      expect(screen.getByText('Hackathon')).toBeInTheDocument();
    });
  });

  describe('capacity display', () => {
    it('shows spots-left count when event is not full', () => {
      renderCard({ maxAttendees: 100, attendees: 42 });
      expect(screen.getByText(/58 spots left/i)).toBeInTheDocument();
      expect(screen.getByText(/42 \/ 100 registered/i)).toBeInTheDocument();
    });

    it('shows "Full" badge and 0 spots when event is at capacity', () => {
      renderCard({ maxAttendees: 50, attendees: 50 });
      expect(screen.getByText('Full')).toBeInTheDocument();
      expect(screen.getByText(/50 \/ 50 registered/i)).toBeInTheDocument();
    });

    it('does not render capacity section when maxAttendees is absent', () => {
      renderCard();
      expect(screen.queryByText(/registered/i)).not.toBeInTheDocument();
    });
  });

  describe('call-to-action links', () => {
    it('shows "Register Now" link for upcoming events', () => {
      renderCard();
      expect(screen.getByRole('link', { name: /register now/i })).toBeInTheDocument();
    });

    it('"Register Now" link points to the event registration path', () => {
      renderCard();
      const link = screen.getByRole('link', { name: /register now/i });
      expect(link).toHaveAttribute('href', '/events/42/register');
    });

    it('shows "View Details" link', () => {
      renderCard();
      expect(screen.getByRole('link', { name: /view details/i })).toBeInTheDocument();
    });

    it('shows "Event Ended" text and no register link for past events', () => {
      getEventStatus.mockReturnValue('past');
      renderCard();
      expect(screen.getByText(/event ended/i)).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /register now/i })).not.toBeInTheDocument();
    });
  });

  describe('conflict indicator', () => {
    it('shows "Conflict" badge when the event conflicts with registered events', () => {
      checkRegistrationConflict.mockReturnValue({ hasConflict: true });
      renderCard();
      expect(screen.getByText('Conflict')).toBeInTheDocument();
    });
  });

  describe('bookmark interaction', () => {
    const { toast } = require('react-toastify');

    it('calls toggleBookmark and shows toast when bookmarking an unbookmarked event', async () => {
      mockIsBookmarked.mockReturnValue(false);
      renderCard();
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /bookmark event/i }));
      expect(mockToggleBookmark).toHaveBeenCalledTimes(1);
      expect(toast.success).toHaveBeenCalled();
    });

    it('calls toggleBookmark and shows info toast when removing a bookmark', async () => {
      mockIsBookmarked.mockReturnValue(true);
      renderCard();
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /remove event bookmark/i }));
      expect(mockToggleBookmark).toHaveBeenCalledTimes(1);
      expect(toast.info).toHaveBeenCalled();
    });

    it('shows "Registered" badge when the user is registered for the event', () => {
      useMyEvents.mockReturnValueOnce({ myEvents: [], isRegistered: () => true });
      renderCard();
      expect(screen.getByText('Registered')).toBeInTheDocument();
    });
  });

  describe('copy link button', () => {
    it('renders a copy-link button with the correct aria-label', () => {
      renderCard();
      expect(
        screen.getByRole('button', { name: /copy link for GSSoC Hackathon 2027/i })
      ).toBeInTheDocument();
    });
  });
});
