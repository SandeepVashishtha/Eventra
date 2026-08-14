const ENCRYPTION_KEY_NAME = "eventra_session_sec_key";

async function getOrCreateKey() {
  let rawKey = localStorage.getItem(ENCRYPTION_KEY_NAME);
  if (!rawKey) {
    const key = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    const exported = await crypto.subtle.exportKey("raw", key);
    rawKey = btoa(String.fromCharCode(...new Uint8Array(exported)));
    localStorage.setItem(ENCRYPTION_KEY_NAME, rawKey);
  }

  const binaryKey = Uint8Array.from(atob(rawKey), c => c.charCodeAt(0));
  return crypto.subtle.importKey(
    "raw",
    binaryKey,
    "AES-GCM",
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encryptSessionData(key, value) {
  try {
    const cryptoKey = await getOrCreateKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(JSON.stringify(value));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      encoded
    );

    const packed = {
      iv: btoa(String.fromCharCode(...iv)),
      data: btoa(String.fromCharCode(...new Uint8Array(encrypted)))
    };
    sessionStorage.setItem(key, JSON.stringify(packed));
  } catch (err) {
    console.error("Session encryption failed.", err);
  }
}

export async function decryptSessionData(key) {
  try {
    const packedRaw = sessionStorage.getItem(key);
    if (!packedRaw) return null;

    const packed = JSON.parse(packedRaw);
    const cryptoKey = await getOrCreateKey();
    const iv = Uint8Array.from(atob(packed.iv), c => c.charCodeAt(0));
    const encrypted = Uint8Array.from(atob(packed.data), c => c.charCodeAt(0));

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      encrypted
    );

    return JSON.parse(new TextDecoder().decode(decrypted));
  } catch (err) {
    console.error("Session decryption failed.", err);
    return null;
  }
}
