
/**
 * adds an age calculator.
 */
export function ageFromBirth(birthDate, now = new Date()) {
  const b = new Date(birthDate);
  if (Number.isNaN(b.getTime())) return 0;
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

