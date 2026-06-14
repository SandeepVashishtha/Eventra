export const toast = {
  info: (msg) => { if (globalThis.mockToast?.info) globalThis.mockToast.info(msg); },
  warning: (msg) => { if (globalThis.mockToast?.warning) globalThis.mockToast.warning(msg); },
  success: (msg) => { if (globalThis.mockToast?.success) globalThis.mockToast.success(msg); },
  error: (msg) => { if (globalThis.mockToast?.error) globalThis.mockToast.error(msg); },
};
