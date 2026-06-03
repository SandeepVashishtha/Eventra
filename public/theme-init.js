(() => {
  try {
    document.documentElement.classList.add("no-transition");
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    document.documentElement.style.colorScheme = "light";
    localStorage.removeItem("theme");

    window.addEventListener("load", () => {
      document.documentElement.classList.remove("no-transition");
    });
  } catch (e) {
    console.error("Theme initialization failed:", e);
  }
})();
