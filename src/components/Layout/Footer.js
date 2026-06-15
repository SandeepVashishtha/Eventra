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
      { nameKey: "footer.links.home", href: "/", icon: <FaHome size={12} /> },
      { nameKey: "footer.links.events", href: "/events", icon: <FaCalendarAlt size={12} /> },
      { nameKey: "footer.links.hackathons", href: "/hackathons", icon: <FaStar size={12} /> },
      { nameKey: "footer.links.projects", href: "/projects", icon: <FaFolder size={12} /> },
      { nameKey: "footer.links.about", href: "/about", icon: <FaInfoCircle size={12} /> },
    ],
  },
  {
    heading: "footer.sections.community",
    links: [
      { nameKey: "footer.links.createEvent", href: "/create-event", icon: <FaPlus size={12} /> },
      { nameKey: "footer.links.communityEvents", href: "/community-event", icon: <FaUsers size={12} /> },
      { nameKey: "footer.links.contributors", href: "/contributors", icon: <FaCode size={12} /> },
      { nameKey: "footer.links.contributorsGuide", href: "/contributorguide", icon: <FaBook size={12} /> },
      { nameKey: "footer.links.leaderboard", href: "/leaderBoard", icon: <FaTrophy size={12} /> },
    ],
  },
  {
    heading: "footer.sections.support",
    links: [
      { nameKey: "footer.links.documentation", href: "/documentation", icon: <FaBookOpen size={12} /> },
      { nameKey: "footer.links.helpCenter", href: "/helpcenter", icon: <FaQuestionCircle size={12} /> },
      { nameKey: "footer.links.faq", href: "/faq", icon: <FaQuestion size={12} /> },
      { nameKey: "footer.links.contactUs", href: "/contact", icon: <FaEnvelope size={12} /> },
      { nameKey: "footer.links.feedback", href: "/feedback", icon: <FaComments size={12} /> },
    ],
  },
];

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/sandeepvashishtha/Eventra",
    icon: <FaGithub size={16} />,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/sandeepvashishtha/",
    icon: <FaLinkedin size={16} />,
  },
  {
    name: "Discord",
    href: "https://discord.gg/6MQ9r5nHT",
    icon: <SiDiscord size={16} />,
  },
];

/* =========================
   External Link
========================= */

const ExternalLink = ({ href, children, className }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
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
      return;
    }

    if (!isValidEmail(trimmed)) {
      setFeedback({ type: "error", message: t("footer.newsletter.emailInvalid") });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      await new Promise((r) => setTimeout(r, 1000));

      if (isMounted.current) {
        setFeedback({ type: "success", message: t("footer.newsletter.success") });
        setEmail("");
      }
    } finally {
      if (isMounted.current) setIsSubmitting(false);
    }
  };

  return (
    <div>
      <p className="text-xs font-semibold uppercase text-indigo-500 mb-1">
        {t("footer.newsletter.heading")}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          disabled={isSubmitting}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("footer.newsletter.placeholder")}
          className="flex-1 px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm"
        >
          {isSubmitting
            ? t("footer.newsletter.subscribing")
            : t("footer.newsletter.subscribe")}
        </button>
      </form>

      {feedback.message && (
        <p className="text-xs mt-2 text-gray-400">{feedback.message}</p>
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
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Brand */}
        <div>
          <Link to="/" className="text-xl font-bold">
            Eventra
          </Link>

          <p className="text-sm text-gray-500 mt-2">
            {t("footer.tagline")}
          </p>

          <div className="flex gap-3 mt-4">
            {socialLinks.map((s) => (
              <ExternalLink key={s.name} href={s.href}>
                {s.icon}
              </ExternalLink>
            ))}
          </div>

          <div className="mt-5">
            <Newsletter />
          </div>
        </div>

        {/* Links */}
        {footerColumns.map((col) => (
          <div key={col.heading}>
            <h4 className="text-xs uppercase text-gray-400 mb-3">
              {t(col.heading)}
            </h4>

            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="flex items-center gap-2 text-sm">
                    {link.icon}
                    {t(link.nameKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-200 dark:border-gray-800 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Eventra. {t("footer.rights")}
      </div>
    </footer>
  );
};

export default Footer;
