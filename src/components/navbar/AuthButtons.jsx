import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const prefetchLogin = () => import("components/auth/Login");
const prefetchSignup = () => import("components/auth/Signup");

const AuthButtons = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center gap-2">
      <Link
        to="/login"
        onMouseEnter={() => prefetchLogin()}
        className="px-4 py-2 rounded-lg text-sm font-medium text-text hover:text-primary hover:bg-bg-secondary transition-all duration-200"
      >
        {t("nav.signIn") || "Log in"}
      </Link>
      <Link
        to="/signup"
        onMouseEnter={() => prefetchSignup()}
        className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md text-white hover:bg-blue-600 hover:bg-blue-700 text-white shadow-md-hover transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
      >
        {t("nav.getStarted") || "Get Started"}
      </Link>
    </div>
  );
};

export default AuthButtons;
