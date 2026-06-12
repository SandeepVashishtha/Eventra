import { Share2 } from "lucide-react";

export const LinkedInShareButton = ({ title, url, summary, className = "" }) => {
  const handleShare = () => {
    const shareUrl = new URL("https://www.linkedin.com/sharing/share-offsite/");
    shareUrl.searchParams.set("url", url || window.location.href);

    if (summary) {
      shareUrl.searchParams.set("summary", summary);
    }

    if (title) {
      shareUrl.searchParams.set("title", title);
    }

    window.open(shareUrl.toString(), "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center gap-2 rounded bg-[#0A66C2] px-3 py-1.5 text-white transition hover:bg-[#004182] ${className}`}
      aria-label={title ? `Share ${title} on LinkedIn` : "Share on LinkedIn"}
    >
      <Share2 size={16} aria-hidden="true" />
      Share on LinkedIn
    </button>
  );
};

export default LinkedInShareButton;
