import SEOHead from "../../components/SEOHead";
import Hero from "./components/Hero";
import WhatsHappening from "./components/WhatsHappening";
import HomeCTA from "./components/HomeCTA";
import RecommendationBanner from "./components/RecommendationBanner";
import CollaborationNetworkMap from "../../components/visual/CollaborationNetworkMap";
import CollaborationMap from "../../components/CollaborationMap";
import RecentlyViewedEvents from "../../components/common/RecentlyViewedEvents";

const HomePage = () => {
  return (
    <>
      <SEOHead
        title="Discover & Join Tech Events | Eventra"
        description="Eventra is an open-source platform to discover, join, and host tech events, hackathons, and workshops in your community."
        image="/og-default.png"
        url="https://eventra.vercel.app/"
      />

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