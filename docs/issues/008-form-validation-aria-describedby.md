# Issue #008: Form validation errors not associated with inputs via `aria-describedby`

**Tags:** `a11y`, `enhancement`, `intermediate`  
**Category:** Quality Exceptional — WCAG A compliance  
**Files:**
- `src/components/auth/Login.js`
- `src/components/auth/LoginForm.js`
- `src/components/auth/SignupForm.js`

---

## Description

The login and signup forms render inline validation error messages as `<motion.p>` or `<p>` elements, but these error messages are **not programmatically associated** with their corresponding input fields. Screen reader users cannot tell which field an error belongs to after submitting an invalid form.

### WCAG Violation

- **WCAG 4.1.2 Name, Role, Value (Level A)**: All interactive UI components must have their name and role programmatically determined. Error messages must be programmatically associated with the input they describe.
- **WCAG 3.3.1 Error Identification (Level A)**: Errors must be identified and described to the user in text. Without `aria-describedby`, screen readers may not announce errors.

### Reference Implementation

The `ContactUs.js` form (`src/Pages/Contact/ContactUs.js:71-74`) already does this correctly:

```jsx
aria-required={required}
aria-invalid={Boolean(error)}
aria-describedby={error ? `${id}-error` : undefined}
```

This should be the pattern used across all forms.

### Current Bad Pattern (LoginForm.js example)

```jsx
<div className="mb-4">
  <label htmlFor="email">Email</label>
  <input
    type="email"
    id="email"
    name="email"
    className={error ? "border-red-500" : ""}
  />
  {error && (
    <motion.p className="text-red-500 text-sm mt-1">
      {error}
    </motion.p>
  )}
</div>
```

The error `<p>` has no `id`, and the input has no `aria-describedby` pointing to it.

## Proposed Fix

For each form field in all three files, add:

1. A unique `id` to the error message element: `id="${fieldName}-error"`
2. `aria-describedby="${fieldName}-error"` on the input when an error exists
3. `aria-invalid={Boolean(error)}` on the input
4. Keep `aria-describedby` as `undefined` when there is no error

### Example Fix Pattern

**Before:**
```jsx
{mobileError && (
  <p className="text-red-500 text-sm mt-1">{mobileError}</p>
)}
```

**After:**
```jsx
<input
  type="email"
  id="email"
  name="email"
  aria-invalid={Boolean(error)}
  aria-describedby={error ? "email-error" : undefined}
/>
{error && (
  <p id="email-error" className="text-red-500 text-sm mt-1" role="alert">
    {error}
  </p>
)}
```

### Scope of Changes

#### `src/components/auth/LoginForm.js`
Fields: usernameOrEmail, password
- Email/Username input needs `aria-invalid` and `aria-describedby`
- Password input needs `aria-invalid` and `aria-describedby`
- Both error messages need stable `id` attributes
- Add `role="alert"` to error messages for immediate announcement

#### `src/components/auth/Login.js`
Similar pattern — same fields.

#### `src/components/auth/SignupForm.js`
Fields: firstName, lastName, email, password, confirmPassword
- All five fields need `aria-invalid` and `aria-describedby`
- All five error messages need stable `id` attributes
- Password strength indicator should also use `aria-describedby` if it shows validation requirements

### Important Details

- The `id` must be **unique** within the page. Use a naming convention like `login-email-error`, `signup-firstname-error`, etc.
- `aria-describedby` points to the `id` of the error element, not the label
- When there is no error, `aria-describedby` should be `undefined` (not an empty string or non-existent ID)
- The `role="alert"` on the error element causes screen readers to announce the error immediately when it appears (but this may conflict with `aria-describedby`'s announcement — test with a screen reader)
- For the password field, the password strength hints (like "Must contain uppercase letter") should also use `aria-describedby` to associate the hints with the input

## Acceptance Criteria

- [ ] Each form input has `aria-invalid` set correctly (`true` when error exists, `false` otherwise)
- [ ] Each form input has `aria-describedby` pointing to its error message `id` when an error exists
- [ ] Each error message element has a stable, unique `id`
- [ ] Screen readers announce the error after submitting an invalid form and focusing the field
- [ ] No duplicate `id` values on the page
- [ ] No regressions in form validation or submission
- [ ] The ContactUs.js pattern can be used as reference

## Verification

1. Open NVDA/VoiceOver
2. Navigate to login form
3. Submit with empty fields
4. Focus the email field → screen reader should announce: "Email, invalid entry, Error: This field is required"
5. Focus the password field → screen reader should announce: "Password, invalid entry, Error: Password must be at least 8 characters"
