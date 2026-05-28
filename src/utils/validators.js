export const validators = {
  email: (v) =>
    !v
      ? 'Email is required.'
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      ? 'Please enter a valid email address.'
      : '',

  password: (v) =>
    !v
      ? 'Password is required.'
      : v.length < 8
      ? 'Password must be at least 8 characters.'
      : '',

  confirmPassword: (v, password) =>
    !v
      ? 'Please confirm your password.'
      : v !== password
      ? 'Passwords do not match.'
      : '',

  name: (v) => (!v?.trim() ? 'Full name is required.' : ''),
};
