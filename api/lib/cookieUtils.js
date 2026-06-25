export function setAuthCookie(res, token, maxAgeSeconds) {
  const isProd = process.env.NODE_ENV === "production";
  const sameSite = process.env.COOKIE_SAME_SITE || 'None';
  const isSecure = isProd || sameSite.toLowerCase() === 'none';
  const cookieValue = `token=${token}; HttpOnly; Path=/; Max-Age=${maxAgeSeconds}; SameSite=${sameSite}${isSecure ? '; Secure' : ''}`;
  try {
    if (typeof res.setHeader === 'function') {
      res.setHeader('Set-Cookie', cookieValue);
    } else if (typeof res.set === 'function') {
      res.set({ 'Set-Cookie': cookieValue });
    } else if (res.headers && typeof res.headers === 'object') {
      res.headers['Set-Cookie'] = cookieValue;
    }
  } catch (e) {
    // Ignore write errors on test response objects
  }
}
