export function shiftFocusToElement(selector) {
  if (typeof document === "undefined") return;
  const element = document.querySelector(selector);
  if (element) {
    element.focus();
  }
}
