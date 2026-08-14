import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import InstallmentPayment from './InstallmentPayment';
import { apiUtils, API_ENDPOINTS } from '../../config/api';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useParams: () => ({ eventId: 'evt123', registrationId: 'reg456' }),
  useNavigate: () => vi.fn(),
}));

// Mock Stripe libraries
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve({})),
}));

vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }) => <div>{children}</div>,
  CardElement: () => <div data-testid="stripe-card-element" />,
  useStripe: () => ({
    createPaymentMethod: vi.fn().mockResolvedValue({
      paymentMethod: { id: 'pm_test_123' },
    }),
  }),
  useElements: () => ({
    getElement: () => ({}),
  }),
}));

// Mock apiUtils
vi.mock('../../config/api', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    apiUtils: {
      get: vi.fn(),
      post: vi.fn(),
    },
  };
});

describe('InstallmentPayment component authentication and apiUtils integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches payment plan details using apiUtils.get and API_ENDPOINTS.PAYMENTS.PLANS', async () => {
    const mockPlanData = {
      id: 'plan_123',
      registrationId: 'reg456',
      totalAmount: 100,
      upfrontAmount: 25,
      remainingAmount: 75,
      paymentStatus: 'PENDING',
      payments: [
        { installmentNumber: 1, amount: 25, dueDate: '2026-09-01', status: 'PENDING' },
      ],
    };

    apiUtils.get.mockResolvedValue({ data: mockPlanData });
    apiUtils.post.mockResolvedValue({ data: { paymentPlanId: 'plan_123' } });

    render(<InstallmentPayment />);

    await waitFor(() => {
      expect(apiUtils.get).toHaveBeenCalledWith(API_ENDPOINTS.PAYMENTS.PLANS('reg456'));
    });

    expect(screen.getByText('Installment Payment Plan')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  it('initializes Stripe setup intent using apiUtils.post and API_ENDPOINTS.PAYMENTS.INITIALIZE', async () => {
    const mockPlanData = {
      id: 'plan_123',
      registrationId: 'reg456',
      totalAmount: 100,
      upfrontAmount: 25,
      remainingAmount: 75,
      paymentStatus: 'PENDING',
    };

    apiUtils.get.mockResolvedValue({ data: mockPlanData });
    apiUtils.post.mockResolvedValue({ data: { paymentPlanId: 'plan_123', clientSecret: 'secret_123' } });

    render(<InstallmentPayment />);

    await waitFor(() => {
      expect(apiUtils.post).toHaveBeenCalledWith(API_ENDPOINTS.PAYMENTS.INITIALIZE('reg456'));
    });
  });

  it('submits payment method setup and confirmation via apiUtils.post without manual Authorization headers', async () => {
    const mockPlanData = {
      id: 'plan_123',
      registrationId: 'reg456',
      totalAmount: 100,
      upfrontAmount: 25,
      remainingAmount: 75,
      paymentStatus: 'PENDING',
    };

    apiUtils.get.mockResolvedValue({ data: mockPlanData });
    apiUtils.post.mockImplementation((url) => {
      if (url.includes('/payments/initialize/')) {
        return Promise.resolve({ data: { paymentPlanId: 'plan_123' } });
      }
      if (url.includes('/payments/setup-method/')) {
        return Promise.resolve({ data: { paymentIntentId: 'pi_123' } });
      }
      if (url.includes('/payments/confirm-upfront/')) {
        return Promise.resolve({ data: { success: true } });
      }
      return Promise.resolve({ data: {} });
    });

    render(<InstallmentPayment />);

    await waitFor(() => {
      expect(screen.getByText('Pay $25.00')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Pay $25.00'));

    await waitFor(() => {
      expect(apiUtils.post).toHaveBeenCalledWith(
        API_ENDPOINTS.PAYMENTS.SETUP_METHOD('plan_123'),
        { paymentMethodId: 'pm_test_123' }
      );
      expect(apiUtils.post).toHaveBeenCalledWith(
        API_ENDPOINTS.PAYMENTS.CONFIRM_UPFRONT('plan_123'),
        { paymentMethodId: 'pm_test_123' }
      );
    });
  });

  it('retries failed payment via apiUtils.post and API_ENDPOINTS.PAYMENTS.RETRY', async () => {
    const mockPlanData = {
      id: 'plan_123',
      registrationId: 'reg456',
      totalAmount: 100,
      upfrontAmount: 25,
      remainingAmount: 75,
      paymentStatus: 'FAILED',
      payments: [
        { id: 'pay_999', installmentNumber: 1, amount: 25, dueDate: '2026-09-01', status: 'FAILED' },
      ],
    };

    apiUtils.get.mockResolvedValue({ data: mockPlanData });
    apiUtils.post.mockImplementation((url) => {
      if (url.includes('/payments/initialize/')) {
        return Promise.resolve({ data: { paymentPlanId: 'plan_123' } });
      }
      if (url.includes('/payments/retry/')) {
        return Promise.resolve({ data: { paymentIntentId: 'pi_retry_123' } });
      }
      return Promise.resolve({ data: {} });
    });

    render(<InstallmentPayment />);

    await waitFor(() => {
      expect(screen.getByText('Installment Payment Plan')).toBeInTheDocument();
    });

    apiUtils.post.mockClear();
    apiUtils.post(API_ENDPOINTS.PAYMENTS.RETRY('pay_999'));

    expect(apiUtils.post).toHaveBeenCalledWith(API_ENDPOINTS.PAYMENTS.RETRY('pay_999'));
  });
});
