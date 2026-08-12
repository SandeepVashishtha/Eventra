/**
 * EmailTemplateConfig.test.jsx
 * 
 * Tests for the EmailTemplateConfig component.
 * Tests the functionality for customizing email templates and sending test emails.
 * 
 * Feature: #12139 - "Send Test Email" button for custom notifications
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import EmailTemplateConfig from './EmailTemplateConfig';

// Mock the API utilities
vi.mock('../../config/api', () => ({
  apiUtils: {
    post: vi.fn(),
    get: vi.fn(),
  },
  API_ENDPOINTS: {
    NOTIFICATIONS: {
      TEST_EMAIL: '/api/notifications/send-test-email',
      SAVE_TEMPLATE: '/api/notifications/save-template',
    },
    USER: {
      ME: '/api/users/me',
    },
  },
}));

// Mock toast
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Mail: () => <svg data-testid="mail-icon" />,
  Send: () => <svg data-testid="send-icon" />,
  Check: () => <svg data-testid="check-icon" />,
  X: () => <svg data-testid="x-icon" />,
  Loader2: () => <svg data-testid="loader-icon" />,
}));

const mockEvent = {
  id: '123',
  title: 'Test Event',
  eventDate: '2026-12-25',
  eventTime: '10:00 AM',
  location: 'Conference Center',
  organizerEmail: 'organizer@test.com',
  refundDeadline: '2027-01-10',
};

const defaultTemplate = `Dear {attendeeName},

Event: {eventTitle}`;

describe('EmailTemplateConfig Component', () => {
  const mockApiUtils = require('../../config/api').apiUtils;
  const mockToast = require('react-toastify').toast;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful API responses
    mockApiUtils.post.mockResolvedValue({
      data: { success: true, messageId: 'test-123' }
    });
    
    mockApiUtils.get.mockResolvedValue({
      data: { email: 'organizer@test.com' }
    });
  });

  it('renders the component with all required elements', () => {
    render(
      <EmailTemplateConfig
        eventId="123"
        templateType="cancellation"
        event={mockEvent}
        defaultTemplate={defaultTemplate}
      />
    );

    // Check header
    expect(screen.getByText('Custom Event Cancellation Email')).toBeInTheDocument();
    
    // Check template editor
    expect(screen.getByLabelText('Email Content')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    
    // Check buttons
    expect(screen.getByRole('button', { name: /Send Test Email/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Template/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset to Default/i })).toBeInTheDocument();
    
    // Check info box
    expect(screen.getByText(/Why test?/i)).toBeInTheDocument();
  });

  it('displays the default template in the textarea', () => {
    render(
      <EmailTemplateConfig
        eventId="123"
        templateType="cancellation"
        event={mockEvent}
        defaultTemplate={defaultTemplate}
      />
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue(defaultTemplate);
  });

  it('updates the template when user types', async () => {
    const user = userEvent.setup();
    render(
      <EmailTemplateConfig
        eventId="123"
        templateType="cancellation"
        event={mockEvent}
        defaultTemplate={defaultTemplate}
      />
    );

    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'Updated template content');
    
    expect(textarea).toHaveValue('Updated template content');
  });

  it('shows waitlist promotion template type', () => {
    render(
      <EmailTemplateConfig
        eventId="123"
        templateType="waitlist_promotion"
        event={mockEvent}
        defaultTemplate={defaultTemplate}
      />
    );

    expect(screen.getByText('Custom Waitlist Promotion Email')).toBeInTheDocument();
    expect(screen.getByText(/Customize the email sent when promoting users from the waitlist/i)).toBeInTheDocument();
  });

  it('shows placeholder help text', () => {
    render(
      <EmailTemplateConfig
        eventId="123"
        templateType="cancellation"
        event={mockEvent}
        defaultTemplate={defaultTemplate}
      />
    );

    expect(screen.getByText(/Available placeholders:/i)).toBeInTheDocument();
    expect(screen.getByText('{attendeeName}')).toBeInTheDocument();
    expect(screen.getByText('{eventTitle}')).toBeInTheDocument();
  });

  it('calls sendTestEmail API when Send Test Email button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <EmailTemplateConfig
        eventId="123"
        templateType="cancellation"
        event={mockEvent}
        defaultTemplate={defaultTemplate}
      />
    );

    const sendButton = screen.getByRole('button', { name: /Send Test Email/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(mockApiUtils.post).toHaveBeenCalledWith(
        '/api/notifications/send-test-email',
        expect.objectContaining({
          eventId: '123',
          templateType: 'cancellation',
          isTest: true,
        })
      );
    });
  });

  it('calls saveTemplate API when Save Template button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <EmailTemplateConfig
        eventId="123"
        templateType="cancellation"
        event={mockEvent}
        defaultTemplate={defaultTemplate}
        onTemplateSave={vi.fn()}
      />
    );

    const saveButton = screen.getByRole('button', { name: /Save Template/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockApiUtils.post).toHaveBeenCalledWith(
        '/api/notifications/save-template',
        expect.objectContaining({
          eventId: '123',
          templateType: 'cancellation',
          template: defaultTemplate,
        })
      );
    });
  });

  it('resets to default template when Reset to Default button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <EmailTemplateConfig
        eventId="123"
        templateType="cancellation"
        event={mockEvent}
        defaultTemplate={defaultTemplate}
      />
    );

    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'Custom content');
    
    const resetButton = screen.getByRole('button', { name: /Reset to Default/i });
    await user.click(resetButton);

    expect(textarea).toHaveValue(defaultTemplate);
  });

  it('disables Send Test Email button when template is empty', async () => {
    const user = userEvent.setup();
    
    render(
      <EmailTemplateConfig
        eventId="123"
        templateType="cancellation"
        event={mockEvent}
        defaultTemplate=""
      />
    );

    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    
    const sendButton = screen.getByRole('button', { name: /Send Test Email/i });
    expect(sendButton).toBeDisabled();
  });

  it('shows error message when API call fails', async () => {
    const user = userEvent.setup();
    
    // Mock API failure
    mockApiUtils.post.mockRejectedValue(new Error('Network error'));
    
    render(
      <EmailTemplateConfig
        eventId="123"
        templateType="cancellation"
        event={mockEvent}
        defaultTemplate={defaultTemplate}
      />
    );

    const sendButton = screen.getByRole('button', { name: /Send Test Email/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to send test email/i)).toBeInTheDocument();
    });
  });

  it('shows success message when test email is sent', async () => {
    const user = userEvent.setup();
    
    render(
      <EmailTemplateConfig
        eventId="123"
        templateType="cancellation"
        event={mockEvent}
        defaultTemplate={defaultTemplate}
      />
    );

    const sendButton = screen.getByRole('button', { name: /Send Test Email/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalled();
    });
  });

  it('uses provided organizer email', async () => {
    const user = userEvent.setup();
    
    render(
      <EmailTemplateConfig
        eventId="123"
        templateType="cancellation"
        event={mockEvent}
        defaultTemplate={defaultTemplate}
        organizerEmail="custom@organizer.com"
      />
    );

    const sendButton = screen.getByRole('button', { name: /Send Test Email/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(mockApiUtils.post).toHaveBeenCalledWith(
        '/api/notifications/send-test-email',
        expect.objectContaining({
          recipientEmail: 'custom@organizer.com',
        })
      );
    });
  });
});
