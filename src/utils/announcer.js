export const announceToScreenReader = (message, politeness = "polite") => {
  if (typeof document === "undefined") return;
  let announcer = document.getElementById("eventra-live-announcer");
  if (!announcer) {
    announcer = document.createElement("div");
    announcer.id = "eventra-live-announcer";
    announcer.style.position = "absolute";
    announcer.style.width = "1px";
    announcer.style.height = "1px";
    announcer.style.overflow = "hidden";
    announcer.setAttribute("aria-live", politeness);
    document.body.appendChild(announcer);
  }
  announcer.textContent = "";
  setTimeout(() => {
    announcer.textContent = message;
  }, 100);
};
