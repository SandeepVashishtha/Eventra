(() => {
  try {
    document.documentElement.classList.add("no-transition");

    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved === "dark" || (!saved && prefersDark);

    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.classList.toggle("light", !isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";

    window.addEventListener("load", () => {
      document.documentElement.classList.remove("no-transition");
    });
  } catch (e) {
    console.error("Theme initialization failed:", e);
  }
})();