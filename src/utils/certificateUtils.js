const sanitizeUid = (uid) => {
  if (typeof uid !== "string") return "";
  return uid.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 128);
};

export async function verifyCertificate(uid) {
  const cleanUid = sanitizeUid(uid);
  if (!cleanUid) {
    return { success: false, error: "UID is required" };
  }

  const apiBaseUrl = process.env.REACT_APP_API_URL || process.env.VITE_API_URL || "";

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
