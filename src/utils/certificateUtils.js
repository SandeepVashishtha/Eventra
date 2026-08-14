import { API_BASE_URL, validateBackendConfig } from "../config/backendConfig.js";

const sanitizeUid = (uid) => {
  if (uid === null || uid === undefined) return "";
  return String(uid).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 128);
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

/**
 * Search certificates by title or event name.
 */
export const searchCertificates = (certificates = [], query = "") => {
  if (!query.trim()) return certificates;

  const keyword = query.toLowerCase();

  return certificates.filter(
    (certificate) =>
      certificate.title?.toLowerCase().includes(keyword) ||
      certificate.eventName?.toLowerCase().includes(keyword)
  );
};

const certificateYear = (issueDate) => {
  if (!issueDate) return "";
  const year = new Date(issueDate).getFullYear();
  return Number.isNaN(year) ? "" : year.toString();
};

/**
 * Filter certificates by issue year, category, and status.
 */
export const filterCertificates = (
  certificates = [],
  year = "All",
  category = "All",
  status = "All"
) => {
  return certificates.filter((certificate) => {
    const certificateYearValue = certificateYear(certificate.issueDate);

    const matchesYear = year === "All" || certificateYearValue === year;
    const matchesCategory = category === "All" || certificate.category === category;
    const matchesStatus = status === "All" || certificate.status === status;

    return matchesYear && matchesCategory && matchesStatus;
  });
};

/**
 * Get the distinct issue years present across certificates, newest first.
 */
export const getCertificateYears = (certificates = []) => {
  return [
    ...new Set(
      certificates
        .filter((certificate) => certificateYear(certificate.issueDate))
        .map((certificate) => certificateYear(certificate.issueDate))
    ),
  ].sort((a, b) => b.localeCompare(a));
};

/**
 * Get the distinct categories present across certificates.
 */
export const getCertificateCategories = (certificates = []) => {
  return [
    ...new Set(
      certificates.map((certificate) => certificate.category).filter(Boolean)
    ),
  ].sort();
};
