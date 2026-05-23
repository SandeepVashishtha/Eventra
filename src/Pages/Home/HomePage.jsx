import Hero from "./components/Hero";
import WhatsHappening from "./components/WhatsHappening";
import HomeCTA from "./components/HomeCTA";
import RecommendedEvents from "../../components/user/RecommendedEvents";
import useDocumentTitle from "../../hooks/useDocumentTitle";
const HomePage = () => {
  useDocumentTitle("Home | Eventra");
  return (
    <>
      <Hero />
      <WhatsHappening />
      <RecommendedEvents />
      <HomeCTA />
    </>
  );
};

export default HomePage;