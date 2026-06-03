/* Playwright scaffold: HttpOnly cookie session tests (skeleton)
 * Implement tests to verify server sets and clears auth cookies,
 * and that the client can restore a session via profile endpoint.
 */
import { test, expect } from '@playwright/test';

test.describe('HttpOnly cookie auth', () => {
  test('server should set auth cookie on login (placeholder)', async ({ page }) => {
    test.info().skip('Implement login flow simulation and cookie assertions');
  });
});
