import { useState } from 'react';
import { PasswordField } from '../components/auth/Signup';

export default {
  title: 'Forms/PasswordField',
  component: PasswordField,
  argTypes: {
    error: { control: 'text' },
  },
};

const Template = (args) => {
  const [value, setValue] = useState(args.value || '');
  
  // Dummy strength logic to mimic actual behavior
  const calcStrength = (val) => {
    let score = 0;
    if (val.length > 5) score += 40;
    if (/[A-Z]/.test(val)) score += 30;
    if (/[!@#]/.test(val)) score += 30;
    
    let label = 'Weak';
    let color = 'text-red-500';
    if (score >= 75) {
      label = 'Strong';
      color = 'text-green-500';
    } else if (score >= 40) {
      label = 'Medium';
      color = 'text-yellow-500';
    }

    return { score, color, label };
  };

  return (
    <div className="max-w-md p-4 bg-white dark:bg-gray-800 rounded-lg">
      <PasswordField 
        {...args} 
        value={value} 
        onChange={(e) => setValue(e.target.value)}
        strength={args.strength || calcStrength(value)} 
      />
    </div>
  );
};

const defaultRequirements = [
  { id: 'length', label: 'At least 8 characters', regex: /.{8,}/ },
  { id: 'uppercase', label: 'One uppercase letter', regex: /[A-Z]/ },
  { id: 'special', label: 'One special character', regex: /[^A-Za-z0-9]/ },
];

export const Default = Template.bind({});
Default.args = {
  id: 'password',
  label: 'Password',
  requirements: defaultRequirements,
};

export const WithError = Template.bind({});
WithError.args = {
  id: 'password',
  label: 'Password',
  value: 'weak',
  error: 'Password is too short.',
  requirements: defaultRequirements,
};

export const StrongPassword = Template.bind({});
StrongPassword.args = {
  id: 'password',
  label: 'Password',
  value: 'StrongPass!23',
  requirements: defaultRequirements,
};
