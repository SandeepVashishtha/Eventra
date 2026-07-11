import { useState } from "react";
import { Link2, Check } from "lucide-react";

const CopyLinkButton = ({ url, title = "Event", text = "Check out this event!" }) => {
  const [copied, setCopied] = useState(false);
  const textToCopy = url || (typeof window !== "undefined" ? window.location.href : "");

  const markCopied = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleCopy = async () => {
  try {
    if (!textToCopy) return;

    if (navigator.share) {
      await navigator.share({
        title,
        text,
        url: textToCopy,
      });
      markCopied();
      toast.success("Link shared successfully");
      return;
    }

    await navigator.clipboard.writeText(textToCopy);

    markCopied();
    toast.success("Link copied successfully");
  } catch (err) {
    console.error(err);
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
      aria-label="Copy event link"
    >
      {copied ? (
        <>
          <Check size={18} />
          Copied!
        </>
      ) : (
        <>
          <Link2 size={18} />
          Copy Link
        </>
      )}
    </button>
  );
};

export default CopyLinkButton;
