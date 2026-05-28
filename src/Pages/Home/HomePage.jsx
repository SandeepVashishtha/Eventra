import Hero from "./components/Hero";
import WhatsHappening from "./components/WhatsHappening";
import HomeCTA from "./components/HomeCTA";
import RecommendationBanner from "./components/RecommendationBanner";
import CollaborationNetworkMap from "../../components/visual/CollaborationNetworkMap";
import CollaborationMap from "../../components/CollaborationMap";

import useDocumentTitle from "../../hooks/useDocumentTitle";

import RecentlyViewedEvents from '../../components/common/RecentlyViewedEvents';




const HomePage = () => {
  useDocumentTitle("Home | Eventra");
  return (
    <>
      <Hero />
      <WhatsHappening />
      <RecentlyViewedEvents />
      <RecommendationBanner />
      <CollaborationNetworkMap />
      <CollaborationMap />
      <HomeCTA></HomeCTA>

    </>
  );
};

export default HomePage;