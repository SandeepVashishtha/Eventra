// src/Pages/Home/HomePage.jsx
import Hero from "./components/Hero";
import WhatsHappening from "./components/WhatsHappening";
import GitHubStats from "./components/GitHubStats";
import Contributors from "./components/ContributorsCarousel";


const HomePage = () => {
  return (
    <>
      <Hero />
      <WhatsHappening />
      <GitHubStats />
      <Contributors />
    </>
  );
};

export default HomePage;
