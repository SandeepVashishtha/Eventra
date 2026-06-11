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
        className="size-10 rounded-full bg-white p-2 text-black shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:bg-gray-100 hover:shadow-lg dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
        size={20}
      />
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/sandeepvashishtha/",
    icon: (
      <FaLinkedin
        className="size-10 rounded-full bg-white p-2 text-black shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:bg-gray-100 hover:shadow-lg dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
        size={20}
      />
    ),
  },
  {
  name: "Discord",
  href: "https://discord.gg/6MQ9r5nHT",
  icon: (
    <SiDiscord
      className="size-10 rounded-full bg-white p-2 text-black shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:bg-gray-100 hover:shadow-lg dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
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
      <h4 className="mb-2 text-sm font-semibold tracking-wider text-gray-900 uppercase dark:text-white">
        {t("footer.newsletter.heading")}
      </h4>

      <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
        {t("footer.newsletter.description")}
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-grow">
          <FaEnvelope className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />

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
            className="w-full rounded-md border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
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
          className="...bg-gradient-to-r dark:to-gray-200...text-white dark:text-black... from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-white"
        >
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
  <div className="mt-6">
    <h4 className="mb-3 text-sm font-semibold tracking-wider text-gray-900 uppercase dark:text-white">
      {t("footer.followUs")}
    </h4>

    <div className="flex flex-wrap gap-3">
      {socialLinks.map((link) => (
        <ExternalLink
          key={link.name}
          href={link.href}
          className="rounded-full text-gray-500 transition-colors hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 focus-visible:outline-none dark:text-gray-300 dark:hover:text-indigo-400"
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
          className="py-2"
        >
          <h4 className="mb-6 text-xs font-bold tracking-widest text-gray-900 uppercase dark:text-white">
            {t(footerSectionKeys[key])}
          </h4>

          <ul className="space-y-4">
            {links.map((link) => (
              <li key={link.nameKey}>
                <Link
                  to={link.href}
                  className="group flex items-center gap-4 rounded text-sm text-gray-600 transition-all duration-300 hover:translate-x-1 hover:text-black focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 focus-visible:outline-none dark:text-gray-300 dark:hover:text-white"
                >
                  {link.icon && (
                    <span className="text-gray-700 transition-all duration-300 group-hover:scale-110 dark:text-gray-200">
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
    <footer className="relative z-50 border-t border-gray-100 bg-white transition-colors duration-500 dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <h2
              className="inline-block cursor-default bg-gradient-to-r from-gray-900 to-black bg-clip-text text-2xl font-bold text-transparent transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:from-indigo-600 hover:to-purple-600 sm:text-3xl dark:from-white dark:to-gray-300 dark:hover:from-indigo-400 dark:hover:to-purple-400"
              style={{
                fontFamily:
                  "Anton, sans-serif",
              }}
            >
              Eventra
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t("footer.tagline")}
            </p>

            <Newsletter />

            <SocialLinksRender />
          </div>

          <FooterLinksRender />
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-gray-100 px-4 py-6 sm:px-6 md:flex-row lg:px-8 dark:border-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          © {new Date().getFullYear()} Eventra. {t("footer.rights")}
        </p>

        <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-300">
          <Link
            to="/privacy"
            className="rounded transition-colors hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 focus-visible:outline-none dark:hover:text-indigo-400"
          >
            {t("footer.privacy")}
          </Link>

          <Link
            to="/terms"
            className="rounded transition-colors hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 focus-visible:outline-none dark:hover:text-indigo-400"
          >
            {t("footer.terms")}
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
// THEME HARMONIZATION: Integrated active dark mode classes (dark:bg-slate-900, dark:text-white) to prevent visual background jarring.