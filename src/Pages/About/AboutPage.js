import ModernAbout from "./ModernAbout";
import AboutCTA from "./AboutCTA ";

const AboutPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white/0 via-white/30 to-white dark:from-transparent dark:to-gray-900">
      <ModernAbout />
      {/* 💡 NOTE: This CTA Section is already dark by design and works well in both modes. No changes are needed. */}
      <AboutCTA></AboutCTA>
    </div>
  );
};

export default AboutPage;
