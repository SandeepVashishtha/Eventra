import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import EventRegistration from './EventRegistration';

const mockUser = {
  id: 'u1',
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  fullName: 'John Doe',
  username: 'john',
};

vi.mock('context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser, token: 'tok', isAuthenticated: () => true }),
  AuthProvider: ({ children }) => children,
}));

vi.mock('context/MyEventsContext', () => ({
  useMyEvents: () => ({ myEvents: [], addRegistration: vi.fn() }),
  MyEventsProvider: ({ children }) => children,
}));

vi.mock('context/SessionRecoveryContext', () => ({
  useSessionRecovery: () => ({ clearSession: vi.fn() }),
  SessionRecoveryProvider: ({ children }) => children,
}));

let availabilityData = { isFull: false, capacity: 30, registeredCount: 5 };
let eventData = {
  id: 'test-event',
  title: 'Test Event',
  maxAttendees: 30,
  attendees: 5,
  date: '2030-01-01',
  time: '10:00 AM',
  durationMinutes: 60,
};

vi.mock('config/api', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    apiUtils: {
      get: vi.fn(async (url) => {
        const u = String(url);
        if (u.includes('availability')) return { status: 200, data: availabilityData };
        if (u.includes('email')) return { status: 200, data: { available: true } };
        return { status: 200, data: eventData };
      }),
      post: vi.fn(async () => ({ status: 200, data: { registrationId: 'r1', qrToken: 'q1' } })),
    },
  };
});

vi.mock('utils/waitlistUtils', () => ({
  joinWaitlist: vi.fn(async () => ({})),
  getQueuePosition: vi.fn(async () => 1),
  getGlobalWaitlist: vi.fn(async () => []),
}));

function renderRegistration() {
  return render(
    <MemoryRouter initialEntries={['/events/test-event/register']}>
      <Routes>
        <Route path="/events/:id/register" element={<EventRegistration />} />
      </Routes>
    </MemoryRouter>
  );
}

async function fillAndSubmit(user) {
  await user.type(screen.getByLabelText(/full name/i), 'John Doe');
  await user.type(screen.getByLabelText(/email/i), 'john@example.com');
  await user.type(screen.getByLabelText(/phone/i), '1234567890');
  const submit = screen.getByRole('button', { name: /register/i });
  await user.click(submit);
}

describe('EventRegistration isFull (server authoritative) #16246', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    availabilityData = { isFull: false, capacity: 30, registeredCount: 5 };
    eventData = {
      id: 'test-event',
      title: 'Test Event',
      maxAttendees: 30,
      attendees: 5,
      date: '2030-01-01',
      time: '10:00 AM',
      durationMinutes: 60,
    };
  });

  it('shows "Register" label when event is not full', async () => {
    renderRegistration();
    await waitFor(() => expect(screen.getByRole('button', { name: /register/i })).toBeTruthy());
    expect(screen.queryByRole('button', { name: /join waitlist/i })).toBeNull();
  });

  it('shows "Join Waitlist" label when event is full (local capacity)', async () => {
    eventData = { ...eventData, attendees: 30, maxAttendees: 30 };
    renderRegistration();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /join waitlist/i })).toBeTruthy()
    );
    expect(screen.queryByRole('button', { name: /^register$/i })).toBeNull();
  });

  it('shows confirmed success message when server says not full', async () => {
    const user = userEvent.setup();
    renderRegistration();
    await fillAndSubmit(user);
    await waitFor(() => expect(screen.queryByText(/waitlist/i)).toBeNull());
    expect(screen.getByText(/registration/i)).toBeTruthy();
  });

  it('shows waitlist success message when server says full', async () => {
    availabilityData = { isFull: true, capacity: 30, registeredCount: 30 };
    eventData = { ...eventData, attendees: 30, maxAttendees: 30 };
    const user = userEvent.setup();
    renderRegistration();
    await fillAndSubmit(user);
    await waitFor(() => expect(screen.getByText(/waitlist/i)).toBeTruthy());
  });
});
