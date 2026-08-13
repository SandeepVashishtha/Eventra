# Installment Payments via Stripe - Implementation Guide

## Feature Overview

This implementation adds support for partial payments/installments via Stripe's payment API, allowing attendees to:
- Pay 25% upfront to secure their high-ticket conference registration
- Have the remaining balance automatically billed over 3 monthly installments leading up to the event date
- Have their ticket QR code activated only after the final installment is paid

This addresses the problem of cart abandonment for expensive multi-day conferences ($1,000+) by providing more flexible payment options.

## Implementation Details

### Backend Components (Java/Spring Boot)

#### 1. Database Models

**Payment.java** (`Backend/src/main/java/com/sandeep/eventrabackend/model/Payment.java`)
- Represents individual payment transactions
- Tracks amount, currency, status (PENDING, COMPLETED, FAILED, REFUNDED)
- Supports installment tracking with installmentNumber and totalInstallments
- Stores Stripe-specific IDs (payment_intent_id, customer_id, etc.)
- Includes timestamps for due dates, payment completion, and failures

**PaymentPlan.java** (`Backend/src/main/java/com/sandeep/eventrabackend/model/PaymentPlan.java`)
- Represents the overall payment plan for a registration
- Configures installment structure (4 installments by default: 25% upfront + 3 monthly)
- Tracks total amount, currency, and individual installment amounts
- Manages Stripe customer and subscription relationships
- Controls QR code activation status

**EventRegistration.java** - Extended with:
- `ticketPrice` - The total ticket price
- `paymentStatus` - Current payment status (PENDING, PARTIAL, COMPLETED, FAILED, REFUNDED)
- `paymentMethod` - Payment method used (CARD, etc.)
- `paymentProvider` - Payment provider (STRIPE)
- `stripePaymentIntentId` - Stripe payment intent reference
- `stripeCustomerId` - Stripe customer reference
- `qrActivated` - Whether QR code is activated for check-in
- `qrActivationDate` - When QR code was activated

#### 2. Repositories

**PaymentRepository.java**
- CRUD operations for Payment entities
- Query methods for finding payments by registration, Stripe IDs, and status
- Methods for counting completed payments
- Support for finding overdue payments

**PaymentPlanRepository.java**
- CRUD operations for PaymentPlan entities
- Query methods for finding plans by registration, event, user, and Stripe IDs
- Methods for finding active/completed plans by event

#### 3. Services

**StripeService.java**
- Core integration with Stripe API
- Customer creation and management
- Setup Intent creation for saving payment methods
- Payment Intent creation and confirmation for upfront and installment payments
- Subscription management for recurring payments
- Webhook signature verification and event handling
- Installment schedule calculation
- Payment method management (attach/detach, list)
- Refund processing

**PaymentPlanService.java**
- Business logic for payment plans
- Payment plan creation with automatic installment calculation
- Stripe customer and payment method setup
- Upfront payment processing and installment scheduling
- Payment status tracking and management
- QR code activation logic (only after final installment)
- Payment retry functionality
- Cancellation and cleanup

**QrCodeValidationService.java** - Enhanced with:
- Payment completion validation before QR code activation
- New status codes: PAYMENT_PENDING, PAYMENT_INCOMPLETE
- Overloaded methods to accept registration ID for payment checking
- Helper method to check QR activation status

#### 4. Controllers

**PaymentController.java** (`Backend/src/main/java/com/sandeep/eventrabackend/controller/PaymentController.java`)
- REST API endpoints for payment operations
- Endpoints:
  - `POST /api/payments/plans` - Create payment plan
  - `POST /api/payments/initialize/{registrationId}` - Initialize Stripe customer
  - `POST /api/payments/setup-method/{paymentPlanId}` - Setup payment method
  - `POST /api/payments/confirm-upfront/{paymentPlanId}` - Confirm upfront payment
  - `GET /api/payments/plans/{registrationId}` - Get payment plan status
  - `GET /api/payments/registrations/{registrationId}` - Get all payments for registration
  - `GET /api/payments/schedule/{registrationId}` - Get installment schedule
  - `POST /api/payments/retry/{paymentId}` - Retry failed payment
  - `GET /api/payments/methods/{registrationId}` - Get customer payment methods
  - `GET /api/payments/qr-status/{registrationId}` - Check QR activation status
  - `DELETE /api/payments/plans/{paymentPlanId}` - Cancel payment plan
  - `GET /api/payments/active/{registrationId}` - Check for active payment plan
  - `POST /api/payments/webhook` - Stripe webhook endpoint

### Frontend Components (React)

**InstallmentPayment.jsx** (`src/components/events/InstallmentPayment.jsx`)
- Complete payment flow UI for installment payments
- Components:
  - `PaymentStatus` - Displays success/error states
  - `InstallmentSchedule` - Shows all installment payments with status
  - `PaymentForm` - Stripe card input form for payment
  - Main component with full payment flow

Features:
- Stripe Elements integration for secure card input
- Upfront payment (25%) processing
- Installment schedule display
- Payment status tracking
- Error handling and retry functionality
- Progress indicators
- Responsive design

### Configuration

#### Backend Configuration

Add to `application.properties` or `application.yml`:
```properties
# Stripe API key (from Stripe Dashboard)
stripe.api.key=sk_test_your_secret_key

# Stripe webhook secret (from Stripe Dashboard)
stripe.webhook.secret=whsec_your_webhook_secret
```

#### Frontend Configuration

Add to `.env`:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
VITE_API_URL=http://localhost:8080/api
```

#### Dependencies

Backend (`pom.xml`):
```xml
<dependency>
    <groupId>com.stripe</groupId>
    <artifactId>stripe-java</artifactId>
    <version>25.0.0</version>
</dependency>
```

Frontend (`package.json`):
```json
{
  "@stripe/react-stripe-js": "^2.8.0",
  "@stripe/stripe-js": "^4.0.0"
}
```

### Database Schema

The implementation creates two new tables:

**payments**
```sql
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    registration_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(50) NOT NULL DEFAULT 'USD',
    payment_method VARCHAR(50) NOT NULL,
    payment_provider VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    installment_number INTEGER,
    total_installments INTEGER,
    stripe_payment_intent_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    due_date TIMESTAMP,
    paid_at TIMESTAMP,
    failed_at TIMESTAMP,
    failure_reason VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    webhook_data TEXT,
    FOREIGN KEY (registration_id) REFERENCES event_registrations(id)
);
```

**payment_plans**
```sql
CREATE TABLE payment_plans (
    id BIGSERIAL PRIMARY KEY,
    registration_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(50) NOT NULL DEFAULT 'USD',
    total_installments INTEGER NOT NULL DEFAULT 4,
    installment_amount DECIMAL(10,2) NOT NULL,
    payment_provider VARCHAR(50) NOT NULL DEFAULT 'STRIPE',
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    upfront_percentage INTEGER DEFAULT 25,
    stripe_customer_id VARCHAR(255),
    stripe_setup_intent_id VARCHAR(255),
    stripe_payment_method_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    start_date TIMESTAMP,
    next_payment_date TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancelled_reason VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    FOREIGN KEY (registration_id) REFERENCES event_registrations(id)
);
```

### Payment Flow

1. **User registers for event and selects installment payment option**
2. **Payment Plan Creation**: Backend creates PaymentPlan with 4 installments (25% + 3 monthly)
3. **Stripe Initialization**: Frontend requests Stripe customer creation and setup intent
4. **Payment Method Setup**: User enters card details via Stripe Elements
5. **Upfront Payment**: 25% is charged immediately via PaymentIntent
6. **Installment Scheduling**: Remaining 3 payments are scheduled with calculated due dates
7. **Payment Processing**: Stripe automatically charges on due dates, webhooks update payment status
8. **Final Installment**: After 4th payment completes, QR code is activated
9. **QR Validation**: Check-in system validates payment completion before allowing entry

### Webhook Configuration

Configure Stripe webhook to point to:
```
POST https://yourdomain.com/api/payments/webhook
```

Events to subscribe to:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.succeeded`
- `charge.failed`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### Security Considerations

- All API endpoints are protected with `@PreAuthorize` annotations
- Stripe webhook signatures are verified before processing
- Sensitive payment data is handled by Stripe directly (PCI compliance)
- Only non-sensitive metadata is stored in the database
- Frontend uses Stripe.js for secure card input (no card data touches your servers)

### Error Handling

- Failed payments are automatically tracked and can be retried
- Users receive clear error messages for payment failures
- Payment plan can be cancelled by user or admin
- Failed payments trigger notifications (can be extended with email/SMS)

### Testing

The implementation can be tested with Stripe test cards:
- Success: `4242 4242 4242 4242`
- Requires authentication: `4000 0000 0000 3220`
- Decline: `4000 0000 0000 0002`

### API Examples

Create Payment Plan:
```bash
POST /api/payments/plans?registrationId=123&ticketPrice=1200.00&currency=USD&upfrontPercentage=25&totalInstallments=4
```

Initialize Stripe:
```bash
POST /api/payments/initialize/123
```

Confirm Upfront Payment:
```bash
POST /api/payments/confirm-upfront/456
Content-Type: application/json

{
  "paymentMethodId": "pm_123456789"
}
```

Get Payment Status:
```bash
GET /api/payments/plans/123
```

### Integration Points

To integrate installment payments into the existing codebase:

1. **Registration Flow**: Add option to select "Pay with Installments" during checkout
2. **Payment Status**: Display payment status on user dashboard and registration details
3. **QR Code**: Modify QR code display to show payment status and activation date
4. **Email Notifications**: Send payment receipts and reminders for upcoming installments
5. **Admin Dashboard**: Add payment reports and management for organizers

### Benefits

1. **Reduced Cart Abandonment**: Users can secure tickets with smaller upfront payment
2. **Increased Revenue**: More conversions for high-ticket events
3. **Better Cash Flow**: Organizer receives 25% immediately, rest over time
4. **Improved User Experience**: Flexible payment options for expensive conferences
5. **Data Consolidation**: All payment data in Stripe dashboard with native integration

### Future Enhancements

1. Multiple payment plan options (different percentages/intervals)
2. Automatic email reminders before installment due dates
3. Admin override for manual payment processing
4. Integration with other payment providers (PayPal, etc.)
5. Analytics dashboard for payment performance
6. Mobile wallet support (Apple Pay, Google Pay)
7. Multi-currency support with automatic conversion

---

**Implementation Date**: August 12, 2026
**Issue Reference**: #11925
**Feature**: Support partial payments/installments via Stripe
