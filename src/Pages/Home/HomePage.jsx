import Hero from "./components/Hero";
import WhatsHappening from "./components/WhatsHappening";
import HomeCTA from "./components/HomeCTA";
import RecommendationBanner from "./components/RecommendationBanner";
import CollaborationNetworkMap from "../../components/visual/CollaborationNetworkMap";

import useDocumentTitle from "../../hooks/useDocumentTitle";

import RecentlyViewedEvents from '../../components/common/RecentlyViewedEvents';




const HomePage = () => {
  useDocumentTitle("Home | Eventra");
  return (
    <>
      <Hero />
      <WhatsHappening />
      <RecommendationBanner />
      <CollaborationNetworkMap />
      <HomeCTA></HomeCTA>

    </>
  );
};

export default HomePage;