export const REQUIRED_FIELDS = [
  "projectName",
  "teamName",
  "email",
  "githubLink",
  "projectType",
  "techStack",
  "description",
];

const formatFieldName = (fieldName) => {
  const result = fieldName.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export const validateSubmitProjectForm = (data) => {
  const newErrors = {};

  for (const field of REQUIRED_FIELDS) {
    if (!data[field]?.trim()) {
      newErrors[field] = `${formatFieldName(field)} is required.`;
    }
  }

  if (data.projectName && (data.projectName.trim().length < 3 || data.projectName.trim().length > 100)) {
    newErrors.projectName = "Project Name must be between 3 and 100 characters.";
  }
  if (data.teamName && (data.teamName.trim().length < 3 || data.teamName.trim().length > 100)) {
    newErrors.teamName = "Team Name must be between 3 and 100 characters.";
  }
  if (data.description && (data.description.trim().length < 20 || data.description.trim().length > 2000)) {
    newErrors.description = "Description must be between 20 and 2000 characters.";
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    newErrors.email = "Please enter a valid email address.";
  }
  if (
    data.githubLink &&
    !/^(https?:\/\/)?(www\.)?github\.com\/[\w-]+\/[\w-]+(\/)?$/i.test(data.githubLink.trim())
  ) {
    newErrors.githubLink = "Please enter a valid GitHub repository URL.";
  }
  const urlRegex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/i;
  if (data.liveDemoLink?.trim() && !urlRegex.test(data.liveDemoLink)) {
    newErrors.liveDemoLink = "Please enter a valid URL.";
  }
  if (data.projectImage?.trim()) {
    const isBase64 = data.projectImage.startsWith("data:image/");
    if (!isBase64 && !urlRegex.test(data.projectImage)) {
      newErrors.projectImage = "Please enter a valid image URL.";
    }
  }

  return newErrors;
};
