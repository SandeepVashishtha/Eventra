## Description
This pull request addresses **10 critical bugs** that were preventing the application from building, running, and passing unit tests. Most of these bugs were the result of improperly resolved merge conflicts from recent large refactors, while others were missing logic or syntax errors.

**Fixes Included:**
1. **`validationApi.js`**: Removed duplicate `fetchImpl` destructuring that broke the build.
2. **`secureStorage.js`**: Restored the missing Web Crypto API engine (`encrypt`, `decrypt`, `getDerivedKey`) needed for AES-GCM local storage encryption.
3. **`validation.js`**: Removed duplicate `phone` validation key that caused linting errors.
4. **`relativeTime.js`**: Fixed `getSmartDateLabel` to correctly return `"TBD"` on null dates, resolving failing unit tests.
5. **`EventCard.js`**: Resolved complex merge conflict leaving duplicate React imports and unclosed JSX `<img>` tags.
6. **`SectionErrorBoundary.jsx`**: Fixed syntax error `(e) = aria-label="button">` inside the `onMouseOver` prop, replacing it with a valid arrow function.
7. **`AppRoutes.js`**: Resolved merge conflict leaving duplicate `AppRoutes` function and lazy imports.
8. **`StyledDropdown.js`**: Resolved merge conflict leaving duplicate `listboxId` declarations.
9. **`ProtectedRoutes.js`**: Resolved merge conflict leaving duplicate `EventCreation` declarations.
10. **`PublicRoutes.js`**: Resolved merge conflict leaving duplicate lazy imports including `MockApiResponse`.
11. **`loginEndpoint.test.mjs`**: Mocked `ALLOWED_ORIGIN` to ensure CORS header assertions pass correctly in isolated environments.

## Related Issues
- Resolves #3426

## Type of Change
- [x] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Checklist:
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my own code
- [x] I have fixed all merge conflicts in the affected files
- [x] My changes generate no new test failures
- [x] All unit tests pass completely (`npm run test:unit`)

## Screenshots
*N/A - Changes are structural syntax fixes and logical restoration. No visual changes.*
