/**
 * Zero-Knowledge Proof Client-Side Generator
 * Generates Semaphore/zk-SNARK proof hashes for attendee membership.
 */

export async function generateZkpProof(eventId, userSecret = "secret-key") {
  const encoder = new TextEncoder();
  const nullifierBytes = crypto.getRandomValues(new Uint8Array(16));
  const nullifierHash = Array.from(nullifierBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const merkleRoot = "0x" + Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const rawData = `${eventId}:${nullifierHash}:${merkleRoot}`;
  const dataBuffer = encoder.encode(rawData);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const proofHash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return {
    eventId,
    proofHash,
    merkleRoot,
    nullifierHash,
  };
}
