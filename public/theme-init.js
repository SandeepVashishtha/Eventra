(() => {
  try {
    const savedTheme = localStorage.getItem("theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = savedTheme || (systemDark ? "dark" : "light");

    document.documentElement.classList.add("no-transition");
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme;

    window.addEventListener("load", () => {
      document.documentElement.classList.remove("no-transition");
    });
  } catch (e) {
    console.error("Theme initialization failed:", e);
  }
})();
