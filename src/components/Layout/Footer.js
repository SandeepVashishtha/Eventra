// Enforced dynamic copyright rendering under issue #2211
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { SiDiscord } from "react-icons/si";

import {
  FaBook,
  FaBookOpen,
  FaCalendarAlt,
  FaComments,
  FaEnvelope,
  FaFolder,
  FaGithub,
  FaHome,
  FaInfoCircle,
  FaLinkedin,
  FaPlus,
  FaQuestion,
  FaQuestionCircle,
  FaStar,
  FaTrophy,
  FaUsers,
} from "react-icons/fa";

const footerLinks = {
  quick_links: [
    { nameKey: "footer.links.home", href: "/", icon: <FaHome size={14} /> },
    { nameKey: "footer.links.events", href: "/events", icon: <FaCalendarAlt size={14} /> },
    { nameKey: "footer.links.hackathons", href: "/hackathons", icon: <FaStar size={14} /> },
    { nameKey: "footer.links.projects", href: "/projects", icon: <FaFolder size={14} /> },
    { nameKey: "footer.links.about", href: "/about", icon: <FaInfoCircle size={14} /> },
  ],

  community: [
    { nameKey: "footer.links.createEvent", href: "/create-event", icon: <FaPlus size={14} /> },
    { nameKey: "footer.links.communityEvents", href: "/community-event", icon: <FaUsers size={14} /> },
    { nameKey: "footer.links.documentation", href: "/documentation", icon: <FaBook size={14} /> },
    { nameKey: "footer.links.contributors", href: "/contributors", icon: <FaUsers size={14} /> },
    { nameKey: "footer.links.contributorsGuide", href: "/contributorguide", icon: <FaBook size={14} /> },
    { nameKey: "footer.links.leaderboard", href: "/leaderBoard", icon: <FaTrophy size={14} /> },
  ],

  support: [
    { nameKey: "footer.links.helpCenter", href: "/helpcenter", icon: <FaQuestionCircle size={14} /> },
    { nameKey: "footer.links.faq", href: "/faq", icon: <FaQuestion size={14} /> },
    { nameKey: "footer.links.contactUs", href: "/contact", icon: <FaEnvelope size={14} /> },
    { nameKey: "footer.links.feedback", href: "/feedback", icon: <FaComments size={14} /> },
    { nameKey: "footer.links.apiDocs", href: "/api-docs", icon: <FaBookOpen size={14} /> },
  ],
};

const footerSectionKeys = {
  quick_links: "footer.sections.quickLinks",
  community: "footer.sections.community",
  support: "footer.sections.support",
};

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/sandeepvashishtha/Eventra",
    icon: (
      <FaGithub
        className="size-10 p-2 rounded-full text-black dark:text-white bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-110 hover:-translate-y-1"
        size={20}
      />
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/sandeepvashishtha/",
    icon: (
      <FaLinkedin
        className="size-10 p-2 rounded-full text-black dark:text-white bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-110 hover:-translate-y-1"
        size={20}
      />
    ),
  },
  {
    name: "Discord",
    href: "https://discord.gg/6MQ9r5nHT",
    icon: (
      <SiDiscord
        className="size-10 p-2 rounded-full text-black dark:text-white bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-110 hover:-translate-y-1"
        size={20}
      />
    ),
  },
].filter(Boolean);

/* ================================
   Secure External Link Handling
================================ */

const externalLinkProps = {
  target: "_blank",
  rel: "noopener noreferrer",
};

const ExternalLink = ({
  href,
  children,
  className,
  ...props
}) => (
  <a
    href={href}
    {...externalLinkProps}
    className={className}
    {...props}
  >
    {children}
  </a>
);

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const Newsletter = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [feedback, setFeedback] = useState({
    type: "",
    message: "",
  });

  // 🔥 FIX: Track mounted state to prevent memory leaks on unmount
  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setFeedback({
        type: "error",
        message: t("footer.newsletter.emailRequired"),
      });

      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setFeedback({
        type: "error",
        message: t("footer.newsletter.emailInvalid"),
      });

      return;
    }

    setIsSubmitting(true);

    setFeedback({
      type: "",
      message: "",
    });

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

      // 🔥 FIX: Guard state updates
      if (isMounted.current) {
        setFeedback({
          type: "success",
          message: t("footer.newsletter.success"),
        });

        setEmail("");
      }
    } catch {
      // 🔥 FIX: Guard state updates
      if (isMounted.current) {
        setFeedback({
          type: "error",
          message: t("footer.newsletter.error"),
        });
      }
    } finally {
      // 🔥 FIX: Guard state updates
      if (isMounted.current) {
        setIsSubmitting(false);
      }
    }
  };

  const feedbackId =
    "footer-newsletter-feedback";

  const feedbackColor =
    feedback.type === "success"
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";

  return (
    <div className="mt-4">
      <h4 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
        {t("footer.newsletter.heading")}
      </h4>

      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
        {t("footer.newsletter.description")}
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col  gap-3 max-w-lg"
      >
        <div className="relative flex-grow">
          <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);

              if (feedback.message) {
                setFeedback({
                  type: "",
                  message: "",
                });
              }
            }}
            placeholder={t("footer.newsletter.placeholder")}
            className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full"
            disabled={isSubmitting}
            aria-describedby={
              feedback.message
                ? feedbackId
                : undefined
            }
            aria-invalid={
              feedback.type === "error"
            }
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium">
          {isSubmitting
            ? t("footer.newsletter.subscribing")
            : t("footer.newsletter.subscribe")}
        </button>
      </form>

      <div
        className="mt-1 min-h-[1rem]"
        aria-live="polite"
      >
        {feedback.message ? (
          <p
            id={feedbackId}
            className={`text-xs font-medium ${feedbackColor}`}
          >
            {feedback.message}
          </p>
        ) : (
          <p className="text-xs text-gray-600 dark:text-gray-300">
            {t("footer.newsletter.privacy")}
          </p>
        )}
      </div>
    </div>
  );
};

const SocialLinksRender = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h4 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
        {t("footer.followUs")}
      </h4>

      <div className="flex flex-wrap gap-4 items-center">
        {socialLinks.map((link) => (
          <ExternalLink
            key={link.name}
            href={link.href}
            className="text-gray-500 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 rounded-full"
            aria-label={link.name}
            title={link.name}
          >
            <span className="sr-only">
              {link.name}
            </span>

            {link.icon}
          </ExternalLink>
        ))}
      </div>
    </div>
  );
};

const FooterLinksRender = () => {
  const { t } = useTranslation();
  return (
    <>
      {Object.entries(footerLinks).map(
        ([key, links]) => (
          <div
            key={key}
            className="py-2 flex flex-col gap-2"
          >
            <h4 className="text-sm font-bold mb-4 tracking-wide text-gray-900 dark:text-white uppercase">
              {t(footerSectionKeys[key])}
            </h4>

            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.nameKey}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white flex items-center gap-4 transition-all duration-300 hover:translate-x-1 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 rounded"
                  >
                    {link.icon && (
                      <span className="text-gray-700 dark:text-gray-200 group-hover:scale-110 transition-all duration-300">
                        {link.icon}
                      </span>
                    )}

                    <span>{t(link.nameKey)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )
      )}
    </>
  );
};

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="relative z-50 bg-white dark:bg-gray-900 border-t border-gray-100  dark:border-gray-800 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-12 items-start">
          <div className="space-y-4 max-w-md">
            <h2
              className="text-2xl sm:text-3xl font-bold inline-block text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-300"
              style={{ fontFamily: "Anton, sans-serif" }}
            >
              Eventra
            </h2>

            <p className="text-gray-600 dark:text-gray-300 text-base leading-7">
              {t("footer.tagline")}
            </p>
          </div>


          <FooterLinksRender />
        </div>
        <div className="mt-16 pt-10 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12">

            <div className="flex-1 max-w-lg">
              <Newsletter />
            </div>

            <div className="lg:min-w-[220px] lg:pt-4">
              <SocialLinksRender />
            </div>

          </div>
        </div>
      </div>




      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center md:items-center gap-6 md:gap-0">
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          © {new Date().getFullYear()} Eventra. {t("footer.rights")}
        </p>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-6 text-sm text-gray-600 dark:text-gray-300">
          <Link
            to="/privacy"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 rounded"
          >
            {t("footer.privacy")}
          </Link>

          <Link
            to="/terms"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 rounded"
          >
            {t("footer.terms")}
          </Link>
        </div>
      </div>
    </footer >
  );
};

export default Footer;
// THEME HARMONIZATION: Integrated active dark mode classes (dark:bg-slate-900, dark:text-white) to prevent visual background jarring.