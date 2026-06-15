export const safeCookieStorage = {
  getItem(key) {
    try {
      const name = key + "=";
      const decodedCookie = decodeURIComponent(document.cookie);
      const ca = decodedCookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
      }
    } catch {}
    return null;
  },
  setItem(key, value, days = 7) {
    try {
      const d = new Date();
      d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
      const expires = "expires=" + d.toUTCString();
      document.cookie = `${key}=${encodeURIComponent(value)};${expires};path=/;SameSite=Strict;Secure`;
      return true;
    } catch {
      return false;
    }
  }
};
