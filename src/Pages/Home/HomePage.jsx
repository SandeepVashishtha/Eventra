import { Helmet } from "react-helmet-async";
import Hero from "./components/Hero";
import WhatsHappening from "./components/WhatsHappening";
import HomeCTA from "./components/HomeCTA";
import RecommendationBanner from "./components/RecommendationBanner";
import CollaborationNetworkMap from "../../components/visual/CollaborationNetworkMap";
import CollaborationMap from "../../components/CollaborationMap";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import RecentlyViewedEvents from "../../components/common/RecentlyViewedEvents";

const HomePage = () => {
  useDocumentTitle("Home | Eventra");
  return (
    <>
      <Helmet>
        <title>Eventra | Discover & Join Tech Events</title>
        <meta name="description" content="Eventra is an open-source platform to discover, join, and host tech events, hackathons, and workshops in your community." />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://eventra.vercel.app/" />
        <meta property="og:title" content="Eventra | Discover & Join Tech Events" />
        <meta property="og:description" content="Eventra is an open-source platform to discover, join, and host tech events, hackathons, and workshops in your community." />
        <meta property="og:image" content="https://eventra.vercel.app/Eventra.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://eventra.vercel.app/" />
        <meta name="twitter:title" content="Eventra | Discover & Join Tech Events" />
        <meta name="twitter:description" content="Eventra is an open-source platform to discover, join, and host tech events, hackathons, and workshops in your community." />
        <meta name="twitter:image" content="https://eventra.vercel.app/Eventra.png" />
      </Helmet>

      <Hero />
      <WhatsHappening />
      <RecentlyViewedEvents />
      <RecommendationBanner />
      <CollaborationNetworkMap />
      <CollaborationMap />
      <HomeCTA />
    </>
  );
};

export default HomePage;