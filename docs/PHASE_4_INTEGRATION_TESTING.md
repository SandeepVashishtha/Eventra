# Phase 4: Integration & Testing

Phase 4 connects the async validation utilities and validation UI components to the real authentication forms.

## What Was Integrated

- `src/validation.js` reusable validators
- `FormFieldWrapper` for field labels, messages, icons, and ARIA attributes
- `ValidationMessage` for global form feedback
- Async email availability checks in signup
- Password strength validation in signup
- Reusable synchronous validation in login

## Forms Updated

### SignupForm.js

`SignupForm.js` now uses shared validators for:

- first name
- last name
- email format
- email availability
- password strength
- confirm password matching

Email availability runs asynchronously after the user enters a valid email format. The email input announces loading with `aria-busy="true"` and shows either success or error state once validation completes.

### LoginForm.js

`LoginForm.js` now uses reusable validation helpers for:

- email or username required validation
- email format validation when the value contains `@`
- password required and minimum length validation

No async availability validation was added to login because login should not reveal whether an account exists before authentication.

## How UI Components Are Used

`FormFieldWrapper` wraps the auth fields and applies:

- `aria-describedby`
- `aria-invalid`
- `aria-busy`
- `aria-required`

`ValidationMessage` is used for global signup/login feedback while field messages are rendered through `FormFieldWrapper`.

## Testing Strategy

Tests cover:

- required field errors
- invalid email errors
- password validation errors
- async email loading state
- async email success state
- async email error state
- blocked submissions when validation fails
- allowed submissions when validation passes
- accessibility attributes such as `aria-invalid`, `aria-busy`, and `aria-describedby`

## Test Command

```bash
npm.cmd test -- --watchAll=false src/components/auth/__tests__/SignupForm.test.jsx src/components/auth/__tests__/LoginForm.test.jsx src/components/forms/__tests__/ValidationStatusIcon.test.jsx src/components/forms/__tests__/ValidationMessage.test.jsx src/components/forms/__tests__/FormFieldWrapper.test.jsx
```

## Known Limitations

- Signup currently has no username or phone field, so username uniqueness and phone validation are available in utilities but not wired into this form.
- Email availability depends on the backend validation endpoint being available in production.
- Login intentionally avoids async account availability checks to prevent account enumeration hints.

## Future Improvements

- Add username validation if the signup flow adds a username field.
- Add phone validation if profile or signup forms collect phone numbers.
- Move repeated auth field style strings into shared constants once more forms adopt these wrappers.

## Playwright End-to-End Integration Testing Guidelines

To ensure the reliability of critical user paths (including signup, login, event details, and calendar integration), Eventra utilizes **Playwright** for high-fidelity browser automation and end-to-end integration testing.

### Directory Structure

All E2E spec files are located in `tests/e2e/`:
- `tests/e2e/smoke.spec.js` - Smoke tests to verify main pages are rendering.
- `tests/e2e/auth.spec.js` - Complete verification of authentication workflows and validation messages.
- `tests/e2e/signup.spec.js` - Verification of async signup validation states, confirmation mismatch errors, and ARIA attributes.
- `tests/e2e/http_cookie.spec.js` - Verification of secure cookie handling.

### How to Run E2E Tests

1. **Start the local Dev Server**:
   Ensure the frontend development server and mock APIs are running:
   ```bash
   npm run dev
   ```

2. **Execute all E2E Tests**:
   Run Playwright tests in headless mode (default):
   ```bash
   npx playwright test
   ```

3. **Run in UI / Interactive Mode**:
   Open the Playwright Test Runner UI for debugging and step-by-step visual exploration:
   ```bash
   npx playwright test --ui
   ```

4. **Debug a Specific Test**:
   ```bash
   npx playwright test tests/e2e/auth.spec.js --debug
   ```

### Best Practices for Writing E2E Tests in Eventra

1. **Aria-Role and Test-ID Selectors**:
   Prefer using semantic role queries or user-facing elements instead of raw CSS class names to ensure accessibility and CSS-resilient selectors:
   ```javascript
   // Recommended
   await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com');
   
   // Resilient fallback using data-testid
   await page.getByTestId('signup-submit').click();
   ```

2. **API Mocking and Interception**:
   Intercept backend API requests using `page.route` to isolate frontend behaviors and verify fallback routes during network outages:
   ```javascript
   await page.route('**/api/events/*', async route => {
     await route.fulfill({
       status: 500,
       contentType: 'application/json',
       body: JSON.stringify({ message: 'Internal Server Error' })
     });
   });
   ```

3. **Isolated Test State**:
   Always clear storage states, recently viewed event lists, and cookies before running each test block to prevent side effects:
   ```javascript
   test.beforeEach(async ({ page }) => {
     await page.goto('/');
     await page.evaluate(() => localStorage.clear());
   });
   ```

4. **Verify Loading and skeleton states**:
   Assert that loading skeleton elements have `aria-busy="true"` and are successfully replaced by fully interactive components when async tasks resolve.

