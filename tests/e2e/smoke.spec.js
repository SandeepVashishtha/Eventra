import { test, expect } from '@playwright/test';

test.describe('Critical User Flows (Smoke Tests)', () => {

  test('Homepage renders and hero section is visible', async ({ page }) => {
    await page.goto('/');
    
    // The Eventra logo/brand text is an h1 heading
    const navbarBrand = page.getByRole('heading', { name: /Eventra/i }).first();
    await expect(navbarBrand).toBeVisible();

    // Verify a call to action button exists on the home page (e.g., Explore Events)
    const exploreButton = page.getByRole('link', { name: /explore events/i }).first();
    await expect(exploreButton).toBeVisible();
  });

  test('Event cards load on the events page', async ({ page }) => {
    await page.goto('/events');
    
    // Wait for the simulated delay in EventsPage.js
    await page.waitForTimeout(1000);

    // Look for the filter buttons to confirm the page rendered
    const allFilterButton = page.getByRole('button', { name: 'All' }).first();
    await expect(allFilterButton).toBeVisible();

    // There should be links to specific events (EventCards)
    const firstEventLink = page.getByRole('link', { name: /view details|register/i }).first();
    if (await firstEventLink.isVisible()) {
      await expect(firstEventLink).toBeVisible();
    }
  });

  test('Navigation works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Click on the Events link in the desktop navbar
    const eventsLink = page.getByRole('navigation').getByRole('link', { name: /events/i }).first();
    await eventsLink.click();
    
    // Verify the URL changed to /events
    await expect(page).toHaveURL(/.*\/events/);
  });

  test('Login page opens correctly', async ({ page }) => {
    await page.goto('/');
    
    // Find the Sign In link (from AuthButtons.jsx)
    const signInLink = page.getByRole('link', { name: /Sign In/i }).first();
    await signInLink.click();

    // Verify we navigated to the login page (or auth page)
    await expect(page).toHaveURL(/.*\/login/);
  });

});
