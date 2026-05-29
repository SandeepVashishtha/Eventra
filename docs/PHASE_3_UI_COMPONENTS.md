# Phase 3: Validation UI Components

Phase 3 adds beginner-friendly React components for showing accessible async validation feedback in forms.

## Files Added

- `src/components/forms/ValidationStatusIcon.jsx`
- `src/components/forms/ValidationMessage.jsx`
- `src/components/forms/FormFieldWrapper.jsx`
- `src/components/forms/index.js`
- `src/components/forms/__tests__/ValidationStatusIcon.test.jsx`
- `src/components/forms/__tests__/ValidationMessage.test.jsx`
- `src/components/forms/__tests__/FormFieldWrapper.test.jsx`

## Components

### ValidationStatusIcon

Shows an icon for the current validation state:

- `idle`
- `validating` / `loading`
- `success` / `valid`
- `error` / `invalid`
- `warning`
- `info`

```jsx
import { ValidationStatusIcon } from "./components/forms";

<ValidationStatusIcon state="validating" className="ml-2" />;
```

The component uses accessible labels, `role="status"` for non-error states, and `role="alert"` for error states. Pass `ariaHidden` when the icon is decorative.

### ValidationMessage

Displays feedback below form fields and skips empty messages.

```jsx
import { ValidationMessage } from "./components/forms";

<ValidationMessage
  id="email-message"
  state="error"
  message="Email is already registered"
/>;
```

Error messages use `role="alert"` and assertive live announcements. Success, warning, info, and loading messages use polite status announcements.

### FormFieldWrapper

Wraps the label, input, validation icon, helper text, and validation message. It clones the child input and adds:

- `aria-describedby`
- `aria-invalid`
- `aria-busy`
- `aria-required`

```jsx
import { FormFieldWrapper } from "./components/forms";

<FormFieldWrapper
  id="email"
  label="Email"
  required
  helperText="Use the email you want connected to your Eventra account."
  validationState={validationState.email}
  message={errors.email}
>
  <input
    name="email"
    type="email"
    value={values.email}
    onChange={handleChange}
    onBlur={handleBlur}
    autoComplete="email"
  />
</FormFieldWrapper>;
```

## Email Field Example

```jsx
import { FormFieldWrapper } from "./components/forms";
import {
  createHookValidator,
  validateEmailAvailability,
  validate,
} from "./validation";

const validationRules = {
  email: [
    validate.required,
    validate.email,
    createHookValidator(validateEmailAvailability),
  ],
};

function EmailField({ values, errors, validationState, handleChange, handleBlur }) {
  return (
    <FormFieldWrapper
      id="signup-email"
      label="Email"
      required
      helperText="We will use this for registration updates."
      validationState={validationState.email}
      message={errors.email}
    >
      <input
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        autoComplete="email"
      />
    </FormFieldWrapper>
  );
}
```

## Accessibility Notes

- Inputs are connected to helper and validation text with `aria-describedby`.
- Error states set `aria-invalid="true"`.
- Loading states set `aria-busy="true"`.
- Required fields include a visible `*` and screen-reader text.
- Validation messages use `aria-live` so async updates are announced.

## Test Command

```bash
npm.cmd test -- --watchAll=false src/components/forms/__tests__/ValidationStatusIcon.test.jsx src/components/forms/__tests__/ValidationMessage.test.jsx src/components/forms/__tests__/FormFieldWrapper.test.jsx
```
