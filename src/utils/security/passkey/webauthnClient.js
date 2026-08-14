/**
 * Client-side WebAuthn challenge verification mapping utilities (#17672)
 */

export async function createPasskeyCredentials(challengeBase64, username) {
  if (typeof window === "undefined" || !window.navigator.credentials) {
    return { success: false, error: "WebAuthn not supported." };
  }

  // Convert challenge token to ArrayBuffer
  const challenge = Uint8Array.from(atob(challengeBase64), c => c.charCodeAt(0));
  const userId = new TextEncoder().encode(username);

  const publicKeyCredentialCreationOptions = {
    challenge,
    rp: { name: "Eventra Inc.", id: window.location.hostname },
    user: { id: userId, name: username, displayName: username },
    pubKeyCredParams: [{ alg: -7, type: "public-key" }], // ES256 algorithm support
    timeout: 60000,
    attestation: "direct"
  };

  try {
    const credential = await navigator.credentials.create({ publicKey: publicKeyCredentialCreationOptions });
    return { success: true, credential };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
