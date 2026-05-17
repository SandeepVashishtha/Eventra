import ModernAbout from "./ModernAbout";
import AboutCTA from "./AboutCTA ";

const AboutPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-l from-sky-50 via-white to-white dark:from-gray-900 dark:to-black">
      <ModernAbout />
      {/* 💡 NOTE: This CTA Section is already dark by design and works well in both modes. No changes are needed. */}
      <AboutCTA></AboutCTA>
    </div>
  );
};

export default AboutPage;