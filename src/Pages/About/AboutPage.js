import ModernAbout from "./ModernAbout";
import Features from "./Features";
import AboutCTA from "./AboutCTA";
import SEOHead from "../../components/SEOHead";

const AboutPage = () => {
  return (
    <>
      <SEOHead
        title="About Us"
        description="Learn how Eventra helps people discover events, manage hackathons, build projects, grow networks, and participate in community-driven programs."
        url={window.location.href}
      />

      <main className="min-h-screen bg-slate-950 text-slate-100">
        <ModernAbout />
        <Features />
        <AboutCTA />
      </main>
    </>
  );
};

export default AboutPage;
