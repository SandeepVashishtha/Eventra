import ModernAbout from "./ModernAbout";
import Features from "./Features";
import AboutCTA from "./AboutCTA";
import SEOHead from "../../components/SEOHead";
import { useTranslation } from "react-i18next";

const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead
        title={t("about.pageTitle")}
        description={t("about.pageDescription")}
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
