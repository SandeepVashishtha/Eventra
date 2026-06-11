import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

import RegistrationPage from './RegistrationPage';
import { apiUtils } from '../config/api';
import { toast } from 'react-hot-toast';

jest.mock('../config/api', () => ({
  API_ENDPOINTS: {
    EVENTS: { REGISTER: (id) => `/api/events/${id}/register` },
  },
  apiUtils: { post: jest.fn() },
}));

jest.mock('../utils/registerUtils', () => ({
  isAlreadyRegistered: jest.fn().mockReturnValue(false),
  saveRegistration: jest.fn(),
}));

jest.mock('../hooks/useDocumentTitle', () => jest.fn());

jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
  ToastContainer: () => null,
}));

const renderPage = () =>
  render(
    <BrowserRouter>
      <RegistrationPage />
    </BrowserRouter>
  );

describe('RegistrationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('form rendering', () => {
    it('renders the full name input', () => {
      renderPage();
      expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument();
    });

    it('renders the email input', () => {
      renderPage();
      expect(screen.getByPlaceholderText('your.email@example.com')).toBeInTheDocument();
    });

    it('renders the phone input', () => {
      renderPage();
      expect(screen.getByPlaceholderText('+1 (555) 123-4567')).toBeInTheDocument();
    });

    it('renders the "Complete Registration" submit button', () => {
      renderPage();
      expect(
        screen.getByRole('button', { name: /complete registration/i })
      ).toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('shows "Full name is required" when submitting with empty name', async () => {
      renderPage();
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /complete registration/i }));
      await screen.findByText('Full name is required');
    });

    it('shows "Email address is required" when submitting with empty email', async () => {
      renderPage();
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /complete registration/i }));
      await screen.findByText('Email address is required');
    });

    it('shows "Phone number is required" when submitting with empty phone', async () => {
      renderPage();
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /complete registration/i }));
      await screen.findByText('Phone number is required');
    });

    it('does not call the API when form is invalid', async () => {
      renderPage();
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /complete registration/i }));
      await screen.findByText('Full name is required');
      expect(apiUtils.post).not.toHaveBeenCalled();
    });

    it('shows "Please enter a valid email address" for a malformed email', async () => {
      renderPage();
      const user = userEvent.setup();
      await user.type(screen.getByPlaceholderText('Enter your full name'), 'John Doe');
      await user.type(screen.getByPlaceholderText('your.email@example.com'), 'notanemail');
      await user.click(screen.getByRole('button', { name: /complete registration/i }));
      await screen.findByText('Please enter a valid email address');
    });

    it('shows "Name must be at least 3 characters" for a too-short name', async () => {
      renderPage();
      const user = userEvent.setup();
      await user.type(screen.getByPlaceholderText('Enter your full name'), 'Jo');
      await user.click(screen.getByRole('button', { name: /complete registration/i }));
      await screen.findByText('Name must be at least 3 characters');
    });
  });

  describe('API integration', () => {
    const fillValidForm = async (user) => {
      await user.type(screen.getByPlaceholderText('Enter your full name'), 'Jane Doe');
      await user.type(screen.getByPlaceholderText('your.email@example.com'), 'jane@example.com');
      await user.type(screen.getByPlaceholderText('+1 (555) 123-4567'), '1234567890');
    };

    it('calls apiUtils.post once with form data on a valid submit', async () => {
      apiUtils.post.mockResolvedValueOnce({});
      renderPage();
      const user = userEvent.setup();
      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: /complete registration/i }));
      await waitFor(() => expect(apiUtils.post).toHaveBeenCalledTimes(1));
      expect(apiUtils.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ fullName: 'Jane Doe', email: 'jane@example.com' })
      );
    });

    it('shows the success view after a successful submission', async () => {
      apiUtils.post.mockResolvedValueOnce({});
      renderPage();
      const user = userEvent.setup();
      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: /complete registration/i }));
      await screen.findByText('Registration Successful!');
    });

    it('calls toast.success on a successful submission', async () => {
      apiUtils.post.mockResolvedValueOnce({});
      renderPage();
      const user = userEvent.setup();
      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: /complete registration/i }));
      await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Registration successful!'));
    });

    it('shows inline error message when API fails with a generic error', async () => {
      const err = new Error('Network error');
      apiUtils.post.mockRejectedValueOnce(err);
      renderPage();
      const user = userEvent.setup();
      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: /complete registration/i }));
      await screen.findByText('Network error');
    });

    it('shows "already registered" error and calls toast.error on 409 conflict', async () => {
      const conflictErr = { status: 409, data: { message: 'Already registered' } };
      apiUtils.post.mockRejectedValueOnce(conflictErr);
      renderPage();
      const user = userEvent.setup();
      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: /complete registration/i }));
      await screen.findByText('This email is already registered for this event.');
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
