import { useState, useCallback } from 'react';

export default function useCopyToClipboard({ resetMs = 2500 } = {}) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), resetMs);
      return true;
    } catch {
      setCopied(false);
      return false;
    }
  }, [resetMs]);

  return { copy, copied };
}