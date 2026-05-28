**Describe the bug**
Recent commits and improperly resolved merge conflicts have introduced 10 critical bugs that completely break the build process and runtime environment.

**The 10 Bugs:**
1. **`validationApi.js`**: Syntax error where `fetchImpl` is duplicated in object destructuring.
2. **`secureStorage.js`**: The `cryptoSupported` variable and the Web Crypto engine (`encrypt`, `decrypt`) were accidentally deleted, completely breaking the `syncSecureStorage` functionality used to encrypt local storage data.
3. **`validation.js`**: A duplicate `phone` validation key exists in the `validate` exported object, causing a linter error.
4. **`relativeTime.js`**: `getSmartDateLabel` returns `"\u2014"` (—) instead of `"TBD"` when the date is null, causing `tests/relativeTime.test.mjs` to fail.
5. **`EventCard.js`**: Duplicate React imports and an unclosed `<img>` tag, caused by an unresolved merge conflict with a new `LazyImage` component.
6. **`SectionErrorBoundary.jsx`**: An invalid assignment expression `(e) = aria-label="button">` instead of `(e) =>` inside the `onMouseOver` prop.
7. **`AppRoutes.js`**: An unresolved merge conflict leaves a duplicate `AppRoutes` function declaration and duplicate lazy imports.
8. **`StyledDropdown.js`**: The `listboxId` variable is declared multiple times.
9. **`ProtectedRoutes.js`**: The `EventCreation` import/declaration is duplicated.
10. **`PublicRoutes.js`**: The `MockApiResponse` identifier is declared multiple times.

**To Reproduce**
Steps to reproduce the behavior:
1. Run `npm run lint`. See syntax errors crashing ESLint.
2. Run `npm run test:unit`. See tests failing.
3. Run `npm run build` or `npm run dev`. App will not build due to duplicate declarations.

**Expected behavior**
The application should build without syntax errors, tests should pass, and the encrypted storage module should have its Web Crypto API dependencies intact.

**Screenshots**
N/A - Build breaks before any UI is rendered.

**Environment (please complete the following information):**
- Eventra Latest Master Branch
