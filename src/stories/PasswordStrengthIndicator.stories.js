import PasswordStrengthIndicator from "../components/auth/PasswordStrengthIndicator";

export default {
  title: "Forms/PasswordStrengthIndicator",
  component: PasswordStrengthIndicator,
  argTypes: {
    password: { control: "text" },
  },
};

const Template = (args) => (
  <div className="max-w-md rounded-lg bg-white p-4 dark:bg-gray-800">
    <PasswordStrengthIndicator {...args} />
  </div>
);

export const Empty = Template.bind({});
Empty.args = {
  password: "",
};

export const Weak = Template.bind({});
Weak.args = {
  password: "abc",
};

export const Medium = Template.bind({});
Medium.args = {
  password: "Password1",
};

export const Strong = Template.bind({});
Strong.args = {
  password: "StrongPassword123!@#",
};
