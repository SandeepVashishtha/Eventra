import { setCookie, getCookie } from "./cookieUtils.js";

export const safeCookieStorage = {
  getItem(key) {
    if (typeof document === 'undefined') return null;
    return getCookie(key);
  },
  setItem(key, value, days = 7) {
    if (typeof document === 'undefined') return false;
    try {
      const expiresDate = new Date();
      expiresDate.setTime(expiresDate.getTime() + (days * 24 * 60 * 60 * 1000));
      return setCookie(key, value, {
        expires: expiresDate,
        path: "/",
        secure: true,
      });
    } catch {
      return false;
    }
  }
};
