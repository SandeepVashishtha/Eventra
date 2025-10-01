import Hero from "./components/Hero";
import WhatsHappening from "./components/WhatsHappening";
import GitHubStats from "./components/GitHubStats";
import Contributors from "./components/ContributorsCarousel";
import NewsletterSubscribe from "./components/NewsletterSubscribe";

const HomePage = () => {
  return (
    <>
      <Hero />
      <WhatsHappening />
      <GitHubStats />
      <Contributors />
      <NewsletterSubscribe />
    </>
  );
};

export default HomePage;
