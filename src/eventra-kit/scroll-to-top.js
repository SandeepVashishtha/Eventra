/**
 * adds a smooth scroll helper.
 */
export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function scrollToElement(el) {
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
