/**
 * Search certificates by title or event name
 */
export const searchCertificates = (
  certificates = [],
  query = ""
) => {
  if (!query.trim()) return certificates;

  const keyword = query.toLowerCase();

  return certificates.filter(
    (certificate) =>
      certificate.title?.toLowerCase().includes(keyword) ||
      certificate.eventName?.toLowerCase().includes(keyword)
  );
};

/**
 * Filter certificates
 */
export const filterCertificates = (
  certificates = [],
  year = "All",
  category = "All",
  status = "All"
) => {
  return certificates.filter((certificate) => {
    const certificateYear = certificate.issueDate
      ? new Date(certificate.issueDate).getFullYear().toString()
      : "";

    const matchesYear =
      year === "All" || certificateYear === year;

    const matchesCategory =
      category === "All" ||
      certificate.category === category;

    const matchesStatus =
      status === "All" ||
      certificate.status === status;

    return (
      matchesYear &&
      matchesCategory &&
      matchesStatus
    );
  });
};

/**
 * Sort certificates by newest first
 */
export const sortCertificates = (
  certificates = []
) => {
  return [...certificates].sort(
    (a, b) =>
      new Date(b.issueDate || 0) -
      new Date(a.issueDate || 0)
  );
};

/**
 * Get available years
 */
export const getCertificateYears = (
  certificates = []
) => {
  return [
    ...new Set(
      certificates
        .filter((certificate) => certificate.issueDate)
        .map((certificate) =>
          new Date(certificate.issueDate)
            .getFullYear()
            .toString()
        )
    ),
  ].sort((a, b) => b.localeCompare(a));
};

/**
 * Get available categories
 */
export const getCertificateCategories = (
  certificates = []
) => {
  return [
    ...new Set(
      certificates
        .map((certificate) => certificate.category)
        .filter(Boolean)
    ),
  ].sort();
};

/**
 * Get issued certificates
 */
export const getIssuedCertificates = (
  certificates = []
) => {
  return certificates.filter(
    (certificate) =>
      certificate.status === "Issued"
  );
};

/**
 * Get pending certificates
 */
export const getPendingCertificates = (
  certificates = []
) => {
  return certificates.filter(
    (certificate) =>
      certificate.status === "Pending"
  );
};

/**
 * Format issue date
 */
export const formatIssueDate = (
  issueDate
) => {
  if (!issueDate) return "Not Available";

  return new Date(issueDate).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

/**
 * Download certificate
 */
export const downloadCertificate = (
  certificate
) => {
  if (!certificate?.downloadUrl) return;

  const link = document.createElement("a");
  link.href = certificate.downloadUrl;
  link.download =
    certificate.fileName ||
    `${certificate.title}.pdf`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Get certificate statistics
 */
export const getCertificateStats = (
  certificates = []
) => {
  const issued = getIssuedCertificates(
    certificates
  ).length;

  const pending = getPendingCertificates(
    certificates
  ).length;

  return {
    total: certificates.length,
    issued,
    pending,
  };
};