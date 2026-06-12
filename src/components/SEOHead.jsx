import { useEffect } from "react";

/**
 * SEOHead - Sets document title and meta tags dynamically.
 *
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Meta description (max 160 chars)
 * @param {string} [props.image] - Open Graph image URL
 * @param {string} [props.url] - Canonical URL
 * @param {string} [props.type] - OG type (default: "website")
 */
export default function SEOHead({
  title,
  description,
  image = "https://eventra.sandeepvashishtha.in/logo_transparent.png",
  url,
  type = "website",
}) {
  useEffect(() => {
    // Set document title
    document.title = title ? `${title} | Eventra` : "Eventra - Event Management";

    // Helper to set, create, or remove a meta tag
    const setMeta = (attr, key, content) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);

      // 🔥 FIX: If the new page doesn't have this content, destroy the old tag
      // to prevent stale data from leaking across SPA routes.
      if (!content) {
        if (el) el.remove();
        return;
      }

      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // Standard meta
    setMeta("name", "description", description);

    // Open Graph
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", type);
    setMeta("property", "og:image", image); // 🔥 FIX: Removed 'if (image)' so cleanup runs if it's missing
    setMeta("property", "og:url", url);

    // Twitter Card
    setMeta("name", "twitter:card", image ? "summary_large_image" : "summary");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image);

    // Canonical URL
    let link = document.querySelector('link[rel="canonical"]');
    if (url) {
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", url);
    } else {
      // 🔥 FIX: Destroy the old canonical link if the new page doesn't have one
      if (link) link.remove();
    }
  }, [title, description, image, url, type]);

  return null; // This component only manages side effects
}
