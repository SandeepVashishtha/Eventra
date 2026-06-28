import { setCookie, getCookie } from "./cookieUtils.js";

export const safeCookieStorage = {
  getItem(key) {
    return getCookie(key);
  },
  setItem(key, value, days = 7) {
    try {
      const expiresDate = new Date();
      expiresDate.setTime(expiresDate.getTime() + (days * 24 * 60 * 60 * 1000));
      return setCookie(key, value, {
        expires: expiresDate,
        path: "/",
        secure: true,
        sameSite: "Strict",
      });
    } catch {
      return false;
    }
  }
};
