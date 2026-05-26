import Hero from "./components/Hero";
import WhatsHappening from "./components/WhatsHappening";
import HomeCTA from "./components/HomeCTA";
import RecommendationBanner from "./components/RecommendationBanner";

import useDocumentTitle from "../../hooks/useDocumentTitle";

import RecentlyViewedEvents from '../../components/common/RecentlyViewedEvents';




const HomePage = () => {
  useDocumentTitle("Home | Eventra");
  return (
    <>
      <Hero />
      <WhatsHappening />
      <RecommendationBanner />
      <HomeCTA></HomeCTA>

    </>
  );
};

export default HomePage;