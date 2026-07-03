export const REQUIRED_FIELDS = [
  "projectName",
  "teamName",
  "email",
  "githubLink",
  "projectType",
  "techStack",
  "description",
];

const LENGTH_RULES = [
  { field: "projectName", min: 3, max: 100, label: "Project Name" },
  { field: "teamName", min: 3, max: 100, label: "Team Name" },
  { field: "description", min: 20, max: 2000, label: "Description" },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GITHUB_REGEX = /^(https?:\/\/)?(www\.)?github\.com\/[\w-]+\/[\w-]+(\/)?$/i;
const URL_REGEX = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/i;

const isValidProjectImage = (value) => value.startsWith("data:image/") || URL_REGEX.test(value);

const isOutOfBounds = (value, min, max) => {
  const length = value.trim().length;
  return length < min || length > max;
};

// `optional` fields are only validated when non-blank; the others are always checked
// (their "required" error is raised separately by validateRequiredFields).
const FORMAT_RULES = [
  { field: "email", optional: false, test: (v) => EMAIL_REGEX.test(v.trim()), message: "Please enter a valid email address." },
  { field: "githubLink", optional: false, test: (v) => GITHUB_REGEX.test(v.trim()), message: "Please enter a valid GitHub repository URL." },
  { field: "liveDemoLink", optional: true, test: (v) => URL_REGEX.test(v), message: "Please enter a valid URL." },
  { field: "projectImage", optional: true, test: isValidProjectImage, message: "Please enter a valid image URL." },
];

const formatFieldName = (fieldName) => {
  const result = fieldName.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

const validateRequiredFields = (data) => {
  const errors = {};
  for (const field of REQUIRED_FIELDS) {
    if (!data[field]?.trim()) {
      errors[field] = `${formatFieldName(field)} is required.`;
    }
  }
  return errors;
};

const validateLengthBounds = (data) => {
  const errors = {};
  for (const { field, min, max, label } of LENGTH_RULES) {
    const value = data[field];
    if (value && isOutOfBounds(value, min, max)) {
      errors[field] = `${label} must be between ${min} and ${max} characters.`;
    }
  }
  return errors;
};

const validateFormats = (data) => {
  const errors = {};
  for (const { field, optional, test, message } of FORMAT_RULES) {
    const value = data[field];
    const hasValue = optional ? value?.trim() : value;
    if (hasValue && !test(value)) {
      errors[field] = message;
    }
  }
  return errors;
};

export const validateSubmitProjectForm = (data) => ({
  ...validateRequiredFields(data),
  ...validateLengthBounds(data),
  ...validateFormats(data),
});
