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
  FaCode,
} from "react-icons/fa";

const footerColumns = [
  {
    heading: "footer.sections.quickLinks",
    links: [
      { nameKey: "footer.links.home",       href: "/",           icon: <FaHome size={12} /> },
      { nameKey: "footer.links.events",     href: "/events",     icon: <FaCalendarAlt size={12} /> },
      { nameKey: "footer.links.hackathons", href: "/hackathons", icon: <FaStar size={12} /> },
      { nameKey: "footer.links.projects",   href: "/projects",   icon: <FaFolder size={12} /> },
      { nameKey: "footer.links.about",      href: "/about",      icon: <FaInfoCircle size={12} /> },
    ],
  },
  {
    heading: "footer.sections.community",
    links: [
      { nameKey: "footer.links.createEvent",       href: "/create-event",    icon: <FaPlus size={12} /> },
      { nameKey: "footer.links.communityEvents",   href: "/community-event", icon: <FaUsers size={12} /> },
      { nameKey: "footer.links.contributors",      href: "/contributors",    icon: <FaCode size={12} /> },
      { nameKey: "footer.links.contributorsGuide", href: "/contributorguide",icon: <FaBook size={12} /> },
      { nameKey: "footer.links.leaderboard",       href: "/leaderBoard",     icon: <FaTrophy size={12} /> },
    ],
  },
  {
    heading: "footer.sections.support",
    links: [
      { nameKey: "footer.links.documentation", href: "/documentation", icon: <FaBookOpen size={12} /> },
      { nameKey: "footer.links.helpCenter",    href: "/helpcenter",    icon: <FaQuestionCircle size={12} /> },
      { nameKey: "footer.links.faq",           href: "/faq",           icon: <FaQuestion size={12} /> },
      { nameKey: "footer.links.contactUs",     href: "/contact",       icon: <FaEnvelope size={12} /> },
      { nameKey: "footer.links.feedback",      href: "/feedback",      icon: <FaComments size={12} /> },
    ],
  },
];

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/sandeepvashishtha/Eventra",
    icon: <FaGithub size={16} />,
    label: "Star on GitHub",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/sandeepvashishtha/",
    icon: <FaLinkedin size={16} />,
    label: "LinkedIn",
  },
  {
    name: "Discord",
    href: "https://discord.gg/6MQ9r5nHT",
    icon: <SiDiscord size={16} />,
    label: "Join Discord",
  },
];

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
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-1">
        {t("footer.newsletter.heading")}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
        {t("footer.newsletter.description")}
      </p>
 
      <form onSubmit={handleSubmit} noValidate className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 min-w-0">
          <FaEnvelope
            size={12}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (feedback.message) setFeedback({ type: "", message: "" });
            }}
            placeholder={t("footer.newsletter.placeholder")}
            disabled={isSubmitting}
            aria-describedby={feedback.message ? feedbackId : undefined}
            aria-invalid={feedback.type === "error"}
            className=" w-full sm:w-auto pl-8 pr-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
 
        <button
  type="submit"
  disabled={isSubmitting}
  className="shrink-0 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-md hover:shadow-indigo-500/30"
>
          {isSubmitting ? t("footer.newsletter.subscribing") : t("footer.newsletter.subscribe")}
        </button>
      </form>
 
      <div className="mt-2 min-h-[1rem]" aria-live="polite">
        {feedback.message ? (
          <p
            id={feedbackId}
            className={`text-xs font-medium ${feedbackColor}`}
          >
            {feedback.message}
          </p>
        ) : (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {t("footer.newsletter.privacy")}
          </p>
        )}
      </div>
    </div>
  );
};

// const SocialLinksRender = () => {
//   const { t } = useTranslation();
//   return (
//     <div>
//       <h4 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
//         {t("footer.followUs")}
//       </h4>

//       <div className="flex flex-wrap gap-4 items-center">
//         {socialLinks.map((link) => (
//           <ExternalLink
//             key={link.name}
//             href={link.href}
//             className="text-gray-500 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 rounded-full"
//             aria-label={link.name}
//             title={link.name}
//           >
//             <span className="sr-only">
//               {link.name}
//             </span>

//             {link.icon}
//           </ExternalLink>
//         ))}
//       </div>
//     </div>
//   );
// };

// const FooterLinksRender = () => {
//   const { t } = useTranslation();
//   return (
//     <>
//       {Object.entries(footerLinks).map(
//         ([key, links]) => (
//           <div
//             key={key}
//             className="py-2 flex flex-col gap-2"
//           >
//             <h4 className="text-sm font-bold mb-4 tracking-wide text-gray-900 dark:text-white uppercase">
//               {t(footerSectionKeys[key])}
//             </h4>

//             <ul className="space-y-3">
//               {links.map((link) => (
//                 <li key={link.nameKey}>
//                   <Link
//                     to={link.href}
//                     className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white flex items-center gap-4 transition-all duration-300 hover:translate-x-1 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 rounded"
//                   >
//                     {link.icon && (
//                       <span className="text-gray-700 dark:text-gray-200 group-hover:scale-110 transition-all duration-300">
//                         {link.icon}
//                       </span>
//                     )}

//                     <span>{t(link.nameKey)}</span>
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )
//       )}
//     </>
//   );
// };

const Footer = () => {
  const { t } = useTranslation();
return (
    <footer className="relative z-50 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 
        {/* ── Main grid ── */}
        <div className="py-10 grid grid-cols-3 lg:grid-cols-[1.8fr_1fr_1fr_1fr] gap-3 sm:gap-6 lg:gap-12">
          {/* Brand + newsletter */}
          <div className="space-y-5 col-span-3 lg:col-span-1">
            {/* Logo + tagline */}
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
              >
                <span
                  className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white group-hover:!text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                  style={{ fontFamily: "Anton, sans-serif", letterSpacing: "-0.01em" }}
                >
                  Eventra
                </span>
              </Link>
 
              {/* Open-source badge */}
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 align-middle">
                <FaCode size={9} aria-hidden="true" />
                Open Source
              </span>
 
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
                {t("footer.tagline")}
              </p>
            </div>
 
            {/* Social links */}
            <div className="flex flex-wrap items-center gap-2">
              {socialLinks.map((s) => (
                <ExternalLink
                  key={s.name}
                  href={s.href}
                  aria-label={s.label}
                  title={s.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  {s.icon}
                  <span>{s.name}</span>
                </ExternalLink>
              ))}
            </div>
 
            {/* Newsletter */}
            <Newsletter />
          </div>
 
          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.heading}  className="min-w-0">
              <h4 className="text-[12px] leading-tight truncate sm:text-xs font-semibold uppercase tracking-wide sm:tracking-widest text-gray-400 dark:text-gray-500 mb-2 sm:mb-4">
                {t(col.heading)}
              </h4>
              <ul className="space-y-0.05 sm:space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.nameKey || link.href}>
                    <Link
                      to={link.href}
                      className="group relative inline-flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:!text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded after:absolute after:left-6 after:-bottom-0.5 after:h-px after:w-0 after:bg-indigo-500 after:transition-all after:duration-300 group-hover:after:w-[calc(100%-1.5rem)]"
                    >
                      <span className="text-gray-400 dark:text-gray-500 group-hover:!text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-200 shrink-0">
                        {link.icon}
                      </span>
                      <span>{t(link.nameKey)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
 
        {/* ── Bottom bar ── */}
        <div className="py-5 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} Eventra.{" "}
            <span>{t("footer.rights")}</span>
          </p>
 
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-3 gap-y-2 text-xs text-gray-400 dark:text-gray-500">
            <Link
  to="/privacy"
  className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
>
  {t("footer.privacy")}
</Link>
<span className="text-gray-200 dark:text-gray-700" aria-hidden="true">|</span>
<Link
  to="/terms"
  className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
>
  {t("footer.terms")}
</Link>
<span className="text-gray-200 dark:text-gray-700" aria-hidden="true">|</span>
<Link
  to="/api-docs"
  className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
>
  {t("footer.links.apiDocs")}
</Link>
          </div>
        </div>
      </div>
    </footer>
  );

};

export default Footer;
// THEME HARMONIZATION: Integrated active dark mode classes (dark:bg-slate-900, dark:text-white) to prevent visual background jarring.
