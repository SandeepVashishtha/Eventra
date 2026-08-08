/**
 * Helpers for Hackathon Lifecycle phase documents / starter kits.
 */

/**
 * Resolves whether a phase resource can be fetched and how.
 * @param {{ name?: string, type?: string, url?: string|null }} resource
 * @returns {{ available: boolean, url?: string, label: string, message?: string }}
 */
export function resolveHackathonResourceAction(resource) {
  if (!resource || typeof resource !== "object") {
    return {
      available: false,
      label: "Unavailable",
      message: "This resource is not available.",
    };
  }

  const url = typeof resource.url === "string" ? resource.url.trim() : "";
  if (!url) {
    return {
      available: false,
      label: "Unavailable",
      message: `"${resource.name || "This file"}" is not available for download yet.`,
    };
  }

  const type = String(resource.type || "").toLowerCase();
  const isExternal = type.includes("link") || type.includes("external") || type.includes("video");

  return {
    available: true,
    url,
    label: isExternal ? "Open Link" : "Fetch File",
  };
}

/**
 * Opens a resource URL in a new tab (download or external link).
 * @param {string} url
 */
export function openHackathonResource(url) {
  if (typeof window === "undefined" || !url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}
