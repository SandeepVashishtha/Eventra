import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import HostHackathon from './HostHackathon';
import { hostHackathon } from '../../services/hackathonService';

const renderHostHackathon = () => render(<HostHackathon />, { wrapper: MemoryRouter });

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
import { toast } from 'react-toastify';

vi.mock('../../services/hackathonService', () => ({
  hostHackathon: vi.fn(),
}));

vi.mock('../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../context/AuthContext');
  return { ...actual, useAuth: vi.fn() };
});
import { useAuth as useAuthMock } from '../../context/AuthContext';

const mockIsAuthenticated = vi.fn(() => true);

const PLACEHOLDERS = {
  hackathonName: 'Enter hackathon name',
  organizerName: 'Enter your name or organization',
  email: 'your@email.com',
  location: 'e.g., Online or New York City',
  description: 'Briefly describe your hackathon',
};

const TOMORROW = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
})();
const DAY_AFTER = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split('T')[0];
})();

const fillValidForm = async (user) => {
  await user.type(screen.getByPlaceholderText(PLACEHOLDERS.hackathonName), 'My Hackathon');
  await user.type(screen.getByPlaceholderText(PLACEHOLDERS.organizerName), 'My Org');
  await user.type(screen.getByPlaceholderText(PLACEHOLDERS.email), 'me@example.com');
  await user.type(screen.getByPlaceholderText(PLACEHOLDERS.location), 'Online');
  const [startDateInput, endDateInput] = document.querySelectorAll('input[type="date"]');
  fireEvent.change(startDateInput, { target: { value: TOMORROW } });
  fireEvent.change(endDateInput, { target: { value: DAY_AFTER } });
  await user.type(
    screen.getByPlaceholderText(PLACEHOLDERS.description),
    'A description that is long enough to pass validation.'
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  mockIsAuthenticated.mockReturnValue(true);
  useAuthMock.mockReturnValue({
    user: { id: 'user-1' },
    token: 'tok-123',
    isAuthenticated: mockIsAuthenticated,
  });
  Element.prototype.scrollIntoView = vi.fn();
  window.scrollTo = vi.fn();
});

describe('HostHackathon - auth guard', () => {
  it('redirects to /login on mount when not authenticated', () => {
    mockIsAuthenticated.mockReturnValue(false);
    renderHostHackathon();
    expect(toast.error).toHaveBeenCalledWith('You must be logged in to host a hackathon.');
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('does not redirect when authenticated', () => {
    renderHostHackathon();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('blocks submission and redirects when not authenticated at submit time', async () => {
    const user = userEvent.setup();
    mockIsAuthenticated.mockReturnValue(false);
    renderHostHackathon();
    mockNavigate.mockClear();
    toast.error.mockClear();

    await user.click(screen.getByRole('button', { name: /submit hackathon/i }));

    expect(toast.error).toHaveBeenCalledWith('You must be logged in to host a hackathon.');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(hostHackathon).not.toHaveBeenCalled();
  });
});

describe('HostHackathon - form validation wiring', () => {
  it('shows errors and focuses the first invalid field on empty submit', async () => {
    const user = userEvent.setup();
    renderHostHackathon();

    await user.click(screen.getByRole('button', { name: /submit hackathon/i }));

    expect(toast.error).toHaveBeenCalledWith('Please fix the errors before submitting.');
    expect(await screen.findByText('hackathon Name is required!')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(PLACEHOLDERS.hackathonName)).toHaveFocus();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    expect(hostHackathon).not.toHaveBeenCalled();
  });
});

describe('HostHackathon - submission flow', () => {
  it('submits sanitized data and resets the form on success', async () => {
    const user = userEvent.setup();
    hostHackathon.mockResolvedValueOnce({ success: true });
    renderHostHackathon();

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /submit hackathon/i }));

    await waitFor(() => expect(hostHackathon).toHaveBeenCalledTimes(1));
    const [sentData, config] = hostHackathon.mock.calls[0];
    expect(sentData).toMatchObject({
      hackathonName: 'My Hackathon',
      organizerName: 'My Org',
      hostUserId: 'user-1',
    });
    expect(config).toEqual({ headers: { Authorization: 'Bearer tok-123' } });
    expect(toast.success).toHaveBeenCalledWith(
      'Hackathon submitted successfully! It will be reviewed before going live.'
    );
    expect(screen.getByPlaceholderText(PLACEHOLDERS.hackathonName)).toHaveValue('');
  });

  it('shows an error toast with the thrown error message on failure', async () => {
    const user = userEvent.setup();
    hostHackathon.mockRejectedValueOnce(new Error('Server exploded'));
    renderHostHackathon();

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /submit hackathon/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Server exploded'));
  });
});
