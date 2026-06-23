export function lockBodyScroll() {
  if (typeof document === "undefined") return;
  document.body.style.overflow = "hidden";
}

export function unlockBodyScroll() {
  if (typeof document === "undefined") return;
  document.body.style.overflow = "";
}
