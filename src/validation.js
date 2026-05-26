export const validate = {
  email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || "Invalid email format",
  password: (val) => val.length >= 8 || "Password must be at least 8 characters",
  required: (val) => (val && val.trim() !== "") || "This field is required",
  usernameOrEmail: (val) => (val && val.trim() !== "") || "Email or username is required",
  firstName: (val) => {
    if (!val || !val.trim()) return "First name is required";
    if (val.length < 2) return "At least 2 characters";
    if (val.length > 50) return "Less than 50 characters";
    return true;
  },
  lastName: (val) => {
    if (!val || !val.trim()) return "Last name is required";
    if (val.length < 2) return "At least 2 characters";
    if (val.length > 50) return "Less than 50 characters";
    return true;
  },
  fullName: (val) => (val && val.trim() !== "") || "Full name is required",
  phone: (val) => /^\+?[\d\s-()]{10,}$/.test(val) || "Phone number is invalid",
  confirmPassword: (val, allValues) => {
    if (!val || !val.trim()) return "Please confirm your password";
    if (val !== allValues.password) return "Passwords do not match";
    return true;
  },
  minLength: (min) => (val) => (val && val.length >= min) || `Minimum ${min} characters`,
  maxLength: (max) => (val) => (!val || val.length <= max) || `Maximum ${max} characters`,
};