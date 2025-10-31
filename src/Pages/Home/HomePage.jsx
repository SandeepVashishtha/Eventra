// src/Pages/Home/HomePage.jsx
import Hero from "./components/Hero";
import WhatsHappening from "./components/WhatsHappening";
import GitHubStats from "./components/GitHubStats";
import Contributors from "./components/ContributorsCarousel";
import Testimonials from "./components/Testimonials";
import HomeCTA from "./components/HomeCTA";

const HomePage = () => {
  return (
    <>
      <Hero />
      <WhatsHappening />
      <GitHubStats />
      <Testimonials />
      <Contributors />
      <HomeCTA></HomeCTA>
    </>
  );
};

export default HomePage;
