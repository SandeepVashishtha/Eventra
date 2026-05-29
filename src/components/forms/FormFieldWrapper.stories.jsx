import React, { useMemo, useState } from "react";
import { Mail } from "lucide-react";
import { validate } from "../../validation";
import FormFieldWrapper from "./FormFieldWrapper";

const meta = {
  title: "Forms/FormFieldWrapper",
  component: FormFieldWrapper,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    validationState: {
      control: "select",
      options: [
        "idle",
        "validating",
        "loading",
        "success",
        "valid",
        "error",
        "invalid",
        "warning",
        "info",
      ],
    },
  },
};

export default meta;

const FieldFrame = ({ children }) => <div className="w-96 max-w-full">{children}</div>;

const Template = (args) => (
  <FieldFrame>
    <FormFieldWrapper {...args}>
      <input type="text" placeholder="event@example.com" />
    </FormFieldWrapper>
  </FieldFrame>
);

const FullEmailValidationExample = () => {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);

  const validation = useMemo(() => {
    if (!touched && !email) {
      return {
        state: "idle",
        message: "",
      };
    }

    const requiredResult = validate.required(email);
    if (requiredResult !== true) {
      return {
        state: "error",
        message: requiredResult,
      };
    }

    const emailResult = validate.email(email);
    if (emailResult !== true) {
      return {
        state: "error",
        message: emailResult,
      };
    }

    if (email.toLowerCase().includes("taken")) {
      return {
        state: "error",
        message: "Email is already registered.",
      };
    }

    return {
      state: "success",
      message: "Email is ready to use.",
    };
  }, [email, touched]);

  return (
    <FieldFrame>
      <FormFieldWrapper
        id="signup-email-story"
        label="Signup email"
        required
        helperText="Try an invalid email, then try taken@example.com."
        validationState={validation.state}
        message={validation.message}
        prefix={<Mail aria-hidden="true" className="h-4 w-4 text-gray-400" />}
      >
        <input
          type="email"
          value={email}
          placeholder="you@example.com"
          onBlur={() => setTouched(true)}
          onChange={(event) => {
            setTouched(true);
            setEmail(event.target.value);
          }}
        />
      </FormFieldWrapper>
    </FieldFrame>
  );
};

export const Default = {
  render: Template,
  args: {
    id: "default-email",
    label: "Email",
    validationState: "idle",
  },
};

export const Loading = {
  render: Template,
  args: {
    id: "loading-email",
    label: "Email",
    validationState: "validating",
    message: "Checking email availability...",
  },
};

export const Success = {
  render: Template,
  args: {
    id: "success-email",
    label: "Email",
    validationState: "success",
    message: "Email is available.",
  },
};

// 🔥 Added the 'Valid' story to verify our fix
export const Valid = {
  render: Template,
  args: {
    id: "valid-email",
    label: "Email",
    validationState: "valid",
    message: "Field verified successfully.",
  },
};

export const Error = {
  render: Template,
  args: {
    id: "error-email",
    label: "Email",
    validationState: "error",
    message: "Email is already registered.",
  },
};

export const Warning = {
  render: Template,
  args: {
    id: "warning-email",
    label: "Email",
    validationState: "warning",
    message: "Use a personal email only if your team allows it.",
  },
};

export const Info = {
  render: Template,
  args: {
    id: "info-email",
    label: "Email",
    validationState: "info",
    message: "We will use this for account updates.",
  },
};

export const RequiredField = {
  render: Template,
  args: {
    id: "required-email",
    label: "Email",
    required: true,
    validationState: "idle",
  },
};

export const HelperText = {
  render: Template,
  args: {
    id: "helper-email",
    label: "Email",
    helperText: "Use the address you check most often.",
    validationState: "idle",
  },
};

export const WithPrefixAndSuffix = {
  render: () => (
    <FieldFrame>
      <FormFieldWrapper
        id="email-with-icon"
        label="Email"
        helperText="The icon is decorative; the field remains fully labelled."
        prefix={<Mail aria-hidden="true" className="h-4 w-4 text-gray-400" />}
        validationState="success"
        message="Email format looks good."
      >
        <input type="email" defaultValue="builder@eventra.dev" />
      </FormFieldWrapper>
    </FieldFrame>
  ),
};

export const FullEmailValidationField = {
  render: () => <FullEmailValidationExample />,
};