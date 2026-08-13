import { test, expect } from '@playwright/test';

test.describe('Authentication Flow E2E Comprehensive Test Suite', () => {

  // =========================================================================
  // 1. LOGIN FORM VALIDATION & CORE UI ELEMENTS
  // =========================================================================
  test.describe('1. Login Form UI and Client Validation', () => {

    test('User can navigate to Login page and see form elements', async ({ page }) => {
      await page.goto('/login');
      
      const heading = page.getByRole('heading', { name: /Welcome Back/i }).first();
      await expect(heading).toBeVisible();

      const usernameInput = page.locator('input[name="usernameOrEmail"]');
      await expect(usernameInput).toBeVisible();
      await expect(usernameInput).toBeEditable();

      const passwordInput = page.locator('input[name="password"]');
      await expect(passwordInput).toBeVisible();
      await expect(passwordInput).toBeEditable();

      const submitButton = page.getByRole('button', { name: /Sign In/i, exact: true }).first();
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toBeEnabled();

      const rememberMeCheckbox = page.locator('input[name="rememberMe"]');
      await expect(rememberMeCheckbox).toBeVisible();
      await expect(rememberMeCheckbox).not.toBeChecked();

      const forgotPasswordLink = page.getByRole('link', { name: /Forgot password\?/i });
      await expect(forgotPasswordLink).toBeVisible();
      await expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
    });

    test('Login form shows validation errors on empty submission', async ({ page }) => {
      await page.goto('/login');
      
      const submitButton = page.getByRole('button', { name: /Sign In/i, exact: true }).first();
      await submitButton.click();

      await expect(page.getByText(/Email or username is required/i)).toBeVisible();
      await expect(page.getByText(/Password is required/i)).toBeVisible();
    });

    test('Login form validates short passwords', async ({ page }) => {
      await page.goto('/login');
      
      const usernameInput = page.locator('input[name="usernameOrEmail"]');
      await usernameInput.fill('testuser');

      const passwordInput = page.locator('input[name="password"]');
      await passwordInput.fill('123');

      const submitButton = page.getByRole('button', { name: /Sign In/i, exact: true }).first();
      await submitButton.click();

      await expect(page.getByText(/Password must be at least 8 characters long/i)).toBeVisible();
    });

    test('Login form clears error messages when valid input is typed', async ({ page }) => {
      await page.goto('/login');
      
      const submitButton = page.getByRole('button', { name: /Sign In/i, exact: true }).first();
      await submitButton.click();

      const usernameError = page.getByText(/Email or username is required/i);
      await expect(usernameError).toBeVisible();

      const usernameInput = page.locator('input[name="usernameOrEmail"]');
      await usernameInput.fill('validuser@example.com');

      await expect(usernameError).not.toBeVisible();
    });

    test('Password visibility toggle toggles input type between password and text', async ({ page }) => {
      await page.goto('/login');

      const passwordInput = page.locator('input[name="password"]');
      await passwordInput.fill('SecretPassword123!');

      await expect(passwordInput).toHaveAttribute('type', 'password');

      const toggleButton = page.getByRole('button', { name: /show password|toggle password visibility/i });
      await toggleButton.click();

      await expect(passwordInput).toHaveAttribute('type', 'text');

      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('Trims whitespace from email input on login submission', async ({ page }) => {
      await page.goto('/login');

      let capturedPayload: any = null;
      await page.route('**/api/v1/auth/login', async (route) => {
        capturedPayload = JSON.parse(route.request().postData() || '{}');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ token: 'fake-jwt-token', user: { id: 1, email: 'user@example.com' } }),
        });
      });

      await page.locator('input[name="usernameOrEmail"]').fill('   user@example.com   ');
      await page.locator('input[name="password"]').fill('ValidPass123!');
      await page.getByRole('button', { name: /Sign In/i, exact: true }).click();

      expect(capturedPayload).not.toBeNull();
      expect(capturedPayload.usernameOrEmail).toBe('user@example.com');
    });

  });

  // =========================================================================
  // 2. SIGNUP FORM VALIDATION & REGISTRATION FLOWS
  // =========================================================================
  test.describe('2. Signup Form UI and Registration Validation', () => {

    test('User can navigate to Signup page and see form elements', async ({ page }) => {
      await page.goto('/signup');
      
      const heading = page.getByRole('heading', { name: /Create an Account/i }).first();
      await expect(heading).toBeVisible();

      await expect(page.locator('input[name="firstName"]')).toBeVisible();
      await expect(page.locator('input[name="lastName"]')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="username"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
      await expect(page.locator('input[name="acceptTerms"]')).toBeVisible();

      const submitButton = page.getByRole('button', { name: /Sign Up/i, exact: true }).first();
      await expect(submitButton).toBeVisible();
    });

    test('Signup form shows validation errors on empty submission', async ({ page }) => {
      await page.goto('/signup');
      
      const submitButton = page.getByRole('button', { name: /Sign Up/i, exact: true }).first();
      await submitButton.click();

      await expect(page.getByText(/First name is required/i)).toBeVisible();
      await expect(page.getByText(/Last name is required/i)).toBeVisible();
      await expect(page.getByText(/Email is required/i)).toBeVisible();
      await expect(page.getByText(/Username is required/i)).toBeVisible();
      await expect(page.getByText(/Password is required/i)).toBeVisible();
    });

    test('Signup form detects password and confirm password mismatch', async ({ page }) => {
      await page.goto('/signup');

      await page.locator('input[name="firstName"]').fill('John');
      await page.locator('input[name="lastName"]').fill('Doe');
      await page.locator('input[name="email"]').fill('john.doe@example.com');
      await page.locator('input[name="username"]').fill('johndoe');
      await page.locator('input[name="password"]').fill('Password123!');
      await page.locator('input[name="confirmPassword"]').fill('Password456!');

      await page.getByRole('button', { name: /Sign Up/i, exact: true }).click();

      await expect(page.getByText(/Passwords do not match/i)).toBeVisible();
    });

    test('Signup requires terms and conditions acceptance', async ({ page }) => {
      await page.goto('/signup');

      await page.locator('input[name="firstName"]').fill('John');
      await page.locator('input[name="lastName"]').fill('Doe');
      await page.locator('input[name="email"]').fill('john.doe@example.com');
      await page.locator('input[name="username"]').fill('johndoe');
      await page.locator('input[name="password"]').fill('Password123!');
      await page.locator('input[name="confirmPassword"]').fill('Password123!');

      // Submit without checking terms
      await page.getByRole('button', { name: /Sign Up/i, exact: true }).click();

      await expect(page.getByText(/You must accept the terms and conditions/i)).toBeVisible();
    });

    test('Signup form validates invalid email formats', async ({ page }) => {
      await page.goto('/signup');

      const invalidEmails = ['invalid-email', 'john@', '@domain.com', 'john.doe@domain', 'john..doe@domain.com'];

      for (const email of invalidEmails) {
        await page.locator('input[name="email"]').fill(email);
        await page.locator('input[name="firstName"]').focus(); // blur email
        await expect(page.getByText(/Please enter a valid email address/i)).toBeVisible();
        await page.locator('input[name="email"]').clear();
      }
    });

  });

  // =========================================================================
  // 3. PASSWORD STRENGTH METER & COMPLEXITY CHECKS
  // =========================================================================
  test.describe('3. Password Complexity and Dynamic Strength Meter', () => {

    test('Password strength indicator dynamically updates strength feedback', async ({ page }) => {
      await page.goto('/signup');

      const passwordInput = page.locator('input[name="password"]');
      const strengthMeter = page.locator('[data-testid="password-strength-meter"]');

      // Weak password
      await passwordInput.fill('123456');
      await expect(strengthMeter).toContainText(/Weak/i);

      // Medium password
      await passwordInput.fill('Password123');
      await expect(strengthMeter).toContainText(/Medium/i);

      // Strong password
      await passwordInput.fill('P@ssw0rd123!Secure');
      await expect(strengthMeter).toContainText(/Strong/i);
    });

    test('Enforces complexity criteria: uppercase, lowercase, number, special character', async ({ page }) => {
      await page.goto('/signup');

      const passwordInput = page.locator('input[name="password"]');
      const submitButton = page.getByRole('button', { name: /Sign Up/i, exact: true });

      // Missing special character
      await passwordInput.fill('Password123');
      await submitButton.click();
      await expect(page.getByText(/Password must contain at least one special character/i)).toBeVisible();

      // Missing uppercase letter
      await passwordInput.fill('password123!');
      await submitButton.click();
      await expect(page.getByText(/Password must contain at least one uppercase letter/i)).toBeVisible();

      // Missing number
      await passwordInput.fill('PasswordWithNoNumber!');
      await submitButton.click();
      await expect(page.getByText(/Password must contain at least one number/i)).toBeVisible();
    });

  });

  // =========================================================================
  // 4. AUTHENTICATION API MOCKING & API ERROR HANDLING
  // =========================================================================
  test.describe('4. API Integration and Network Error Handling', () => {

    test('Successful login redirects user to dashboard and stores token', async ({ page }) => {
      await page.route('**/api/v1/auth/login', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake-jwt-token',
            user: { id: 101, username: 'johndoe', email: 'john@example.com', role: 'USER' }
          }),
        });
      });

      await page.goto('/login');
      await page.locator('input[name="usernameOrEmail"]').fill('johndoe');
      await page.locator('input[name="password"]').fill('CorrectPassword123!');
      await page.getByRole('button', { name: /Sign In/i, exact: true }).click();

      await expect(page).toHaveURL('/dashboard');
      
      const tokenInStorage = await page.evaluate(() => localStorage.getItem('auth_token'));
      expect(tokenInStorage).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake-jwt-token');
    });

    test('Handles 401 Unauthorized API response gracefully', async ({ page }) => {
      await page.route('**/api/v1/auth/login', async (route) => {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Invalid credentials provided. Please check your username and password.' }),
        });
      });

      await page.goto('/login');
      await page.locator('input[name="usernameOrEmail"]').fill('wronguser');
      await page.locator('input[name="password"]').fill('WrongPassword123!');
      await page.getByRole('button', { name: /Sign In/i, exact: true }).click();

      const alertBox = page.locator('[role="alert"]');
      await expect(alertBox).toBeVisible();
      await expect(alertBox).toContainText(/Invalid credentials provided/i);
      await expect(page).toHaveURL('/login');
    });

    test('Handles 500 Internal Server Error with generic error toast', async ({ page }) => {
      await page.route('**/api/v1/auth/login', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal Server Error' }),
        });
      });

      await page.goto('/login');
      await page.locator('input[name="usernameOrEmail"]').fill('johndoe');
      await page.locator('input[name="password"]').fill('ValidPassword123!');
      await page.getByRole('button', { name: /Sign In/i, exact: true }).click();

      await expect(page.getByText(/An unexpected server error occurred. Please try again later/i)).toBeVisible();
    });

    test('Disables submit button and shows loading spinner during API request', async ({ page }) => {
      await page.route('**/api/v1/auth/login', async (route) => {
        // Delay response by 2 seconds
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await route.fulfill({ status: 200, body: JSON.stringify({ token: 'abc' }) });
      });

      await page.goto('/login');
      await page.locator('input[name="usernameOrEmail"]').fill('johndoe');
      await page.locator('input[name="password"]').fill('ValidPassword123!');

      const submitButton = page.getByRole('button', { name: /Sign In/i, exact: true });
      await submitButton.click();

      await expect(submitButton).toBeDisabled();
      await expect(page.locator('[aria-busy="true"]')).toBeVisible();
    });

  });

  // =========================================================================
  // 5. TWO-FACTOR AUTHENTICATION (2FA / MFA) FLOW
  // =========================================================================
  test.describe('5. Two-Factor Authentication (2FA) Challenge', () => {

    test('Prompts for 2FA OTP code when account requires multi-factor authentication', async ({ page }) => {
      await page.route('**/api/v1/auth/login', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            mfaRequired: true,
            mfaToken: 'temp-mfa-session-token-12345',
            method: 'TOTP'
          }),
        });
      });

      await page.goto('/login');
      await page.locator('input[name="usernameOrEmail"]').fill('mfauser');
      await page.locator('input[name="password"]').fill('Password123!');
      await page.getByRole('button', { name: /Sign In/i, exact: true }).click();

      // Expect redirect or view change to 2FA challenge modal/page
      await expect(page.getByRole('heading', { name: /Two-Factor Authentication/i })).toBeVisible();
      await expect(page.locator('input[name="otpCode"]')).toBeVisible();
    });

    test('Submits 2FA code and redirects to dashboard upon valid code', async ({ page }) => {
      await page.route('**/api/v1/auth/login', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ mfaRequired: true, mfaToken: 'temp-token' }),
        });
      });

      await page.route('**/api/v1/auth/mfa/verify', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ token: 'final-authenticated-jwt' }),
        });
      });

      await page.goto('/login');
      await page.locator('input[name="usernameOrEmail"]').fill('mfauser');
      await page.locator('input[name="password"]').fill('Password123!');
      await page.getByRole('button', { name: /Sign In/i, exact: true }).click();

      const otpInput = page.locator('input[name="otpCode"]');
      await otpInput.fill('123456');

      await page.getByRole('button', { name: /Verify Code/i }).click();

      await expect(page).toHaveURL('/dashboard');
    });

    test('Rejects invalid 2FA code with error message', async ({ page }) => {
      await page.route('**/api/v1/auth/login', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ mfaRequired: true, mfaToken: 'temp-token' }),
        });
      });

      await page.route('**/api/v1/auth/mfa/verify', async (route) => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Invalid 6-digit authentication code.' }),
        });
      });

      await page.goto('/login');
      await page.locator('input[name="usernameOrEmail"]').fill('mfauser');
      await page.locator('input[name="password"]').fill('Password123!');
      await page.getByRole('button', { name: /Sign In/i, exact: true }).click();

      await page.locator('input[name="otpCode"]').fill('000000');
      await page.getByRole('button', { name: /Verify Code/i }).click();

      await expect(page.getByText(/Invalid 6-digit authentication code/i)).toBeVisible();
    });

  });

  // =========================================================================
  // 6. FORGOT PASSWORD & RESET PASSWORD WORKFLOW
  // =========================================================================
  test.describe('6. Forgot Password and Password Reset Link Flow', () => {

    test('User can request password reset email', async ({ page }) => {
      await page.route('**/api/v1/auth/forgot-password', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Password reset link sent to your email.' }),
        });
      });

      await page.goto('/forgot-password');

      await expect(page.getByRole('heading', { name: /Reset Your Password/i })).toBeVisible();

      const emailInput = page.locator('input[name="email"]');
      await emailInput.fill('user@example.com');

      await page.getByRole('button', { name: /Send Reset Link/i }).click();

      await expect(page.getByText(/Password reset link sent to your email/i)).toBeVisible();
    });

    test('Reset password page validates token and submits new password', async ({ page }) => {
      await page.route('**/api/v1/auth/reset-password', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Password successfully updated.' }),
        });
      });

      await page.goto('/reset-password?token=valid-reset-token-999');

      await page.locator('input[name="newPassword"]').fill('BrandNewPassword123!');
      await page.locator('input[name="confirmNewPassword"]').fill('BrandNewPassword123!');

      await page.getByRole('button', { name: /Update Password/i }).click();

      await expect(page.getByText(/Password successfully updated/i)).toBeVisible();
      await expect(page).toHaveURL('/login?resetSuccess=true');
    });

    test('Reset password page displays error on expired or invalid token', async ({ page }) => {
      await page.route('**/api/v1/auth/reset-password', async (route) => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Password reset token is invalid or has expired.' }),
        });
      });

      await page.goto('/reset-password?token=expired-token-000');

      await page.locator('input[name="newPassword"]').fill('BrandNewPassword123!');
      await page.locator('input[name="confirmNewPassword"]').fill('BrandNewPassword123!');

      await page.getByRole('button', { name: /Update Password/i }).click();

      await expect(page.getByText(/Password reset token is invalid or has expired/i)).toBeVisible();
    });

  });

  // =========================================================================
  // 7. MAGIC LINK / PASSWORDLESS AUTHENTICATION
  // =========================================================================
  test.describe('7. Magic Link Authentication', () => {

    test('User can request passwordless magic link', async ({ page }) => {
      await page.route('**/api/v1/auth/magic-link/request', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Magic link sent! Check your inbox.' }),
        });
      });

      await page.goto('/login');

      const magicLinkTab = page.getByRole('tab', { name: /Passwordless /i });
      if (await magicLinkTab.isVisible()) {
        await magicLinkTab.click();
      } else {
        await page.goto('/login/magic-link');
      }

      await page.locator('input[name="email"]').fill('magic.user@example.com');
      await page.getByRole('button', { name: /Send Magic Link/i }).click();

      await expect(page.getByText(/Magic link sent! Check your inbox/i)).toBeVisible();
    });

    test('Authenticates automatically when opening valid magic link token URL', async ({ page }) => {
      await page.route('**/api/v1/auth/magic-link/verify?token=valid-magic-token', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ token: 'magic-link-jwt-auth-token' }),
        });
      });

      await page.goto('/auth/magic-link/callback?token=valid-magic-token');

      await expect(page.getByText(/Authenticating.../i)).toBeVisible();
      await expect(page).toHaveURL('/dashboard');
    });

  });

  // =========================================================================
  // 8. SOCIAL OAUTH & ENTERPRISE SAML SSO REDIRECTS
  // =========================================================================
  test.describe('8. Social Auth & Enterprise SAML SSO', () => {

    test('Google OAuth button redirects to Google sign-in endpoint', async ({ page }) => {
      await page.goto('/login');

      const googleButton = page.getByRole('button', { name: /Sign in with Google/i });
      await expect(googleButton).toBeVisible();

      const [popup] = await Promise.all([
        page.waitForEvent('popup').catch(() => null),
        googleButton.click(),
      ]);

      if (popup) {
        await expect(popup).toHaveURL(/accounts\.google\.com/i);
      } else {
        await expect(page).toHaveURL(/\/api\/v1\/auth\/oauth\/google/i);
      }
    });

    test('GitHub OAuth button initiates OAuth handshake', async ({ page }) => {
      await page.goto('/login');

      const githubButton = page.getByRole('button', { name: /Sign in with GitHub/i });
      await expect(githubButton).toBeVisible();
      await expect(githubButton).toHaveAttribute('data-provider', 'github');
    });

    test('Enterprise SSO login redirects to Single Sign-On IDP page', async ({ page }) => {
      await page.goto('/login');

      const ssoButton = page.getByRole('button', { name: /Enterprise SSO/i });
      if (await ssoButton.isVisible()) {
        await ssoButton.click();
        
        await page.locator('input[name="workEmail"]').fill('admin@enterprise.com');
        await page.getByRole('button', { name: /Continue with SSO/i }).click();

        await expect(page).toHaveURL(/sso\.enterprise\.com\/saml/i);
      }
    });

  });

  // =========================================================================
  // 9. RATE LIMITING, ACCOUNT LOCKOUT & SECURITY CONTROLS
  // =========================================================================
  test.describe('9. Security Controls, Rate Limiting & Account Lockout', () => {

    test('Triggers rate limit alert after repeated invalid login attempts (429 Too Many Requests)', async ({ page }) => {
      await page.route('**/api/v1/auth/login', async (route) => {
        await route.fulfill({
          status: 429,
          contentType: 'application/json',
          headers: { 'Retry-After': '60' },
          body: JSON.stringify({ message: 'Too many login attempts. Please wait 60 seconds before trying again.' }),
        });
      });

      await page.goto('/login');
      await page.locator('input[name="usernameOrEmail"]').fill('spammer');
      await page.locator('input[name="password"]').fill('WrongPass1!');
      await page.getByRole('button', { name: /Sign In/i, exact: true }).click();

      await expect(page.getByText(/Too many login attempts/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /Sign In/i, exact: true })).toBeDisabled();
    });

    test('Shows temporary lockout modal when account is locked', async ({ page }) => {
      await page.route('**/api/v1/auth/login', async (route) => {
        await route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Account locked due to 5 consecutive failed attempts.', lockedUntil: '15m' }),
        });
      });

      await page.goto('/login');
      await page.locator('input[name="usernameOrEmail"]').fill('lockeduser');
      await page.locator('input[name="password"]').fill('WrongPass1!');
      await page.getByRole('button', { name: /Sign In/i, exact: true }).click();

      await expect(page.getByText(/Account locked due to 5 consecutive failed attempts/i)).toBeVisible();
    });

    test('Sanitizes XSS payload in input fields', async ({ page }) => {
      await page.goto('/login');

      const xssPayload = '<script>alert("XSS")</script>';
      const usernameInput = page.locator('input[name="usernameOrEmail"]');
      await usernameInput.fill(xssPayload);

      await expect(usernameInput).toHaveValue(xssPayload);
      // Ensure script tag was not executed or injected into DOM raw
      const injectedScript = page.locator('script:has-text("XSS")');
      await expect(injectedScript).toHaveCount(0);
    });

  });

  // =========================================================================
  // 10. SESSION MANAGEMENT, COOKIES & LOGOUT FLOW
  // =========================================================================
  test.describe('10. Session Lifecycle & Logout Execution', () => {

    test('User can log out and session is cleared', async ({ page, context }) => {
      // Seed authenticated state
      await context.addCookies([
        { name: 'session_token', value: 'active-session-123', domain: 'localhost', path: '/' }
      ]);

      await page.goto('/dashboard');
      
      const profileMenu = page.getByRole('button', { name: /User Menu|Profile/i });
      if (await profileMenu.isVisible()) {
        await profileMenu.click();
      }

      const logoutButton = page.getByRole('button', { name: /Log Out|Sign Out/i });
      await logoutButton.click();

      await expect(page).toHaveURL('/login');

      const cookies = await context.cookies();
      const sessionCookie = cookies.find((c) => c.name === 'session_token');
      expect(sessionCookie).toBeUndefined();
    });

    test('Protected route redirects unauthenticated user to login page', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login\?redirectTo=%2Fdashboard/i);
    });

    test('Redirects back to original requested URL after successful login', async ({ page }) => {
      await page.route('**/api/v1/auth/login', async (route) => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ token: 'jwt-token' }),
        });
      });

      await page.goto('/settings/profile');
      await expect(page).toHaveURL(/\/login/i);

      await page.locator('input[name="usernameOrEmail"]').fill('johndoe');
      await page.locator('input[name="password"]').fill('ValidPassword123!');
      await page.getByRole('button', { name: /Sign In/i, exact: true }).click();

      await expect(page).toHaveURL('/settings/profile');
    });

  });

  // =========================================================================
  // 11. ACCESSIBILITY (A11Y) & KEYBOARD NAVIGATION
  // =========================================================================
  test.describe('11. Keyboard Navigation and Accessibility (a11y)', () => {

    test('Supports full tab-key navigation sequence across login form inputs', async ({ page }) => {
      await page.goto('/login');

      await page.keyboard.press('Tab');
      await expect(page.locator('input[name="usernameOrEmail"]')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('input[name="password"]')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('input[name="rememberMe"]')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.getByRole('link', { name: /Forgot password\?/i })).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name: /Sign In/i, exact: true })).toBeFocused();
    });

    test('Form submits when pressing Enter key from password field', async ({ page }) => {
      await page.route('**/api/v1/auth/login', async (route) => {
        await route.fulfill({ status: 200, body: JSON.stringify({ token: 'abc' }) });
      });

      await page.goto('/login');
      await page.locator('input[name="usernameOrEmail"]').fill('enteruser');
      await page.locator('input[name="password"]').fill('Password123!');
      
      await page.locator('input[name="password"]').press('Enter');

      await expect(page).toHaveURL('/dashboard');
    });

    test('Auth form controls contain proper aria labels and aria-invalid attributes', async ({ page }) => {
      await page.goto('/login');

      const usernameInput = page.locator('input[name="usernameOrEmail"]');
      await expect(usernameInput).toHaveAttribute('aria-required', 'true');

      // Trigger error
      await page.getByRole('button', { name: /Sign In/i, exact: true }).click();

      await expect(usernameInput).toHaveAttribute('aria-invalid', 'true');
    });

  });

  // =========================================================================
  // 12. RESPONSIVE VIEWPORT & MOBILE LAYOUT TESTS
  // =========================================================================
  test.describe('12. Mobile & Tablet Responsive Viewport Tests', () => {

    test('Login page renders seamlessly on mobile viewport (iPhone 13)', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/login');

      const submitButton = page.getByRole('button', { name: /Sign In/i, exact: true });
      await expect(submitButton).toBeVisible();

      // Ensure form elements don't cause horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(390);
    });

    test('Signup page collapses grid columns into single column on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/signup');

      const firstName = page.locator('input[name="firstName"]');
      const lastName = page.locator('input[name="lastName"]');

      const firstBox = await firstName.boundingBox();
      const lastBox = await lastName.boundingBox();

      if (firstBox && lastBox) {
        // Last name should sit below first name in single column layout
        expect(lastBox.y).toBeGreaterThan(firstBox.y);
      }
    });

  });

  // =========================================================================
  // 13. INTERNATIONALIZATION (i18n) & LOCALIZATION
  // =========================================================================
  test.describe('13. Internationalization (i18n) Language Switching', () => {

    test('Translates login UI elements when switching language to Spanish', async ({ page }) => {
      await page.goto('/login?lang=es');

      await expect(page.getByRole('heading', { name: /Bienvenido/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Iniciar Sesión/i })).toBeVisible();
    });

    test('Translates validation errors when locale header is set to French', async ({ page }) => {
      await page.setExtraHTTPHeaders({ 'Accept-Language': 'fr-FR' });
      await page.goto('/login');

      await page.getByRole('button', { name: /Connexion|Sign In/i }).click();

      await expect(page.getByText(/Le courriel est requis|Email address is required/i)).toBeVisible();
    });

  });

});