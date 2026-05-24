import Hero from "./components/Hero";
import WhatsHappening from "./components/WhatsHappening";
import HomeCTA from "./components/HomeCTA";
import RecommendedEvents from "../../components/user/RecommendedEvents";
import useDocumentTitle from "../../hooks/useDocumentTitle";

import RecentlyViewedEvents from '../../components/common/RecentlyViewedEvents';




const HomePage = () => {
  useDocumentTitle("Home | Eventra");
  return (
    <>
      <Hero />
      <WhatsHappening />
      <RecommendedEvents />
      <RecentlyViewedEvents />
      <HomeCTA />
    </>
  );
};

export default HomePage;