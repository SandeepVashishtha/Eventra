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

/* =========================
   DATA
========================= */

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

/* =========================
   HELPERS
========================= */

const ExternalLink = ({ href, children, ...props }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
    {children}
  </a>
);

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const formatTitle = (str) =>
  str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/* =========================
   NEWSLETTER
========================= */

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

    await new Promise((r) => setTimeout(r, 700));

    setMsg("Subscribed!");
    setEmail("");
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 text-center">
        Subscribe to newsletter
      </h4>

      <form onSubmit={handleSubmit} className="flex gap-3 flex-col sm:flex-row">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Enter email"
          className="flex-1 px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          disabled={loading}
          className="px-5 py-2 rounded-md bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:scale-[1.03] transition"
        >
          {loading ? "..." : "Subscribe"}
        </button>
      </form>

      {msg && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{msg}</p>
      )}
    </div>
  );
};

/* =========================
   SOCIAL
========================= */

const Social = () => (
  <div className="flex gap-4 items-center mt-3">
    {socialLinks.map(({ name, href, icon: Icon }) => (
      <ExternalLink
        key={name}
        href={href}
        className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-110 transition"
        aria-label={name}
      >
        <Icon size={18} />
      </ExternalLink>
    ))}
  </div>
);

/* =========================
   LINKS
========================= */

const FooterLinks = () => (
  <div className="max-w-full grid sm:grid-cols-3 gap-x-12">
    {Object.entries(footerLinks).map(([key, links]) => (
      <div key={key} className="flex flex-col gap-4 items-center">
        <h4 className="text-xs uppercase tracking-wide text-slate-500">
          {formatTitle(key)}
        </h4>

        <ul className="flex flex-col gap-1.5">
          {links.map(({ name, href, icon: Icon }) => (
            <li key={name}>
              <Link
                to={href}
                className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition"
              >
                <Icon size={14} />
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

/* =========================
   FOOTER
========================= */

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">

      <div className="mt-10 max-w-full mx-auto px-6 py-20 grid lg:grid-cols-3 gap-x-12 gap-y-12 bg-gradient-to-t from-slate-50 dark:from-slate-900">

        {/* BRAND */}
        <div className="lg:col-span-1 flex flex-col gap-6 items-center">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="Eventra logo" className="w-10 h-10" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Eventra
            </h2>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400">
            Open-source event management platform for communities worldwide.
          </p>

          <Newsletter />
          <Social />
        </div>

        {/* LINKS */}
        <div className="lg:col-span-2">
          <FooterLinks />
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-full mx-auto px-6 py-8 flex flex-col justify-center items-center gap-1 text-sm text-slate-500 h-[100px]">

          <p>© {new Date().getFullYear()} Eventra</p>

          <div className="flex gap-3">
            <Link to="/privacy" className="hover:text-slate-900 dark:hover:text-slate-100">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-slate-900 dark:hover:text-slate-100">
              Terms
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;