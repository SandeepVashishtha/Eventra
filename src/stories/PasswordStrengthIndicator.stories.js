import React from 'react';
import PasswordStrengthIndicator from '../components/auth/PasswordStrengthIndicator';

export default {
  title: 'Forms/PasswordStrengthIndicator',
  component: PasswordStrengthIndicator,
  argTypes: {
    password: { control: 'text' },
  },
};

const Template = (args) => (
  <div className="max-w-md p-4 bg-white dark:bg-gray-800 rounded-lg">
    <PasswordStrengthIndicator {...args} />
  </div>
);

export const Empty = Template.bind({});
Empty.args = {
  password: '',
};

export const Weak = Template.bind({});
Weak.args = {
  password: 'abc',
};

export const Medium = Template.bind({});
Medium.args = {
  password: 'Password1',
};

export const Strong = Template.bind({});
Strong.args = {
  password: 'StrongPassword123!@#',
};
