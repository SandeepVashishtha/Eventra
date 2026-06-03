import { test, expect } from '@playwright/test';

test.describe('Event Discovery E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/events');
  });

  test('User can see the list of events', async ({ page }) => {
    // Should see the events page title or hero
    await expect(page.locator('h1')).toBeVisible();
    
    // Check if event cards are rendered
    const eventCards = page.locator('article');
    await expect(eventCards.first()).toBeVisible();
  });

  test('User can search for events', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search events/i);
    await expect(searchInput).toBeVisible();

    await searchInput.fill('Conference');
    await searchInput.press('Enter');

    // URL should be updated with search query
    await expect(page).toHaveURL(/search=Conference/);
  });

  test('User can filter events by category', async ({ page }) => {
    // Open filters if they are in a dropdown or toolbar
    const filterButton = page.getByRole('button', { name: /Filters/i });
    if (await filterButton.isVisible()) {
      await filterButton.click();
    }

    const categoryFilter = page.getByLabel(/Category/i).first();
    await expect(categoryFilter).toBeVisible();

    // Select a category
    await categoryFilter.selectOption({ label: 'Technology' });

    // Active filters should show the selected category
    await expect(page.getByText(/Technology/i)).toBeVisible();
  });

  test('User can switch between grid and list views', async ({ page }) => {
    const listViewButton = page.getByRole('button', { name: /List View/i });
    const gridViewButton = page.getByRole('button', { name: /Grid View/i });

    if (await listViewButton.isVisible()) {
      await listViewButton.click();
      // Check if layout changed (e.g., class on container)
      const container = page.locator('.grid');
      await expect(container).toHaveClass(/max-w-4xl/);
    }

    if (await gridViewButton.isVisible()) {
      await gridViewButton.click();
      const container = page.locator('.grid');
      await expect(container).not.toHaveClass(/max-w-4xl/);
    }
  });

});
