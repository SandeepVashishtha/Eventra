import React, { useState, useEffect, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useParams, useNavigate } from 'react-router-dom';
import { apiUtils, API_ENDPOINTS } from '../../config/api';

// Stripe publishable key (should be configured via environment variables)
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key';

// Load Stripe.js
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

/**
 * InstallmentPayment Component
 * 
 * This component provides functionality for:
 * - Displaying installment payment options for high-ticket events
 * - Setting up Stripe payment method
 * - Making upfront payment (25%)
 * - Displaying payment schedule and status
 * - Retrying failed payments
 */

// Payment status component
const PaymentStatus = ({ status, message, onRetry }) => {
  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-green-600 text-xl">✓</span>
        </div>
        <h3 className="text-lg font-bold text-green-800 mb-2">Payment Successful!</h3>
        <p className="text-green-700 text-sm">{message}</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-red-600 text-xl">✗</span>
        </div>
        <h3 className="text-lg font-bold text-red-800 mb-2">Payment Failed</h3>
        <p className="text-red-700 text-sm mb-3">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return null;
};

// Installment schedule display
const InstallmentSchedule = ({ schedule, currency }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Installment Schedule</h3>
      <div className="space-y-3">
        {schedule.map((installment, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(installment.status)}`}
          >
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-gray-700">
                {installment.installmentNumber}
              </span>
              <div>
                <p className="font-medium text-gray-900">
                  Installment {installment.installmentNumber}
                </p>
                <p className="text-xs text-gray-600">
                  Due: {installment.dueDate ? new Date(installment.dueDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900">
                {currency}{installment.amount?.toFixed(2) || '0.00'}
              </p>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(installment.status)}`}>
                {installment.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Payment form component
const PaymentForm = ({ amount, currency, onSuccess, onError, disabled }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setCardError(null);

    try {
      // Get the card element
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment method
      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        setCardError(error.message);
        onError(error.message);
        setIsProcessing(false);
        return;
      }

      // Call the backend to confirm the payment
      onSuccess(paymentMethod.id);
      
    } catch (err) {
      setCardError(err.message);
      onError(err.message);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Payment Details</h3>
          <div className="text-2xl">💳</div>
        </div>
        
        <div className="space-y-4">
          <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
            <CardElement 
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#374151',
                    '::placeholder': {
                      color: '#9CA3AF',
                    },
                  },
                  invalid: {
                    color: '#EF4444',
                  },
                },
              }}
            />
          </div>
          
          {cardError && (
            <p className="text-red-600 text-sm">{cardError}</p>
          )}
          
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-700 mb-1">Amount to pay</p>
            <p className="text-3xl font-bold text-blue-900">
              {currency}{amount?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>
      </div>
      
      <button
        type="submit"
        disabled={isProcessing || disabled || !stripe}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed 
                   text-white font-bold py-4 rounded-xl transition duration-200 flex items-center justify-center"
      >
        {isProcessing ? (
          <>
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            Processing Payment...
          </>
        ) : (
          `Pay ${currency}${amount?.toFixed(2) || '0.00'}`
        )}
      </button>
      
      <p className="text-center text-xs text-gray-500">
        Secured by Stripe • Your payment information is encrypted
      </p>
    </form>
  );
};

// Main InstallmentPayment component
const InstallmentPayment = () => {
  const { eventId, registrationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentPlan, setPaymentPlan] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [setupIntent, setSetupIntent] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [actionRequired, setActionRequired] = useState(false);

  // Fetch payment plan details
  const fetchPaymentPlan = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiUtils.get(API_ENDPOINTS.PAYMENTS.PLANS(registrationId));
      
      setPaymentPlan(response.data);
      
      // If payment plan is completed, redirect or show success
      if (response.data?.paymentStatus === 'COMPLETED') {
        setSuccess(true);
        setPaymentMessage('All installments completed! Your QR code is now activated.');
      }
      
    } catch (err) {
      console.error('Error fetching payment plan:', err);
      setError('Failed to load payment information. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [registrationId]);

  // Initialize Stripe customer and setup intent
  const initializeStripe = useCallback(async () => {
    try {
      const response = await apiUtils.post(API_ENDPOINTS.PAYMENTS.INITIALIZE(registrationId));
      
      setSetupIntent(response.data);
      return response.data;
      
    } catch (err) {
      console.error('Error initializing Stripe:', err);
      setError('Failed to initialize payment. Please try again.');
      return null;
    }
  }, [registrationId]);

  // Setup payment method and create upfront payment intent
  const setupPaymentMethod = useCallback(async (paymentMethodId) => {
    try {
      if (!setupIntent?.paymentPlanId) {
        throw new Error('Payment plan not initialized');
      }
      
      const response = await apiUtils.post(
        API_ENDPOINTS.PAYMENTS.SETUP_METHOD(setupIntent.paymentPlanId),
        { paymentMethodId }
      );
      
      setPaymentIntent(response.data);
      setActionRequired(true);
      return response.data;
      
    } catch (err) {
      console.error('Error setting up payment method:', err);
      throw err;
    }
  }, [setupIntent]);

  // Confirm upfront payment
  const confirmUpfrontPayment = useCallback(async (paymentMethodId) => {
    try {
      if (!paymentIntent?.paymentIntentId) {
        throw new Error('Payment intent not created');
      }
      
      const response = await apiUtils.post(
        API_ENDPOINTS.PAYMENTS.CONFIRM_UPFRONT(setupIntent.paymentPlanId),
        { paymentMethodId }
      );
      
      return response.data;
      
    } catch (err) {
      console.error('Error confirming payment:', err);
      throw err;
    }
  }, [paymentIntent, setupIntent]);

  // Handle payment submission
  const handlePayment = useCallback(async (paymentMethodId) => {
    try {
      setLoading(true);
      setError(null);
      setPaymentStatus(null);
      
      // Setup payment method
      const setupResponse = await setupPaymentMethod(paymentMethodId);
      
      if (!setupResponse) {
        throw new Error('Payment method setup failed');
      }
      
      // Confirm upfront payment
      const confirmResponse = await confirmUpfrontPayment(paymentMethodId);
      
      if (confirmResponse?.success) {
        setSuccess(true);
        setPaymentStatus('success');
        setPaymentMessage('Upfront payment completed! Your ticket is secured. Remaining installments will be automatically charged.');
        
        // Refresh payment plan
        await fetchPaymentPlan();
        
        // Show success for 5 seconds, then redirect
        setTimeout(() => {
          navigate(`/events/${eventId}/registration/${registrationId}/ticket`);
        }, 5000);
        
      } else {
        setPaymentStatus('error');
        setPaymentMessage(confirmResponse?.error || 'Payment failed. Please try again.');
      }
      
    } catch (err) {
      setPaymentStatus('error');
      setPaymentMessage(err.message || 'Payment processing failed. Please try again.');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setupPaymentMethod, confirmUpfrontPayment, fetchPaymentPlan, eventId, registrationId, navigate]);

  // Handle retry failed payment
  const handleRetryPayment = useCallback(async (paymentId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiUtils.post(
        API_ENDPOINTS.PAYMENTS.RETRY(paymentId)
      );
      
      setPaymentIntent(response.data);
      setActionRequired(true);
      setPaymentStatus(null);
      
    } catch (err) {
      setError('Failed to retry payment. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load payment plan on mount
  useEffect(() => {
    fetchPaymentPlan();
  }, [fetchPaymentPlan]);

  // Initialize Stripe when payment plan is loaded
  useEffect(() => {
    if (paymentPlan && !setupIntent && !success) {
      initializeStripe();
    }
  }, [paymentPlan, setupIntent, success, initializeStripe]);

  // Format currency display
  const formatCurrency = (amount) => {
    if (!amount) return '0.00';
    return typeof amount === 'number' ? amount.toFixed(2) : amount;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment information...</p>
        </div>
      </div>
    );
  }

  if (error && !paymentPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-red-200 p-6 max-w-md mx-4 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Payment</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => navigate(`/events/${eventId}/registration/${registrationId}`)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            Back to Registration
          </button>
        </div>
      </div>
    );
  }

  // Payment completed state
  if (success && paymentPlan?.paymentStatus === 'COMPLETED') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">✓</span>
                <h1 className="text-2xl font-bold">Payment Complete!</h1>
              </div>
              <p className="text-green-100">
                All installments have been paid. Your ticket QR code is now activated and ready for event check-in.
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Total Amount Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${formatCurrency(paymentPlan?.totalAmount)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Installments Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {paymentPlan?.completedInstallments || paymentPlan?.totalInstallments || 0}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">QR Code Status</p>
                  <p className="text-2xl font-bold text-green-600">✓ Activated</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate(`/events/${eventId}/registration/${registrationId}/ticket`)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition"
                >
                  View My Ticket & QR Code
                </button>
                <button
                  onClick={() => navigate(`/events/${eventId}`)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 rounded-xl transition"
                >
                  Back to Event
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">💳</span>
                <h1 className="text-2xl font-bold">Installment Payment Plan</h1>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm">Powered by Stripe</p>
                <p className="text-xs text-blue-200">Secure • Encrypted</p>
              </div>
            </div>
            <p className="text-blue-100 mt-3 text-sm">
              Pay 25% upfront to secure your ticket, with the remainder automatically billed over 3 months
            </p>
          </div>

          <div className="p-6">
            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mr-3">
                    1
                  </span>
                  <span className="text-lg font-medium text-gray-900">Payment Setup</span>
                </div>
                <div className="flex-1 h-1 bg-gray-200 rounded-full mx-4">
                  <div className={`h-1 rounded-full transition-all ${paymentPlan ? 'bg-blue-600 w-1/3' : 'bg-gray-200 w-0'}`}></div>
                </div>
                <div className="flex items-center">
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mr-3 ${
                    paymentPlan ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    2
                  </span>
                  <span className="text-lg font-medium text-gray-500">Confirmation</span>
                </div>
                <div className="flex-1 h-1 bg-gray-200 rounded-full mx-4">
                  <div className="h-1 rounded-full bg-gray-200 w-0"></div>
                </div>
                <div className="flex items-center">
                  <span className="w-10 h-10 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center text-lg font-bold mr-3">
                    3
                  </span>
                  <span className="text-lg font-medium text-gray-500">Complete</span>
                </div>
              </div>
            </div>

            {/* Payment summary */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ticket Price</span>
                  <span className="font-bold text-gray-900">
                    ${formatCurrency(paymentPlan?.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Upfront Payment (25%)</span>
                  <span className="font-bold text-blue-600">
                    ${formatCurrency(paymentPlan?.upfrontAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Remaining Amount</span>
                  <span className="font-bold text-gray-900">
                    ${formatCurrency(paymentPlan?.remainingAmount)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total to pay today</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${formatCurrency(paymentPlan?.upfrontAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Installment schedule */}
            {paymentPlan?.payments && paymentPlan.payments.length > 0 && (
              <InstallmentSchedule 
                schedule={paymentPlan.payments} 
                currency="$" 
              />
            )}

            {/* Payment status message */}
            {paymentStatus && (
              <div className="mb-6">
                <PaymentStatus 
                  status={paymentStatus} 
                  message={paymentMessage}
                  onRetry={() => handleRetryPayment(paymentPlan?.payments?.[0]?.id)} 
                />
              </div>
            )}

            {/* Payment form */}
            {setupIntent && actionRequired && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <Elements stripe={stripePromise}>
                  <PaymentForm
                    amount={paymentPlan?.upfrontAmount}
                    currency="$"
                    onSuccess={handlePayment}
                    onError={(err) => {
                      setPaymentStatus('error');
                      setPaymentMessage(err);
                    }}
                    disabled={loading || success}
                  />
                </Elements>
              </div>
            )}

            {/* Stripe not loaded */}
            {setupIntent && !actionRequired && !success && !paymentStatus && (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Loading payment form...</p>
                <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={() => navigate(`/events/${eventId}/registration/${registrationId}`)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl transition"
              >
                Back to Registration
              </button>
              {paymentPlan?.paymentStatus === 'COMPLETED' && (
                <button
                  onClick={() => navigate(`/events/${eventId}/registration/${registrationId}/ticket`)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition"
                >
                  View Ticket & QR Code
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrapper component for Stripe Elements
const StripeInstallmentPayment = () => {
  return (
    <Elements stripe={stripePromise}>
      <InstallmentPayment />
    </Elements>
  );
};

export default StripeInstallmentPayment;
