import React, { useState, useEffect, useRef } from "react";
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
  FaCode,
} from "react-icons/fa";

/* =========================
   CONFIG
========================= */

const footerColumns = [
  {
    heading: "footer.sections.quickLinks",
    links: [
      { nameKey: "footer.links.home", href: "/", icon: <FaHome size={14} /> },
      { nameKey: "footer.links.events", href: "/events", icon: <FaCalendarAlt size={14} /> },
      { nameKey: "footer.links.hackathons", href: "/hackathons", icon: <FaStar size={14} /> },
      { nameKey: "footer.links.projects", href: "/projects", icon: <FaFolder size={14} /> },
      { nameKey: "footer.links.about", href: "/about", icon: <FaInfoCircle size={14} /> },
    ],
  },
  {
    heading: "footer.sections.community",
    links: [
      { nameKey: "footer.links.createEvent", href: "/create-event", icon: <FaPlus size={14} /> },
      {
        nameKey: "footer.links.communityEvents",
        href: "/community-event",
        icon: <FaUsers size={14} />,
      },
      { nameKey: "footer.links.contributors", href: "/contributors", icon: <FaCode size={14} /> },
      {
        nameKey: "footer.links.contributorsGuide",
        href: "/contributorguide",
        icon: <FaBook size={14} />,
      },
      { nameKey: "footer.links.leaderboard", href: "/leaderBoard", icon: <FaTrophy size={14} /> },
    ],
  },
  {
    heading: "footer.sections.support",
    links: [
      {
        nameKey: "footer.links.documentation",
        href: "/documentation",
        icon: <FaBookOpen size={14} />,
      },
      {
        nameKey: "footer.links.helpCenter",
        href: "/helpcenter",
        icon: <FaQuestionCircle size={14} />,
      },
      { nameKey: "footer.links.faq", href: "/faq", icon: <FaQuestion size={14} /> },
      { nameKey: "footer.links.contactUs", href: "/contact", icon: <FaEnvelope size={14} /> },
      { nameKey: "footer.links.feedback", href: "/feedback", icon: <FaComments size={14} /> },
    ],
  },
];

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/sandeepvashishtha/Eventra",
    icon: <FaGithub size={20} />,
    ariaLabel: "Visit our GitHub repository",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/sandeepvashishtha/",
    icon: <FaLinkedin size={20} />,
    ariaLabel: "Connect with us on LinkedIn",
  },
  {
    name: "Discord",
    href: "https://discord.gg/6MQ9r5nHT",
    icon: <SiDiscord size={20} />,
    ariaLabel: "Join our Discord community",
  },
];

/* =========================
   External Link
========================= */

const ExternalLink = ({ href, children, className, ariaLabel }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={className}
    aria-label={ariaLabel}
  >
    {children}
  </a>
);

/* =========================
   Newsletter
========================= */

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const Newsletter = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const emailInputRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = email.trim();

    if (!trimmed) {
      setFeedback({ type: "error", message: t("footer.newsletter.emailRequired") });
      emailInputRef.current?.focus();
      return;
    }

    if (!isValidEmail(trimmed)) {
      setFeedback({ type: "error", message: t("footer.newsletter.emailInvalid") });
      emailInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      // Simulate API call
      await new Promise((r) => setTimeout(r, 1200));

      if (isMounted.current) {
        setFeedback({ type: "success", message: t("footer.newsletter.success") });
        setEmail("");
      }
    } catch (err) {
      if (isMounted.current) {
        setFeedback({
          type: "error",
          message: t("footer.newsletter.error") || "Something went wrong. Please try again.",
        });
      }
    } finally {
      if (isMounted.current) setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="newsletter-email"
          className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1.5"
        >
          {t("footer.newsletter.heading")}
        </label>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={emailInputRef}
            id="newsletter-email"
            type="email"
            value={email}
            disabled={isSubmitting}
            onChange={(e) => {
              setEmail(e.target.value);
              if (feedback.message) setFeedback({ type: "", message: "" });
            }}
            placeholder={t("footer.newsletter.placeholder")}
            className="flex-1 min-w-0 px-4 py-3 text-sm rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            aria-describedby={feedback.message ? "newsletter-feedback" : undefined}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400 text-white text-sm font-medium whitespace-nowrap transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
            aria-label={t("footer.newsletter.subscribe")}
          >
            {isSubmitting ? t("footer.newsletter.subscribing") : t("footer.newsletter.subscribe")}
          </button>
        </form>
      </div>

      {feedback.message && (
        <p
          id="newsletter-feedback"
          className={`text-xs font-medium px-1 transition-all ${
            feedback.type === "success"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }`}
          role="status"
          aria-live="polite"
        >
          {feedback.message}
        </p>
      )}
    </div>
  );
};

/* =========================
   Footer
========================= */

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-10">
          {/* Brand + Newsletter + Social */}
          <div className="lg:col-span-5 flex flex-col">
            <Link
              to="/"
              className="text-2xl font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-block"
            >
              Eventra
            </Link>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 max-w-md">
              {t("footer.tagline")}
            </p>

            {/* Social Links */}
            <div
              className="flex items-center gap-4 mt-6"
              role="group"
              aria-label="Social media links"
            >
              {socialLinks.map((s) => (
                <ExternalLink
                  key={s.name}
                  href={s.href}
                  ariaLabel={s.ariaLabel}
                  className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-2 -m-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {s.icon}
                </ExternalLink>
              ))}
            </div>

            {/* Newsletter */}
            <div className="mt-8 lg:mt-auto">
              <Newsletter />
            </div>
          </div>

          {/* Footer Columns */}
          {footerColumns.map((col, idx) => (
            <div key={col.heading} className="lg:col-span-2">
              <h4 className="text-xs uppercase font-semibold tracking-widest text-gray-400 mb-4">
                {t(col.heading)}
              </h4>

              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="group flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg px-2 py-1 -mx-2"
                    >
                      <span className="text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                        {link.icon}
                      </span>
                      {t(link.nameKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div>
            © {new Date().getFullYear()} Eventra. {t("footer.rights")}
          </div>
          <div className="flex items-center gap-6 text-xs">
            <Link
              to="/privacy"
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Terms
            </Link>
            <Link
              to="/accessibility"
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
