/**
 * Generates a SHA-256 checksum for API request payloads.
 * Used for request integrity validation and debugging.
 */

const encoder = new TextEncoder();

export async function generateRequestIntegrity(payload) {
  const normalizedPayload =
    payload === undefined || payload === null
      ? ""
      : typeof payload === "string"
      ? payload
      : JSON.stringify(payload);

  const data = encoder.encode(normalizedPayload);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function createIntegrityHeader(payload) {
  return generateRequestIntegrity(payload);
}
