
/**
 * adds an age-at-date helper.
 */
export function calculateAge(birthDate, at = new Date()) {
  const birth = new Date(birthDate);
  const atTime = new Date(at);
  let age = atTime.getFullYear() - birth.getFullYear();
  const monthDiff = atTime.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && atTime.getDate() < birth.getDate())) age--;
  return age;
}

