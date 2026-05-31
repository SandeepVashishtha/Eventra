// Frontend storage migration layer for HttpOnly cookies

/**
 * Read a cookie value by name from document.cookie.
 * @param {string} name
 * @returns {string|null}
 */
export function getCookie(name) {
  if (!name || typeof document === "undefined") {
    return null;
  }

  const prefix = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(";").map((c) => c.trim());

  for (const cookie of cookies) {
    if (cookie.startsWith(prefix)) {
      return decodeURIComponent(cookie.slice(prefix.length));
    }
    const legacyPrefix = `${name}=`;
    if (cookie.startsWith(legacyPrefix)) {
      return decodeURIComponent(cookie.slice(legacyPrefix.length));
    }
  }

  return null;
}

/**
 * Set a cookie on document.cookie.
 * HttpOnly cookies must be set by the server; this helper is for
 * non-HttpOnly migration paths and testable client-side fallbacks.
 *
 * @param {string} name
 * @param {string} value
 * @param {{ path?: string, domain?: string, maxAge?: number, expires?: string, sameSite?: string, secure?: boolean }} [options]
 */
export function setCookie(name, value, options = {}) {
  if (!name || typeof document === "undefined") {
    return;
  }

  const {
    path = "/",
    domain,
    maxAge,
    expires,
    sameSite = "Strict",
    secure = true,
  } = options;

  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  cookie += `; path=${path}`;

  if (domain) {
    cookie += `; domain=${domain}`;
  }
  if (maxAge !== undefined) {
    cookie += `; max-age=${maxAge}`;
  }
  if (expires) {
    cookie += `; expires=${expires}`;
  }
  if (sameSite) {
    cookie += `; SameSite=${sameSite}`;
  }
  if (secure) {
    cookie += "; Secure";
  }

  document.cookie = cookie;
}

/**
 * Delete a cookie by expiring it immediately.
 * @param {string} name
 * @param {{ path?: string, domain?: string, sameSite?: string, secure?: boolean }} [options]
 */
export function deleteCookie(name, options = {}) {
  setCookie(name, "", {
    ...options,
    maxAge: 0,
    expires: "Thu, 01 Jan 1970 00:00:00 UTC",
  });
}
