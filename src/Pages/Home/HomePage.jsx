import { Helmet } from "react-helmet-async";

import Hero from "./components/Hero";
import WhatsHappening from "./components/WhatsHappening";
import HomeCTA from "./components/HomeCTA";
import RecommendationBanner from "./components/RecommendationBanner";
import TrendingEvents from "../../components/TrendingEvents/TrendingEvents";
import CollaborationNetworkMap from "../../components/visual/CollaborationNetworkMap";
import CollaborationMap from "../../components/CollaborationMap";
import useDocumentTitle from "../../hooks/useDocumentTitle";

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const SITE_URL = "https://eventra.vercel.app";
const SITE_IMAGE = "https://eventra.sandeepvashishtha.in/logo_transparent.png";
const SITE_TITLE = "Eventra | Discover & Join Tech Events";
const SITE_DESCRIPTION =
  "Eventra is an open-source platform to discover, join, and host tech events, hackathons, and workshops in your community.";

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
const HomePage = () => {
  useDocumentTitle("Home | Eventra");

  return (
    <main className="min-h-screen bg-bg">
      {/* ─── SEO & SOCIAL META TAGS ─────────────────────────────────────── */}
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{SITE_TITLE}</title>
        <meta name="description" content={SITE_DESCRIPTION} />
        <meta name="keywords" content="tech events, hackathons, workshops, developer community, open source" />
        <meta name="author" content="Eventra Team" />
        <link rel="canonical" href={SITE_URL} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content={SITE_TITLE} />
        <meta property="og:description" content={SITE_DESCRIPTION} />
        <meta property="og:image" content={SITE_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Eventra" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={SITE_URL} />
        <meta name="twitter:title" content={SITE_TITLE} />
        <meta name="twitter:description" content={SITE_DESCRIPTION} />
        <meta name="twitter:image" content={SITE_IMAGE} />
        <meta name="twitter:creator" content="@eventra" />

        {/* Additional */}
        <meta name="theme-color" content="#4f46e5" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* ─── PAGE CONTENT ───────────────────────────────────────────────── */}
      <Hero />
      <WhatsHappening />
      <TrendingEvents title="Trending Events" limit={6} fetchSize={24} />
      <RecommendationBanner />
      <CollaborationNetworkMap />
      <CollaborationMap />
      <HomeCTA />
    </main>
  );
};

export default HomePage;