import { toast } from "react-toastify";

const AUTH_TOAST_ID = "auth-feedback";

/** Auth flows: dismiss stale toasts, show one toast, navigate after it closes. */
export function showAuthToast(message, onAfterClose) {
  toast.dismiss(AUTH_TOAST_ID);
  toast.success(message, {
    toastId: AUTH_TOAST_ID,
    autoClose: 2500,
    onClose: onAfterClose,
  });
}
