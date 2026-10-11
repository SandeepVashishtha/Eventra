// CSRF token verification helper
export function verifyCsrfToken(req) {
  const token = req.headers['x-csrf-token'];
  const sessionToken = req.session?.csrfToken;
  return token && sessionToken && token === sessionToken;
}
