import { test, expect } from '@playwright/test';

test.describe('Theme Switcher E2E Tests', () => {

  test('User can switch between light and dark modes', async ({ page }) => {
    await page.goto('/');
    
    const themeToggle = page.locator('button[aria-label*="theme"], button[title*="theme"], .theme-toggle').first();
    await expect(themeToggle).toBeVisible();

    // Check initial theme (assume light by default or check class on html/body)
    const isDarkInitial = await page.locator('html').evaluate(el => el.classList.contains('dark'));
    
    // Toggle theme
    await themeToggle.click();

    // Check if theme changed
    const isDarkAfter = await page.locator('html').evaluate(el => el.classList.contains('dark'));
    expect(isDarkAfter).not.toBe(isDarkInitial);

    // Toggle back
    await themeToggle.click();
    const isDarkFinal = await page.locator('html').evaluate(el => el.classList.contains('dark'));
    expect(isDarkFinal).toBe(isDarkInitial);
  });

  test('Theme preference persists after reload', async ({ page }) => {
    await page.goto('/');
    
    const themeToggle = page.locator('button[aria-label*="theme"], button[title*="theme"], .theme-toggle').first();
    
    // Ensure we are in a specific theme (e.g., dark)
    const isDark = await page.locator('html').evaluate(el => el.classList.contains('dark'));
    if (!isDark) {
      await themeToggle.click();
    }
    
    await expect(page.locator('html')).toHaveClass(/dark/);
    
    // Reload page
    await page.reload();
    
    // Theme should still be dark
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

});
