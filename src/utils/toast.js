import toast from "react-hot-toast";

const AUTH_TOAST_ID = "auth-feedback";

export function showAuthToast(message, onAfterClose) {
  toast.dismiss(AUTH_TOAST_ID);
  toast.success(message, { id: AUTH_TOAST_ID, duration: 2500 });
  if (typeof onAfterClose === "function") setTimeout(onAfterClose, 2600);
}

export function showErrorToast(message, onAfterClose) {
  toast.dismiss("error-feedback");
  toast.error(message, { id: "error-feedback", duration: 3500 });
  if (typeof onAfterClose === "function") setTimeout(onAfterClose, 3600);
}

export function showInfoToast(message, onAfterClose) {
  toast.dismiss("info-feedback");
  toast(message, { id: "info-feedback", duration: 2500 });
  if (typeof onAfterClose === "function") setTimeout(onAfterClose, 2600);
}

export function showSuccessToast(message, options = {}) {
  const toastId = options.toastId;
  if (toastId) toast.dismiss(toastId);
  toast.success(message, { id: toastId, duration: options.autoClose ?? 2500 });
}

export function showWarningToast(message, options = {}) {
  const toastId = options.toastId;
  if (toastId) toast.dismiss(toastId);
  toast(message, { id: toastId, duration: options.autoClose ?? 3000, icon: '⚠️' });
}
