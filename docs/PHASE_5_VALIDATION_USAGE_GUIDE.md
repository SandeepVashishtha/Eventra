# Phase 5 Validation Usage Guide

This guide explains the async form validation system in beginner-friendly terms. It covers the reusable validators, API helpers, debounce utilities, and validation UI components.

## Overview

The validation system has three layers:

1. `src/validation.js` contains the main validators used by forms.
2. `src/utils/validationApi.js` handles API requests, retries, timeouts, and normalized response objects.
3. `src/components/forms/` contains reusable UI pieces for showing validation states accessibly.

Most async validators return this shape:

```js
{
  isValid: true,
  message: "",
  isLoading: false,
}
```

Common validation states used by the UI are:

- `idle`: no validation has run yet
- `validating` or `loading`: validation is in progress
- `success` or `valid`: validation passed
- `error` or `invalid`: validation failed
- `warning`: validation needs attention but is not a hard error
- `info`: neutral helper information

## How Validators Are Organized

Use `src/validation.js` for field-level validation:

- `validate.email(value)` checks email format.
- `validate.required(value)` checks whether a value is present.
- `validate.password(value)` checks minimum password length.
- `validate.confirmPassword(value, allValues)` compares password fields.
- `validateEmailAvailability(email)` checks format, then API availability.
- `validateUsernameUnique(username)` checks format, then API availability.
- `validatePasswordStrength(password)` checks password rules locally.
- `validatePhoneNumber(phone)` checks format and optionally calls an API.

Use `src/utils/validationApi.js` when you need lower-level API behavior:

- `requestValidation(endpoint, options)` makes a validation request.
- `normalizeValidationApiResponse(data, options)` converts API data into the standard result.
- `createValidationResponse(isValid, message, extra)` creates a standard result.

Use `src/utils/debounceUtils.js` when validation should wait until typing pauses:

- `debounceAsync(asyncFn, delay, options)` debounces any async function.
- `createDebouncedValidator(validator, delay)` debounces a validator and resolves cancelled calls safely.

## Using Sync Validators

Sync validators return `true` when valid, or a message string when invalid.

```js
import validate from "./validation";

const result = validate.email("person@example.com");

if (result === true) {
  console.log("Email format is valid");
} else {
  console.log(result);
}
```

For required fields:

```js
const result = validate.required(formValues.firstName);
```

For confirm password:

```js
const result = validate.confirmPassword(formValues.confirmPassword, formValues);
```

## Using Async Validators

Async validators return a promise that resolves to a standard validation result.

```js
import { validateEmailAvailability } from "./validation";

const result = await validateEmailAvailability("person@example.com");

if (result.isValid) {
  console.log("Email is available");
} else {
  console.log(result.message);
}
```

You can customize messages:

```js
const result = await validateEmailAvailability(email, {
  messages: {
    invalidFormat: "Enter a valid email address",
    unavailable: "This email is already in use",
    network: "We could not check this email right now",
  },
});
```

Empty values are skipped by default for availability checks. Pair async validators with `validate.required` when a field must be filled.

## Using Debounce Utilities

Debouncing avoids API calls on every keystroke. The validator runs after the user pauses typing.

```js
import { createDebouncedValidator } from "./utils/debounceUtils";
import { validateUsernameUnique } from "./validation";

const validateUsername = createDebouncedValidator(validateUsernameUnique, 500);

const result = await validateUsername("event_builder");
```

If the user types again before the delay finishes, the older call resolves with:

```js
{
  isValid: false,
  message: "Validation cancelled",
  cancelled: true,
}
```

Usually you should ignore results with `cancelled: true`.

## Using ValidationStatusIcon

`ValidationStatusIcon` shows a small icon for a validation state.

```jsx
import { ValidationStatusIcon } from "./components/forms";

<ValidationStatusIcon state="validating" label="Checking email availability" />;
```

Use `ariaHidden` when the icon is decorative and a message already explains the state:

```jsx
<ValidationStatusIcon state="success" ariaHidden />;
```

## Using ValidationMessage

`ValidationMessage` renders accessible inline feedback.

```jsx
import { ValidationMessage } from "./components/forms";

<ValidationMessage
  id="email-message"
  state="error"
  message="Email is already registered"
/>;
```

It renders nothing for empty, `null`, or `undefined` messages.

## Using FormFieldWrapper

`FormFieldWrapper` connects labels, helper text, validation messages, and ARIA attributes for one input.

```jsx
import { FormFieldWrapper } from "./components/forms";

<FormFieldWrapper
  id="email"
  label="Email"
  required
  helperText="Use the email you want for event updates."
  validationState="error"
  message="Email is already registered"
>
  <input type="email" value={email} onChange={handleEmailChange} />
</FormFieldWrapper>;
```

The wrapper automatically sets:

- `id` and `name`
- `aria-describedby`
- `aria-invalid`
- `aria-busy`
- `aria-required`

## Full Signup Field Example

```jsx
import React, { useMemo, useState } from "react";
import {
  createDebouncedValidator,
  validate,
  validateEmailAvailability,
} from "./validation";
import { FormFieldWrapper } from "./components/forms";

const debouncedEmailValidator = createDebouncedValidator(
  validateEmailAvailability,
  500,
);

const SignupEmailField = () => {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle");
  const [message, setMessage] = useState("");

  const validateEmail = useMemo(() => debouncedEmailValidator, []);

  const handleChange = async (event) => {
    const nextEmail = event.target.value;
    setEmail(nextEmail);

    const requiredResult = validate.required(nextEmail);
    if (requiredResult !== true) {
      setState("error");
      setMessage(requiredResult);
      return;
    }

    const formatResult = validate.email(nextEmail);
    if (formatResult !== true) {
      setState("error");
      setMessage(formatResult);
      return;
    }

    setState("validating");
    setMessage("Checking email availability...");

    const result = await validateEmail(nextEmail);
    if (result.cancelled) return;

    setState(result.isValid ? "success" : "error");
    setMessage(result.isValid ? "Email is available" : result.message);
  };

  return (
    <FormFieldWrapper
      id="signup-email"
      label="Email"
      required
      helperText="We will use this for account updates."
      validationState={state}
      message={message}
    >
      <input type="email" value={email} onChange={handleChange} />
    </FormFieldWrapper>
  );
};
```

## Common Mistakes And Fixes

- Mistake: Running API validation before required or format checks.
  Fix: Run cheap sync checks first, then call async validators.
- Mistake: Showing cancelled debounce results as errors.
  Fix: Ignore results with `result.cancelled`.
- Mistake: Treating empty optional fields as invalid.
  Fix: Keep `skipEmpty: true` for optional async checks.
- Mistake: Forgetting to connect message IDs to inputs.
  Fix: Use `FormFieldWrapper`, which handles `aria-describedby`.
- Mistake: Using a custom API response shape without mapping it.
  Fix: Use `mapResult` in `createCustomAsyncValidator` or `normalizeValidationApiResponse`.

## Testing Notes

Focused tests for this system live in:

- `src/validation.test.js`
- `src/utils/validationApi.test.js`
- `src/utils/debounceUtils.test.js`
- `src/components/forms/__tests__/ValidationStatusIcon.test.jsx`
- `src/components/forms/__tests__/ValidationMessage.test.jsx`
- `src/components/forms/__tests__/FormFieldWrapper.test.jsx`
- `src/components/auth/__tests__/SignupForm.test.jsx`
- `src/components/auth/__tests__/LoginForm.test.jsx`

For async and debounce tests, prefer fake timers or injected `fetchImpl` functions so tests stay fast and deterministic.

## Accessibility Notes

- Error icons and error messages use alert semantics.
- Non-error validation states use polite live regions.
- `FormFieldWrapper` links helper text and validation messages through `aria-describedby`.
- Loading states set `aria-busy="true"` on the input.
- Required fields include both a visual asterisk and screen-reader text.

## Future Improvement Ideas

- Add Storybook interaction tests for typing and async transitions.
- Add shared TypeScript types for validation results if the project moves to TypeScript.
- Add a small hook that manages `idle`, `validating`, `success`, and `error` state for common async fields.
- Add endpoint-specific examples for production API response shapes.
