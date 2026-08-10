
/**
 * adds an age calculator.
 */
export function getAge(birthDate, now = new Date()) {
  const birth = new Date(birthDate);
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

