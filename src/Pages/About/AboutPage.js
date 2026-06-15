import ModernAbout from "./ModernAbout";
import AboutCTA from "./AboutCTA";
import SEOHead from "../../components/SEOHead";

const AboutPage = () => {
  return (
    <>
      <SEOHead
        title="About Us"
        description="Learn about Eventra — the open-source event management platform for communities, colleges, and organizations worldwide."
        url={window.location.href}
      />

      <main className="min-h-screen bg-slate-950 text-slate-100">
        <ModernAbout />
        <AboutCTA />
      </main>
    </>
  );
};

export default AboutPage;
