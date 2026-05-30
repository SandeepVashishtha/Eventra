// User Profile Image file uploader format validations
export function validateImageUpload(file) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  return allowedTypes.includes(file.type);
}
