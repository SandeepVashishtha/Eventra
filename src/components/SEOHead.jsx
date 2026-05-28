import { Helmet } from "react-helmet-async";

export default function SEOHead({
  title = "Eventra — Event Management Platform",
  description = "Create, manage, and track events seamlessly with Eventra.",
  image = "/og-default.png",
  url,
}) {
  const fullTitle = title.includes("Eventra") ? title : `${title} | Eventra`;
  const canonical = url || (typeof window !== "undefined" ? window.location.href : "https://eventra.vercel.app");

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* OpenGraph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
