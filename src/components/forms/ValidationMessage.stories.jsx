import ValidationMessage from "./ValidationMessage";

const meta = {
  title: "Forms/ValidationMessage",
  component: ValidationMessage,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    state: {
      control: "select",
      options: [
        "error",
        "invalid",
        "success",
        "valid",
        "warning",
        "info",
        "loading",
        "validating",
      ],
    },
  },
};

export default meta;

const Template = (args) => (
  <div className="w-80">
    <ValidationMessage {...args} />
  </div>
);

export const Default = {
  render: Template,
  args: {
    state: "info",
    message: "Use the email address where you want updates.",
  },
};

export const Loading = {
  render: Template,
  args: {
    state: "validating",
    message: "Checking availability...",
  },
};

export const Success = {
  render: Template,
  args: {
    state: "success",
    message: "Looks good.",
  },
};

export const Error = {
  render: Template,
  args: {
    state: "error",
    message: "Email is already registered.",
  },
};

export const Warning = {
  render: Template,
  args: {
    state: "warning",
    message: "This password is accepted, but a stronger one is recommended.",
  },
};

export const Info = {
  render: Template,
  args: {
    state: "info",
    message: "You can change this later in settings.",
  },
};

export const HelperTextExample = {
  render: Template,
  args: {
    id: "email-helper",
    state: "info",
    message: "We will never share your email.",
  },
};

export const AllStates = {
  render: () => (
    <div className="w-96 space-y-2">
      <ValidationMessage state="info" message="Info: optional helper text." />
      <ValidationMessage state="validating" message="Loading: checking value..." />
      <ValidationMessage state="success" message="Success: value is available." />
      <ValidationMessage state="warning" message="Warning: review this value." />
      <ValidationMessage state="error" message="Error: value is not valid." />
    </div>
  ),
};
