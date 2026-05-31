import { useState } from "react";
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
    { name: "Home", href: "/", icon: FaHome },
    { name: "Events", href: "/events", icon: FaCalendarAlt },
    { name: "Hackathons", href: "/hackathons", icon: FaStar },
    { name: "Projects", href: "/projects", icon: FaFolder },
    { name: "About", href: "/about", icon: FaInfoCircle },
  ],
  community: [
    { name: "Create Event", href: "/create-event", icon: FaPlus },
    { name: "Community Events", href: "/communityEvent", icon: FaUsers },
    { name: "Documentation", href: "/documentation", icon: FaBook },
    { name: "Contributors", href: "/contributors", icon: FaUsers },
    { name: "Contributors Guide", href: "/contributorguide", icon: FaBook },
    { name: "LeaderBoard", href: "/leaderBoard", icon: FaTrophy },
  ],
  support: [
    { name: "Help Center", href: "/helpcenter", icon: FaQuestionCircle },
    { name: "FAQ", href: "/faq", icon: FaQuestion },
    { name: "Contact Us", href: "/contact", icon: FaEnvelope },
    { name: "Feedback", href: "/feedback", icon: FaComments },
    { name: "API Docs", href: "/apiDocs", icon: FaBookOpen },
  ],
};

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/sandeepvashishtha/Eventra",
    icon: FaGithub,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/sandeepvashishtha/",
    icon: FaLinkedin,
  },
];

const ExternalLink = ({ href, children, ...props }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
    {children}
  </a>
);

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const formatTitle = (str) =>
  str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const value = email.trim();

    if (!value) return setMsg("Enter email");
    if (!isValidEmail(value)) return setMsg("Invalid email");

    setLoading(true);
    setMsg("");

    await new Promise((resolve) => setTimeout(resolve, 700));

    setMsg("Subscribed!");
    setEmail("");
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:p-4">
      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Stay updated
      </h4>
      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
        Get product updates and community event highlights in your inbox.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 xs:flex-row">
        <div className="group relative min-w-0 flex-1">
          <FaEnvelope
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-hover:text-indigo-500"
            size={14}
            aria-hidden="true"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Enter email"
            className="footer-newsletter-input w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-indigo-400 hover:bg-indigo-50/40 hover:shadow-[0_8px_24px_rgba(99,102,241,0.14)] focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-indigo-400 dark:hover:bg-slate-900 dark:focus:bg-slate-950"
          />
        </div>

        <button
          disabled={loading}
          className="footer-newsletter-btn shrink-0 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/20 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-indigo-400"
        >
          {loading ? "..." : "Subscribe"}
        </button>
      </form>

      {msg && (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{msg}</p>
      )}
    </div>
  );
};

const Social = () => (
  <div className="flex flex-wrap items-center gap-3">
    {socialLinks.map(({ name, href, icon: Icon }) => (
      <ExternalLink
        key={name}
        href={href}
        className="footer-social-btn border border-slate-200 bg-white text-slate-600 hover:scale-105 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        aria-label={name}
      >
        <Icon size={18} />
      </ExternalLink>
    ))}
  </div>
);

const FooterLinks = () => (
  <div className="grid gap-5 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-10">
    {Object.entries(footerLinks).map(([key, links]) => (
      <div key={key} className="min-w-0">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {formatTitle(key)}
        </h4>

        <ul className="mt-2 grid gap-2">
          {links.map(({ name, href, icon: Icon }) => (
            <li key={name}>
              <Link
                to={href}
                className="footer-nav-link group flex min-h-8 items-center gap-3 rounded-lg text-sm text-slate-600 transition-all duration-500 ease-out hover:translate-x-0.5 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:text-indigo-300 sm:min-h-9 sm:hover:translate-x-1"
              >
                <Icon
                  size={15}
                  className="shrink-0 text-slate-400 transition-all duration-500 ease-out group-hover:scale-110 group-hover:text-indigo-500"
                />
                <span className="min-w-0 break-words">{name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

const Footer = () => {
  return (
    <footer className="site-footer border-t border-slate-200 bg-gradient-to-b from-white to-slate-50 dark:border-slate-800 dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12 lg:px-8">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="Eventra logo" className="h-10 w-10 shrink-0" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Eventra
            </h2>
          </div>

          <p className="max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
            Open-source event management platform for communities worldwide.
          </p>

          <Newsletter />
          <Social />
        </div>

        <div className="min-w-0">
          <FooterLinks />
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800">
  <div
    className="
      mx-auto
      flex
      w-full
      max-w-7xl
      flex-col
      items-center
      justify-between
      gap-3
      px-4
      py-3
      text-sm
      text-slate-500
      sm:flex-row
      sm:px-6
      lg:px-8
    "
  >
    <p>&copy; {new Date().getFullYear()} Eventra. All rights reserved.</p>

    <div className="flex flex-wrap gap-x-4 gap-y-2">
      <Link
        to="/privacy"
        className="transition hover:text-slate-900 dark:hover:text-slate-100"
      >
        Privacy
      </Link>

      <Link
        to="/terms"
        className="transition hover:text-slate-900 dark:hover:text-slate-100"
      >
        Terms
      </Link>
    </div>
  </div>
</div>
    </footer>
  );
};

export default Footer;
