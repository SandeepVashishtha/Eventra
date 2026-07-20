import { createElement } from "react";
import { toast as toastifyToast } from "react-toastify";

const AUTH_TOAST_ID = "auth-feedback";
export const UNDO_TOAST_AUTO_CLOSE_MS = 5000;

// Lazy import to avoid SSR crash — react-toastify relies on window internals
const getToast = () => {
  return toastifyToast;
};

const isSSR = () => typeof window === "undefined";

export function showAuthToast(message, onAfterClose) {
  if (isSSR()) return;
  const toast = getToast();
  toast.dismiss(AUTH_TOAST_ID);
  toast.success(message, {
    toastId: AUTH_TOAST_ID,
    autoClose: 2500,
    onClose: onAfterClose,
  });
}

export function showErrorToast(message, onAfterClose) {
  if (isSSR()) return;
  const toast = getToast();
  toast.dismiss("error-feedback");
  toast.error(message, {
    toastId: "error-feedback",
    autoClose: 3500,
    onClose: onAfterClose,
  });
}

export function showInfoToast(message, onAfterClose) {
  if (isSSR()) return;
  const toast = getToast();
  toast.dismiss("info-feedback");
  toast.info(message, {
    toastId: "info-feedback",
    autoClose: 2500,
    onClose: onAfterClose,
  });
}

export function showSuccessToast(message, options = {}) {
  if (isSSR()) return;
  const { autoClose = 2500, toastId, onClose } = options;
  const toast = getToast();
  if (toastId) toast.dismiss(toastId);
  toast.success(message, { toastId, autoClose, onClose });
}

export function showWarningToast(message, options = {}) {
  if (isSSR()) return;
  const { autoClose = 3000, toastId, onClose } = options;
  const toast = getToast();
  if (toastId) toast.dismiss(toastId);
  toast.warning(message, { toastId, autoClose, onClose });
}

export function showUndoToast({
  message,
  undoLabel = "Undo",
  toastId,
  autoClose = UNDO_TOAST_AUTO_CLOSE_MS,
  onUndo,
  onCommit,
  onError,
} = {}) {
  if (isSSR() || !message) return undefined;

  const toast = getToast();
  let settled = false;
  let id;

  const commitTimer = setTimeout(async () => {
    if (settled) return;
    settled = true;
    try {
      await onCommit?.();
    } catch (error) {
      onError?.(error);
    }
  }, autoClose);

  const handleUndo = () => {
    if (settled) return;
    settled = true;
    clearTimeout(commitTimer);
    onUndo?.();
    if (id !== undefined) toast.dismiss(id);
  };

  const content = createElement(
    "div",
    { className: "eventra-undo-toast", role: "status" },
    createElement("span", { className: "eventra-undo-toast__message" }, message),
    createElement(
      "button",
      {
        type: "button",
        className: "eventra-undo-toast__button",
        onClick: handleUndo,
      },
      undoLabel
    )
  );

  if (toastId) toast.dismiss(toastId);
  id = toast.info(content, {
    toastId,
    autoClose,
    closeOnClick: false,
    pauseOnHover: false,
    pauseOnFocusLoss: false,
    draggable: false,
  });

  return id;
}

export function dismissToastsByGroup(groupId) {
  if (isSSR()) return;
  if (typeof window !== "undefined" && window.__EVENTRA_TOASTS__) {
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
