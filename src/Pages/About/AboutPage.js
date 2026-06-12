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
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white text-slate-900 dark:bg-slate-950 dark:text-gray-100">
        <ModernAbout />
        {/* 💡 NOTE: This CTA Section is already dark by design and works well in both modes. No changes are needed. */}
        <AboutCTA></AboutCTA>
      </div>
    </>
  );
};

export default AboutPage;
