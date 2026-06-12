import { useState } from "react";
import { FormField } from "../components/auth/Signup";
import { Mail, User } from "lucide-react";

export default {
  title: "Forms/FormField",
  component: FormField,
  argTypes: {
    type: {
      control: { type: "select", options: ["text", "email", "password", "number"] },
    },
    error: { control: "text" },
    success: { control: "text" },
    hint: { control: "text" },
    required: { control: "boolean" },
    toggleVisibility: { control: "boolean" },
  },
};

const Template = (args) => {
  const [value, setValue] = useState(args.value || "");
  return (
    <div className="max-w-md rounded-lg bg-white p-4 dark:bg-gray-800">
      <FormField {...args} value={value} onChange={(e) => setValue(e.target.value)} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  id: "username",
  label: "Username",
  placeholder: "Enter your username",
  icon: User,
  hint: "This will be your public display name.",
};

export const WithError = Template.bind({});
WithError.args = {
  id: "email",
  label: "Email Address",
  type: "email",
  icon: Mail,
  value: "invalid-email",
  error: "Please enter a valid email address.",
};

export const WithSuccess = Template.bind({});
WithSuccess.args = {
  id: "username",
  label: "Username",
  icon: User,
  value: "johndoe123",
  success: "Username is available!",
};

export const RequiredState = Template.bind({});
RequiredState.args = {
  id: "username",
  label: "Username",
  icon: User,
  required: true,
};
