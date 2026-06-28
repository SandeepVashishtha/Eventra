import { Helmet } from "react-helmet-async";

/**
 * SEOHead - Sets document title and meta tags dynamically using react-helmet-async.
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
  const fullTitle = title ? `${title} | Eventra` : "Eventra - Event Management";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      {type && <meta property="og:type" content={type} />}
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
      
      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}
      
      {url && <link rel="canonical" href={url} />}
    </Helmet>
  );
}