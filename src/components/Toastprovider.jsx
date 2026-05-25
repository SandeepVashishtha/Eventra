import { useContext, useEffect, useRef, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { toast } from "../utils/toast";

const ToastProvider = () => {
  const { theme } = useContext(ThemeContext);
  const toastTimersRef = useRef(new Map());
  const [toasts, setToasts] = useState([]);

  const dismissToast = (id) => {
    if (id == null) {
      setToasts([]);
      toastTimersRef.current.forEach((timer) => clearTimeout(timer));
      toastTimersRef.current.clear();
      return;
    }

    setToasts((prev) => prev.filter((item) => item.id !== id));
    const timer = toastTimersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimersRef.current.delete(id);
    }
  };

  useEffect(() => {
    const timers = toastTimersRef.current;

    const unsubscribe = toast.onChange((payload) => {
      const { action, id, toast: incomingToast } = payload;

      if (action === "add" && incomingToast) {
        setToasts((prev) => {
          const filtered = prev.filter((item) => item.id !== incomingToast.id);
          return [...filtered, incomingToast];
        });

        if (incomingToast.autoClose === false) {
          return;
        }

        const existingTimer = timers.get(incomingToast.id);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        const timer = window.setTimeout(() => {
          dismissToast(incomingToast.id);
        }, incomingToast.autoClose);

        timers.set(incomingToast.id, timer);
      }

      if (action === "dismiss") {
        if (typeof id === "undefined") {
          dismissToast(null);
        } else {
          dismissToast(id);
        }
      }
    });

    return () => {
      unsubscribe();
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const palette =
    theme === "dark"
      ? {
          bg: "#111827",
          border: "#374151",
          text: "#f9fafb",
          muted: "#d1d5db",
        }
      : {
          bg: "#ffffff",
          border: "#e5e7eb",
          text: "#111827",
          muted: "#4b5563",
        };

  const accentByType = {
    success: "#16a34a",
    error: "#dc2626",
    info: "#2563eb",
    warning: "#d97706",
  };

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        zIndex: 2147483647,
        display: "flex",
        flexDirection: "column",
        gap: "0.6rem",
        pointerEvents: "none",
      }}
    >
      {toasts.map((item) => {
        const accent = accentByType[item.type] || accentByType.info;

        return (
          <div
            key={item.id}
            role="status"
            style={{
              width: "min(360px, calc(100vw - 2rem))",
              background: palette.bg,
              border: `1px solid ${palette.border}`,
              borderLeft: `4px solid ${accent}`,
              borderRadius: "10px",
              boxShadow: "0 10px 28px rgba(0, 0, 0, 0.18)",
              color: palette.text,
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "0.65rem",
              alignItems: "start",
              padding: "0.7rem 0.75rem",
              pointerEvents: "auto",
            }}
          >
            <div style={{ fontSize: "0.95rem", lineHeight: 1.35, color: palette.muted }}>
              {String(item.message ?? "")}
            </div>

            <button
              type="button"
              aria-label="Close notification"
              onClick={() => dismissToast(item.id)}
              style={{
                border: "none",
                background: "transparent",
                color: palette.muted,
                cursor: "pointer",
                padding: "0.1rem 0.2rem",
                fontSize: "1rem",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastProvider;
