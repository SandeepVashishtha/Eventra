const listeners = new Set();
let nextToastId = 1;

const DEFAULT_AUTO_CLOSE = 2500;

const emit = (type, message, options = {}) => {
  const id = options.toastId ?? nextToastId++;
  const autoClose =
    typeof options.autoClose === "number" ? options.autoClose : DEFAULT_AUTO_CLOSE;

  const toastItem = {
    id,
    type,
    message,
    autoClose,
    createdAt: Date.now(),
  };

  listeners.forEach((listener) => listener({ action: "add", toast: toastItem }));
  return id;
};

export const toast = {
  success: (message, options) => emit("success", message, options),
  error: (message, options) => emit("error", message, options),
  info: (message, options) => emit("info", message, options),
  warning: (message, options) => emit("warning", message, options),
  warn: (message, options) => emit("warning", message, options),
  dismiss: (id) => {
    listeners.forEach((listener) => listener({ action: "dismiss", id }));
  },
  onChange: (callback) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },
  clearWaitingQueue: () => {},
};
