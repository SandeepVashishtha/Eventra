const { test, expect } = require('@playwright/test');

test.describe('HttpOnly Cookie Auth & Session Lifecycle', () => {

  const COOKIE_NAME = 'auth_token';
  const MOCK_TOKEN = 'mocked-httponly-jwt-token-12345';

  // =========================================================================
  // 1. SET COOKIE ON LOGIN
  // =========================================================================
  test('server sets secure HttpOnly auth cookie on successful login', async ({ page, context }) => {
    // Intercept login API request and attach Set-Cookie header
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'Set-Cookie': `${COOKIE_NAME}=${MOCK_TOKEN}; Path=/; HttpOnly; Secure; SameSite=Lax`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          user: { id: 'usr_101', email: 'user@example.com', name: 'Test User' },
        }),
      });
    });

    await page.goto('/login');

    await page.locator('input[name="email"]').fill('user@example.com');
    await page.locator('input[name="password"]').fill('ValidPassword123!');
    await page.getByRole('button', { name: /Sign In|Log In/i }).click();

    // Verify browser context stored the cookie with proper security flags
    const cookies = await context.cookies();
    const authCookie = cookies.find((c) => c.name === COOKIE_NAME);

    expect(authCookie).toBeDefined();
    expect(authCookie?.value).toBe(MOCK_TOKEN);
    expect(authCookie?.httpOnly).toBe(true);
    expect(authCookie?.secure).toBe(true);
    expect(authCookie?.sameSite).toBe('Lax');
  });

  // =========================================================================
  // 2. SESSION RESTORATION VIA PROFILE ENDPOINT
  // =========================================================================
  test('client restores session using existing HttpOnly cookie on page load', async ({ page, context }) => {
    // Seed browser context with valid HttpOnly cookie prior to navigation
    await context.addCookies([
      {
        name: COOKIE_NAME,
        value: MOCK_TOKEN,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false, // Set to true in HTTPS environments
        sameSite: 'Lax',
      },
    ]);

    // Mock profile endpoint to return authenticated user payload
    await page.route('**/api/auth/me', async (route) => {
      const requestHeaders = route.request().headers();
      
      // Ensure browser automatically attached the cookie header
      if (requestHeaders['cookie']?.includes(`${COOKIE_NAME}=${MOCK_TOKEN}`)) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'usr_101',
            email: 'user@example.com',
            name: 'Test User',
            role: 'MEMBER',
          }),
        });
      } else {
        await route.fulfill({
          status: 401,
          body: JSON.stringify({ message: 'Unauthorized' }),
        });
      }
    });

    await page.goto('/dashboard');

    // Assert user session is restored and UI displays user info
    await expect(page.getByTestId('user-profile-header')).toBeVisible();
    await expect(page.getByText(/Test User/i)).toBeVisible();
  });

  // =========================================================================
  // 3. COOKIE CLEARING ON LOGOUT
  // =========================================================================
  test('server clears auth cookie upon user logout', async ({ page, context }) => {
    // Seed active session cookie
    await context.addCookies([
      {
        name: COOKIE_NAME,
        value: MOCK_TOKEN,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
      },
    ]);

    // Intercept logout request and instruct browser to expire the cookie
    await page.route('**/api/auth/logout', async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'Set-Cookie': `${COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/dashboard');

    const logoutButton = page.getByRole('button', { name: /Log Out|Sign Out/i });
    await logoutButton.click();

    await expect(page).toHaveURL('/login');

    // Verify cookie was removed from browser storage
    const cookies = await context.cookies();
    const authCookie = cookies.find((c) => c.name === COOKIE_NAME);
    expect(authCookie).toBeUndefined();
  });

  // =========================================================================
  // 4. SECURITY CHECK: INACCESSIBLE TO CLIENT-SIDE JS
  // =========================================================================
  test('HttpOnly flag prevents client-side JavaScript access via document.cookie', async ({ page, context }) => {
    await context.addCookies([
      {
        name: COOKIE_NAME,
        value: MOCK_TOKEN,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
      },
      {
        name: 'public_theme',
        value: 'dark',
        domain: 'localhost',
        path: '/',
        httpOnly: false, // Standard non-HttpOnly cookie for comparison
      },
    ]);

    await page.goto('/login');

    // Retrieve document.cookie as executed by in-browser scripts
    const clientDocumentCookie = await page.evaluate(() => document.cookie);

    // Non-HttpOnly cookie SHOULD be accessible
    expect(clientDocumentCookie).toContain('public_theme=dark');

    // HttpOnly auth cookie MUST NOT be accessible via DOM
    expect(clientDocumentCookie).not.toContain(COOKIE_NAME);
    expect(clientDocumentCookie).not.toContain(MOCK_TOKEN);
  });

  // =========================================================================
  // 5. EXPIRED / INVALID COOKIE HANDLING
  // =========================================================================
  test('redirects to login when profile endpoint rejects expired cookie with 401', async ({ page, context }) => {
    await context.addCookies([
      {
        name: COOKIE_NAME,
        value: 'expired-jwt-token',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
      },
    ]);

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Session expired. Please log in again.' }),
      });
    });

    await page.goto('/dashboard');

    // Assert automatic redirect to login screen
    await expect(page).toHaveURL(/\/login\?sessionExpired=true/i);
    await expect(page.getByText(/Session expired. Please log in again/i)).toBeVisible();
  });

});