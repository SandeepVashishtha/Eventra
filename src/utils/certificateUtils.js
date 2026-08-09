import { API_BASE_URL, validateBackendConfig } from "../config/backendConfig.js";

const sanitizeUid = (uid) => {
  if (typeof uid !== "string") return "";
  return uid.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 128);
};

export async function verifyCertificate(uid) {
  const cleanUid = sanitizeUid(uid);
  if (!cleanUid) {
    return { success: false, error: "UID is required" };
  }

  const apiBaseUrl = API_BASE_URL;

  if (!apiBaseUrl) {
    const validation = validateBackendConfig();
    return {
      success: false,
      error: validation.error || "Certificate verification API URL is not configured.",
    };
  }

  try {
    const response = await fetch(
      `${apiBaseUrl}/verify-certificate/${encodeURIComponent(cleanUid)}`
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
