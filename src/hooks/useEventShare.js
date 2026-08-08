import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { copyToClipboard } from "utils/shareUtils.js";

const isAbortError = (error) => {
  return error?.name === "AbortError" || error?.name === "NotAllowedError";
};

const normalizeSharePayload = (shareData = {}) => {
  const url = shareData.url || shareData.shareUrl || "";
  const title = shareData.title || "Eventra event";
  const text = shareData.text || shareData.description || shareData.shareText || "Check out this event on Eventra.";

  return { title, text, url };
};

export default function useEventShare({ fallbackMessage = "Event link copied to clipboard" } = {}) {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const canNativeShare = useMemo(() => {
    return typeof navigator !== "undefined" && typeof navigator.share === "function";
  }, []);

  const copyInviteLink = useCallback(
    async (url) => {
      if (!url) {
        toast.error("No event link available to copy");
        return false;
      }

      const copiedToClipboard = await copyToClipboard(url);
      if (copiedToClipboard) {
        setCopied(true);
        toast.success(fallbackMessage);
        setTimeout(() => setCopied(false), 2500);
        return true;
      }

      toast.error("Could not copy the event link");
      return false;
    },
    [fallbackMessage],
  );

  const shareEvent = useCallback(
    async (shareData) => {
      const payload = normalizeSharePayload(shareData);

      if (!payload.url) {
        toast.error("No event link available to share");
        return false;
      }

      if (canNativeShare) {
        const nativePayload = {
          title: payload.title,
          text: payload.text,
          url: payload.url,
        };

        try {
          setIsSharing(true);
          if (!navigator.canShare || navigator.canShare(nativePayload)) {
            await navigator.share(nativePayload);
            return true;
          }
        } catch (error) {
          if (isAbortError(error)) {
            return false;
          }

          console.error("Failed to share event via native share sheet:", error);
          toast.error("Could not open system share");
          return false;
        } finally {
          setIsSharing(false);
        }
      }

      return copyInviteLink(payload.url);
    },
    [canNativeShare, copyInviteLink],
  );

  return {
    canNativeShare,
    copied,
    copyInviteLink,
    isSharing,
    shareEvent,
  };
}
