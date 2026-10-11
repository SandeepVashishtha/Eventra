import { useCallback, useEffect, useRef, useState } from "react";

const fallbackCopy = (text) => {
  if (typeof document === "undefined") return false;

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
};

export default function useCopyToClipboard({ resetMs = 2000 } = {}) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef(null);

  const copy = useCallback(
    async (text) => {
      if (!text) return false;

      try {
        if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else if (!fallbackCopy(text)) {
          return false;
        }

        setCopied(true);
        if (resetTimerRef.current) {
          clearTimeout(resetTimerRef.current);
        }
        resetTimerRef.current = setTimeout(() => setCopied(false), resetMs);
        return true;
      } catch {
        return false;
      }
    },
    [resetMs]
  );

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  return { copy, copied };
}
