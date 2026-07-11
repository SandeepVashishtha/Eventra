const AUTH_TOAST_ID = "auth-feedback";

// Lazy import to avoid SSR crash — react-toastify relies on window internals
let _toast = null;
const getToast = () => {
  if (!_toast) {
    // eslint-disable-next-line global-require
    const mod = require("react-toastify");
    _toast = mod.toast;
  }
  return _toast;
};

const isBrowser = () => typeof window !== "undefined";

export function showAuthToast(message, onAfterClose) {
  if (!isBrowser()) return;
  const toast = getToast();
  toast.dismiss(AUTH_TOAST_ID);
  toast.success(message, {
    toastId: AUTH_TOAST_ID,
    autoClose: 2500,
    onClose: onAfterClose,
  });
}

export function showErrorToast(message, onAfterClose) {
  if (!isBrowser()) return;
  const toast = getToast();
  toast.dismiss("error-feedback");
  toast.error(message, {
    toastId: "error-feedback",
    autoClose: 3500,
    onClose: onAfterClose,
  });
}

export function showInfoToast(message, onAfterClose) {
  if (!isBrowser()) return;
  const toast = getToast();
  toast.dismiss("info-feedback");
  toast.info(message, {
    toastId: "info-feedback",
    autoClose: 2500,
    onClose: onAfterClose,
  });
}

export function showSuccessToast(message, options = {}) {
  if (!isBrowser()) return;
  const { autoClose = 2500, toastId, onClose } = options;
  const toast = getToast();
  if (toastId) toast.dismiss(toastId);
  toast.success(message, { toastId, autoClose, onClose });
}

export function showWarningToast(message, options = {}) {
  if (!isBrowser()) return;
  const { autoClose = 3000, toastId, onClose } = options;
  const toast = getToast();
  if (toastId) toast.dismiss(toastId);
  toast.warning(message, { toastId, autoClose, onClose });
}

export function dismissToastsByGroup(groupId) {
  if (!isBrowser()) return;
  if (window.__EVENTRA_TOASTS__) {
    const list = window.__EVENTRA_TOASTS__[groupId] || [];
    list.forEach((_id) => {
      try {
        // trigger clear callbacks
      } catch {
        /* noop */
      }
    });
    window.__EVENTRA_TOASTS__[groupId] = [];
  }
}
