
/**
 * adds a focus helper.
 */
export function focusElement(id) {
  const el = document.getElementById(id);
  if (el) el.focus();
}

export function focusFirstInvalid(formEl) {
  if (!formEl) return;
  const invalid = formEl.querySelector('[aria-invalid="true"], .invalid');
  if (invalid) invalid.focus();
}

