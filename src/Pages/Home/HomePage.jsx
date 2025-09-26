import Hero from "./components/Hero";
import WhatsHappening from "./components/WhatsHappening";
import Testimonials from "./components/Testimonials";
import GitHubStats from "./components/GitHubStats";
import Contributors from "./components/ContributorsCarousel";
import Community from "./components/Community";
import NewsletterSubscribe from "./components/NewsletterSubscribe";

const HomePage = () => {
  return (
    <>
      <Hero />
      <WhatsHappening />
      <Testimonials />
      <GitHubStats />
      <Contributors />
      <Community />
      <NewsletterSubscribe />
    </>
  );
};

export default HomePage;
