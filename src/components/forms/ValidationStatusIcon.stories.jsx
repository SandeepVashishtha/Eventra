import ValidationStatusIcon from "./ValidationStatusIcon";

const meta = {
  title: "Forms/ValidationStatusIcon",
  component: ValidationStatusIcon,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    state: {
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

const Template = (args) => <ValidationStatusIcon {...args} />;

export const Default = {
  render: Template,
  args: {
    state: "idle",
  },
};

export const Loading = {
  render: Template,
  args: {
    state: "validating",
    label: "Checking field value",
  },
};

export const Success = {
  render: Template,
  args: {
    state: "success",
  },
};

export const Error = {
  render: Template,
  args: {
    state: "error",
  },
};

export const Warning = {
  render: Template,
  args: {
    state: "warning",
  },
};

export const Info = {
  render: Template,
  args: {
    state: "info",
  },
};

export const AllStates = {
  render: () => (
    <div className="grid gap-3 text-sm text-gray-700 dark:text-gray-200">
      {["idle", "validating", "success", "error", "warning", "info"].map((state) => (
        <div key={state} className="flex items-center gap-2">
          <ValidationStatusIcon state={state} />
          <span className="capitalize">{state}</span>
        </div>
      ))}
    </div>
  ),
};
