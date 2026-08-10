
/**
 * adds an accent stripper.
 */
export function removeAccents(str) {
  return String(str).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

