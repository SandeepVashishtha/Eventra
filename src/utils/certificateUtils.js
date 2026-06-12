const sanitizeUid = (uid) => {
  if (typeof uid !== "string") return "";
  return uid.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 128);
};

/**
 * Resolve the API base URL for certificate verification.
 *
 * In a Vite project process.env is not polyfilled, so REACT_APP_API_URL is
 * always undefined. VITE_API_URL is the correct variable name. The order is:
 *   1. import.meta.env.VITE_API_URL  (Vite builds — preferred)
 *   2. process.env.REACT_APP_API_URL (CRA / Node builds — fallback)
 *   3. empty string                   (never reached; guarded below)
 *
 * The empty string must NOT be used as a base URL: it turns the fetch into a
 * relative request to the frontend host which returns HTML (the SPA catch-all
 * route) and causes response.json() to throw a SyntaxError.
 */
const resolveApiBaseUrl = () => {
  const viteUrl = typeof import.meta !== "undefined" ? import.meta.env?.VITE_API_URL : undefined;
  const craUrl = typeof process !== "undefined" ? process.env?.REACT_APP_API_URL : undefined;
  return viteUrl || craUrl || "";
};

export async function verifyCertificate(uid) {
  const cleanUid = sanitizeUid(uid);
  if (!cleanUid) {
    return { success: false, error: "UID is required" };
  }

  const apiBaseUrl = resolveApiBaseUrl();

  if (!apiBaseUrl) {
    return {
      success: false,
      error:
        "Certificate verification API URL is not configured. " +
        "Set VITE_API_URL in your .env file (e.g. VITE_API_URL=https://api.example.com).",
    };
  }

  try {
    const response = await fetch(
      `${apiBaseUrl}/api/verify-certificate/${encodeURIComponent(cleanUid)}`
    );

    if (!response.ok) {
      const error = await response.text().catch(() => "Verification failed");
      return { success: false, error: error || `Server returned ${response.status}` };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message || "Network error during verification" };
  }
}
