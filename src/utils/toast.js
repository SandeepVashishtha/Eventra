import toast from 'react-hot-toast';

const AUTH_TOAST_ID = "auth-feedback";

export function showAuthToast(message, onAfterClose) {
  toast.dismiss(AUTH_TOAST_ID);
  toast.success(message, { id: AUTH_TOAST_ID, duration: 2500 });
  if (onAfterClose) {
    setTimeout(onAfterClose, 2500);
  }
}

export function showErrorToast(message, onAfterClose) {
  toast.dismiss("error-feedback");
  toast.error(message, { id: "error-feedback", duration: 3500 });
  if (onAfterClose) {
    setTimeout(onAfterClose, 3500);
  }
}

export function showInfoToast(message, onAfterClose) {
  toast.dismiss("info-feedback");
  toast(message, { id: "info-feedback", duration: 2500 });
  if (onAfterClose) {
    setTimeout(onAfterClose, 2500);
  }
}

export function showSuccessToast(message, options = {}) {
  const { duration = 2500, id, onClose } = options;
  if (id) toast.dismiss(id);
  toast.success(message, { id, duration });
  if (onClose) {
    setTimeout(onClose, duration);
  }
}

export function showWarningToast(message, options = {}) {
  const { duration = 3000, id, onClose } = options;
  if (id) toast.dismiss(id);
  toast(message, { id, duration, icon: '⚠️' });
  if (onClose) {
    setTimeout(onClose, duration);
  }
}
