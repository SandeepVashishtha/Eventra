import { defineConfig, devices } from '@playwright/test';

const CI = !!process.env.CI;
const DEFAULT_TIMEOUT = CI ? 120 * 1000 : 60 * 1000;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: DEFAULT_TIMEOUT,
  expect: {
    timeout: CI ? 30000 : 15000,
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.3,
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.01,
    },
  },
  fullyParallel: false,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: CI ? 1 : undefined,
  maxFailures: CI ? 10 : 0,
  reporter: [
    ['html', { open: CI ? 'never' : 'on-failure' }],
    ['list', { printSteps: true }],
    ...(CI ? [['github']] : []),
  ],
  globalSetup: CI ? undefined : undefined,
  globalTeardown: undefined,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: CI ? 30000 : 15000,
    navigationTimeout: CI ? 60000 : 30000,
    ignoreHTTPSErrors: false,
    bypassCSP: false,
    locale: 'en-US',
    timezoneId: 'America/New_York',
    colorScheme: 'light',
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13'],
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'tablet-chrome',
      use: {
        ...devices['Galaxy Tab S4'],
        isMobile: false,
      },
    },
    {
      name: 'tablet-safari',
      use: {
        ...devices['iPad Pro 11'],
        isMobile: false,
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !CI,
    timeout: 120 * 1000,
    cwd: undefined,
    ignoreHTTPSErrors: false,
  },
});
