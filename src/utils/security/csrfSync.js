// Automated CSRF Token synchronization client helper
import axios from "axios";

export function syncCsrfToken() {
  try {
    const csrfToken = getCookie("XSRF-TOKEN");
    if (csrfToken) {
      axios.defaults.headers.common["X-XSRF-TOKEN"] = csrfToken;
    }
  } catch (err) {
    console.error("Failed to sync CSRF state token", err);
  }
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

// Automatically sync on visible focus tabs
if (typeof window !== "undefined") {
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      syncCsrfToken();
    }
  });
}
