import ModernAbout from "./ModernAbout";
import AboutCTA from "./AboutCTA ";

const AboutPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white dark:bg-slate-950 text-slate-900 dark:text-gray-100">
      <ModernAbout />
      {/* 💡 NOTE: This CTA Section is already dark by design and works well in both modes. No changes are needed. */}
      <AboutCTA></AboutCTA>
    </div>
  );
};

export default AboutPage;