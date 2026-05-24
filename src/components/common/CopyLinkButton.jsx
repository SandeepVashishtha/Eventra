import React, { useState } from "react";
import { Link2, Check } from "lucide-react";
import { toast } from "react-toastify";

const CopyLinkButton = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);

      setCopied(true);

      toast.success("Event link copied successfully!");

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);

      toast.error("Failed to copy link");
    }
  };

  return (
    <button
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