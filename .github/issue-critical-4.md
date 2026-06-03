## Summary
The project has no systematic testing infrastructure — no E2E tests, no integration tests, no API mocking layer, and minimal component tests. Only 37 test files exist (mostly utility tests), and critical components like AuthContext, App.jsx, all pages, and all services have zero test coverage.

## Evidence
**No E2E setup:**
- No `cypress/` or `playwright/` directory
- No `playwright.config.ts`
- No `.spec.*` files beyond unit tests

**No integration tests:**
- No MSW (mock service worker) or API mocking
- `src/test-utils.js` is only 21 lines — bare minimum with `renderWithRouter` and `renderWithAuth`
- No axios/apiUtils mock setup

**Key components with ZERO tests:**
- `ErrorBoundary.jsx` (no tests)
- `AuthContext.js` (no integration tests)
- `App.jsx` (no app-level test)
- All pages in `src/Pages/` (only 2 of 30+ have tests)
- All services in `src/services/`
- All stores in `src/store/`

**37 test files total**, predominantly utilities:
- `src/utils/*.test.js` — utility tests
- `src/hooks/*.test.js` — hook tests
- Only 7 component test files
- No accessibility testing (no jest-axe)
- No visual regression testing
- No user-event library (only @testing-library/react)

## Suggested Fix (800-1500+ lines)
- Set up Playwright: `e2e/` directory, config, base fixtures, 3-5 critical user flows (auth, event creation, registration)
- Set up MSW: `src/mocks/handlers.js`, `src/mocks/server.js`, `src/mocks/browser.js`
- Expand `src/test-utils.jsx` with wrapper providers, mock data factories, API mock helpers
- Write integration tests for auth flow, event creation, registration, offline queue
- Set up jest-axe for automated a11y testing
- Add @testing-library/user-event and migrate fireEvent calls
