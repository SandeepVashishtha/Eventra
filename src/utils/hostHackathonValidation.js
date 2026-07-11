export const REQUIRED_FIELDS = [
  "hackathonName",
  "organizerName",
  "email",
  "location",
  "startDate",
  "endDate",
  "description",
];

const LENGTH_RULES = [
  { field: "hackathonName", min: 3, max: 100, label: "Hackathon Name" },
  { field: "organizerName", min: 3, max: 100, label: "Organizer Name" },
  { field: "location", min: 3, max: 100, label: "Location" },
  { field: "description", min: 20, max: 2000, label: "Description" },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const URL_REGEX = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/i;

const isOutOfBounds = (value, min, max) => {
  const length = value.trim().length;
  return length < min || length > max;
};

const validateRequiredFields = (data) => {
  const errors = {};
  for (const field of REQUIRED_FIELDS) {
    if (!data[field]?.trim()) {
      errors[field] = `${field.replace(/([A-Z])/g, " $1")} is required!`;
    }
  }
  return errors;
};

const validateLengthBounds = (data) => {
  const errors = {};
  for (const { field, min, max, label } of LENGTH_RULES) {
    const value = data[field];
    if (value && isOutOfBounds(value, min, max)) {
      errors[field] = `${label} must be between ${min} and ${max} characters long!`;
    }
  }
  return errors;
};

const validateEmail = (data) => {
  if (!data.email) return {};
  return EMAIL_REGEX.test(data.email.trim()) ? {} : { email: "Please enter a valid email address!" };
};

const validateWebsite = (data) => {
  if (!data.website?.trim()) return {};
  return URL_REGEX.test(data.website) ? {} : { website: "Please enter a valid URL!" };
};

const isStartInPast = (data, today) => {
  if (!data.startDate) return false;
  return data.startDate < today;
};

const isEndBeforeStart = (data) => {
  if (!data.endDate || !data.startDate) return false;
  return data.endDate < data.startDate;
};

const validateDateRange = (data, today) => {
  const errors = {};
  if (isStartInPast(data, today)) {
    errors.startDate = "Start date cannot be in the past!";
  }
  if (isEndBeforeStart(data)) {
    errors.endDate = "End date cannot be before start date!";
  }
  return errors;
};

const validateParticipantLimit = (data) => {
  if (!data.participantLimit) return {};
  return Number(data.participantLimit) < 1
    ? { participantLimit: "Participant limit must be at least 1!" }
    : {};
};

export const validateHostHackathonForm = (data, today = new Date().toISOString().split("T")[0]) => ({
  ...validateRequiredFields(data),
  ...validateLengthBounds(data),
  ...validateEmail(data),
  ...validateWebsite(data),
  ...validateDateRange(data, today),
  ...validateParticipantLimit(data),
});
