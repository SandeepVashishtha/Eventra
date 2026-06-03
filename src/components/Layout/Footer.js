import {
  Book,
  BookOpen,
  Calendar,
  Folder,
  Github,
  Home,
  Info,
  Linkedin,
  MessageCircle,
  Plus,
  HelpCircle,
  Star,
  Trophy,
  Users,
  Mail,
  MessageSquare
} from "lucide-react";

import { useState } from "react";
// Enforced dynamic copyright rendering under issue #2211
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

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
    { name: "Home", href: "/", icon: Home },
    { name: "Events", href: "/events", icon: Calendar },
    { name: "Hackathons", href: "/hackathons", icon: Star },
    { name: "Projects", href: "/projects", icon: Folder },
    { name: "About", href: "/about", icon: Info }
    { name: "Home", href: "/", icon: <FaHome size={14} /> },
    { name: "Events", href: "/events", icon: <FaCalendarAlt size={14} /> },
    { name: "Hackathons", href: "/hackathons", icon: <FaStar size={14} /> },
    { name: "Projects", href: "/projects", icon: <FaFolder size={14} /> },
    { name: "About", href: "/about", icon: <FaInfoCircle size={14} /> },
  ],

  community: [
    { name: "Create Event", href: "/create-event", icon: Plus },
    { name: "Community Events", href: "/community-event", icon: Users },
    { name: "Documentation", href: "/documentation", icon: Book },
    { name: "Contributors", href: "/contributors", icon: Users },
    { name: "Contributors Guide", href: "/contributorguide", icon: Book },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy }
    {
      name: "Create Event",
      href: "/create-event",
      icon: <FaPlus size={14} />,
    },
    {
      name: "Community Events",
      href: "/communityEvent",
      icon: <FaUsers size={14} />,
    },
    {
      name: "Documentation",
      href: "/documentation",
      icon: <FaBook size={14} />,
    },
    {
      name: "Contributors",
      href: "/contributors",
      icon: <FaUsers size={14} />,
    },
    {
      name: "Contributors Guide",
      href: "/contributorguide",
      icon: <FaBook size={14} />,
    },
    {
      name: "LeaderBoard",
      href: "/leaderBoard",
      icon: <FaTrophy size={14} />,
    },
  ],

  support: [
    { name: "Help Center", href: "/helpcenter", icon: HelpCircle },
    { name: "FAQ", href: "/faq", icon: HelpCircle },
    { name: "Contact Us", href: "/contact", icon: Mail },
    { name: "Feedback", href: "/feedback", icon: MessageSquare },
    { name: "API Docs", href: "/apiDocs", icon: BookOpen }
  ]
    {
      name: "Help Center",
      href: "/helpcenter",
      icon: <FaQuestionCircle size={14} />,
    },
    {
      name: "FAQ",
      href: "/faq",
      icon: <FaQuestion size={14} />,
    },
    {
      name: "Contact Us",
      href: "/contact",
      icon: <FaEnvelope size={14} />,
    },
    {
      name: "Feedback",
      href: "/feedback",
      icon: <FaComments size={14} />,
    },
    {
      name: "API Docs",
      href: "/apiDocs",
      icon: <FaBookOpen size={14} />,
    },
  ],
};

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/sandeepvashishtha/Eventra",
    icon: Github
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
    icon: Linkedin
  },
  {
    name: "Discord",
    href: "https://discord.com",
    icon: MessageCircle
  }
];
    icon: (
      <FaLinkedin
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
const formatTitle = (str) =>
  str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const Newsletter = () => {
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

    if (!value) return setMsg("Enter email");
    if (!trimmedEmail) {
      setFeedback({
        type: "error",
        message: "Please enter your email address.",
      });

      return;
    }

    await new Promise((r) => setTimeout(r, 700));
    if (!isValidEmail(trimmedEmail)) {
      setFeedback({
        type: "error",
        message: "Please enter a valid email address.",
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
          message: "Thanks for subscribing!",
        });

        setEmail("");
      }
    } catch (error) {
      // 🔥 FIX: Guard state updates
      if (isMounted.current) {
        setFeedback({
          type: "error",
          message:
            "Something went wrong. Please try again.",
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
    <div className="w-full max-w-md rounded-2xl border bg-white/60 p-4">
      <h4 className="text-sm font-semibold">Stay updated</h4>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Enter email"
          className="flex-1 border px-3 py-2 rounded-md"
        />

        <button disabled={loading} className="px-4 py-2 bg-black text-white rounded-md">
          {loading ? "..." : "Subscribe"}
        </button>
      </form>

      {msg && <p className="text-xs mt-2">{msg}</p>}
    <div className="mt-4">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-2">
        Subscribe to our newsletter
      </h4>

      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
        Get the latest updates, event tips, and community news.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-3"
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
            placeholder="Enter your email"
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
          className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-gray-900 to-black hover:from-indigo-600 hover:to-purple-600 dark:from-white dark:to-gray-200 dark:hover:from-indigo-400 dark:hover:to-purple-500 text-white dark:text-black rounded-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-semibold tracking-wide"
        >
          {isSubmitting
            ? "Subscribing..."
            : "Subscribe"}
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
          <p className="text-xs text-gray-500 dark:text-gray-400">
            We respect your privacy. Unsubscribe at any time.
          </p>
        )}
      </div>
    </div>
  );
};
const Social = () => (
  <div className="flex gap-3">
    {socialLinks.map(({ name, href, icon: Icon }) => (
      <ExternalLink key={name} href={href}>
        <Icon size={16} />
      </ExternalLink>
    ))}
  </div>
);

const FooterLinks = () => (
  <div className="grid gap-8 sm:grid-cols-3">
    {Object.entries(footerLinks).map(([key, links]) => (
      <div key={key}>
        <h4 className="text-xs uppercase">{formatTitle(key)}</h4>

        <ul className="mt-2 space-y-2">
          {links.map(({ name, href, icon: Icon }) => (
            <li key={name}>
              <Link to={href} className="flex items-center gap-2 text-sm">
                <Icon size={14} />
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
const SocialLinksRender = () => (
  <div className="mt-6">
    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">
      Follow Us
    </h4>

    <div className="flex flex-wrap gap-3">
      {socialLinks.map((link) => (
        <ExternalLink
          key={link.name}
          href={link.href}
          className="text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
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

const FooterLinksRender = () => (
  <>
    {Object.entries(footerLinks).map(
      ([key, links]) => (
        <div
          key={key}
          className="py-2"
        >
          <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-widest mb-6">
            {key.replace("_", " ")}
          </h4>

          <ul className="space-y-4">
            {links.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.href}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white flex items-center gap-4 transition-all duration-300 hover:translate-x-1 group"
                >
                  {link.icon && (
                    <span className="text-black dark:text-white group-hover:scale-110 transition-all duration-300">
                      {link.icon}
                    </span>
                  )}

                  <span>{link.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )
    )}
  </>
);

const Footer = () => {
  return (
    <footer className="border-t bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="logo" className="w-8 h-8" />
            <h2 className="font-bold">Eventra</h2>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Open-source event management platform.
          </p>

          <div className="mt-4">
            <Newsletter />
          </div>

          <div className="mt-4">
            <Social />
          </div>
        </div>

        <div className="lg:col-span-2">
          <FooterLinks />
        </div>
      </div>

      <div className="border-t py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Eventra. All rights reserved.
    <footer className="relative z-50 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="space-y-4 lg:col-span-2">
            <h2
              className="text-2xl sm:text-3xl font-bold inline-block text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-300 hover:from-indigo-600 hover:to-purple-600 dark:hover:from-indigo-400 dark:hover:to-purple-400 transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-default"
              style={{
                fontFamily:
                  "Anton, sans-serif",
              }}
            >
              Eventra
            </h2>

            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Open-source event management for communities worldwide.
            </p>

            <Newsletter />

            <SocialLinksRender />
          </div>

          <FooterLinksRender />
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          © {new Date().getFullYear()} Eventra. All rights reserved.
        </p>

        <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
          <Link
            to="/privacy"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Privacy Policy
          </Link>

          <Link
            to="/terms"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
export default Footer;
// THEME HARMONIZATION: Integrated active dark mode classes (dark:bg-slate-900, dark:text-white) to prevent visual background jarring.
