import { useState } from "react";
import { Link2, Check } from "lucide-react";
import useEventShare from "hooks/useEventShare";

const CopyLinkButton = ({ title = "Event", text = "Check out this event!", url }) => {
  const [copied, setCopied] = useState(false);
  const { canNativeShare, shareEvent, copyInviteLink } = useEventShare({
    fallbackMessage: "Event invite link copied to clipboard",
  });

  const handleCopy = async () => {
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
    const ok = canNativeShare
      ? await shareEvent({ title, text, url: shareUrl })
      : await copyInviteLink(shareUrl);

    if (ok && !canNativeShare) {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg ${
        copied
          ? "bg-green-600 text-white"
          : "bg-indigo-600 hover:bg-indigo-700 text-white"
      }`}
      aria-label={canNativeShare ? "Share event invite" : "Copy event link"}
    >
      {copied ? (
        <>
          <Check size={18} />
          Copied!
        </>
      ) : (
        <>
          <Link2 size={18} />
          {canNativeShare ? "Share Event" : "Copy Link"}
        </>
      )}
    </button>
  );
};

export default CopyLinkButton;
