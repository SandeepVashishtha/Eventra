## Summary
The codebase has zero internationalization (i18n) infrastructure. All user-facing strings are hardcoded across every component, utility, and page file. This makes the application inaccessible to non-English speakers and requires significant rework to localize.

## Evidence
grep for `i18n`, `IntlProvider`, `react-i18next`, `react-intl`, `formatMessage`, `defineMessages` returns zero relevant results.

Hardcoded strings exist in:
- `src/App.jsx` — "Loading page...", "Back online!...", "You are currently offline..."
- `src/validation.js` — All VALIDATION_MESSAGES strings
- `src/utils/errorMessages.js` — All STATUS_MESSAGES
- `src/components/common/ErrorBoundary.jsx` — "System Crash Prevented", "Eventra encountered an unexpected crash..."
- `src/context/AuthContext.js` — "Session expired. Please log in again."
- `src/components/common/Modal.jsx` — "Close modal"
- `src/utils/asyncValidators.js` — All error messages
- `src/utils/rateLimiter.js` — "Rate limited. Please wait..."

This affects every component in `src/components/`, `src/Pages/`, `src/utils/`, `src/hooks/`.

## Suggested Fix (1500-2500+ lines)
- Install react-i18next or react-intl
- Create `src/i18n/` with config, locale files, and translation hooks
- Extract ALL hardcoded strings into `locales/en.json`
- Wrap every JSX string with `t()` calls
- Replace validation/error messages with `t()` keys
- Add language switcher component
- Handle date/time formatting with Intl.DateTimeFormat across calendar/timezone utils
- LTR/RTL layout support considerations
