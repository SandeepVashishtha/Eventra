import { toast } from "react-toastify";

const AUTH_TOAST_ID = "auth-feedback";

export function showAuthToast(message, onAfterClose) {
  toast.dismiss(AUTH_TOAST_ID);
  toast.success(message, {
    toastId: AUTH_TOAST_ID,
    autoClose: 2500,
    onClose: onAfterClose,
  });
}

export function showErrorToast(message, onAfterClose) {
  toast.dismiss("error-feedback");
  toast.error(message, {
    toastId: "error-feedback",
    autoClose: 3500,
    onClose: onAfterClose,
  });
}

export function showInfoToast(message, onAfterClose) {
  toast.dismiss("info-feedback");
  toast.info(message, {
    toastId: "info-feedback",
    autoClose: 2500,
    onClose: onAfterClose,
  });
}

export function showSuccessToast(message, options = {}) {
  const { autoClose = 2500, toastId, onClose } = options;
  if (toastId) toast.dismiss(toastId);
  toast.success(message, { toastId, autoClose, onClose });
}

export function showWarningToast(message, options = {}) {
  const { autoClose = 3000, toastId, onClose } = options;
  if (toastId) toast.dismiss(toastId);
  toast.warning(message, { toastId, autoClose, onClose });
}
