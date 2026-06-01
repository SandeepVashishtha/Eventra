import { Book, BookOpen, Calendar, Folder, Github, Home, Info, Linkedin, MessageCircle, Plus, HelpCircle, Star, Trophy, Users, Mail, MessageSquare } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const footerLinks = {
  quick_links: [
    { name: "Home", href: "/", icon: Home },
    { name: "Events", href: "/events", icon: Calendar },
    { name: "Hackathons", href: "/hackathons", icon: Star },
    { name: "Projects", href: "/projects", icon: Folder },
    { name: "About", href: "/about", icon: Info },
  ],
  community: [
    { name: "Create Event", href: "/create-event", icon: Plus },
    { name: "Community Events", href: "/communityEvent", icon: Users },
    { name: "Documentation", href: "/documentation", icon: Book },
    { name: "Contributors", href: "/contributors", icon: Users },
    { name: "Contributors Guide", href: "/contributorguide", icon: Book },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  ],
  support: [
    { name: "Help Center", href: "/helpcenter", icon: HelpCircle },
    { name: "FAQ", href: "/faq", icon: HelpCircle },
    { name: "Contact Us", href: "/contact", icon: Mail },
    { name: "Feedback", href: "/feedback", icon: MessageSquare },
    { name: "API Docs", href: "/apiDocs", icon: BookOpen },
  ],
};

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/sandeepvashishtha/Eventra",
    icon: Github,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/sandeepvashishtha/",
    icon: Linkedin,
  },
  {
    name: "Discord",
    href: "https://discord.com/users/sandeep_vashishtha",
    icon: MessageCircle,
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
    <div
      className="w-full max-w-md rounded-2xl border bg-white/60 p-3 shadow-md sm:p-4 backdrop-blur-md"
      style={{ borderColor: 'rgba(2,6,23,0.06)' }}
    >
      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Stay updated
      </h4>
      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
        Get product updates and community event highlights in your inbox.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 xs:flex-row">
        <div className="group relative min-w-0 flex-1">
          <Mail
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-hover:text-indigo-500"
            size={14}
            aria-hidden="true"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Enter email"
            aria-label="Newsletter email"
            className="footer-newsletter-input w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-indigo-400 hover:bg-indigo-50/40 hover:shadow-[0_8px_24px_rgba(99,102,241,0.14)] focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-indigo-400 dark:hover:bg-slate-900 dark:focus:bg-slate-950"
          />
        </div>

        <button
          disabled={loading}
          className="footer-newsletter-btn shrink-0 rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition-shadow hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-200"
          style={{ boxShadow: '0 8px 28px rgba(224,233,242,0.18)' }}
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
        className="footer-social-btn rounded-full bg-white/80 p-2 text-slate-700 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-200"
        aria-label={name}
        style={{ boxShadow: '0 6px 18px rgba(2,6,23,0.04)' }}
      >
        <Icon size={16} />
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
    <footer
      className="site-footer"
      style={{ background: 'linear-gradient(180deg, #E0E9F2 0%, #F7FBFF 100%)' }}
    >
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12 lg:px-8">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="Eventra logo" className="h-10 w-10 shrink-0" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Eventra
            </h2>
          </div>

          <p className="max-w-md text-sm leading-6 text-slate-600">
            Open-source event management for technical communities - discover, collaborate, and grow together.
          </p>

          <Newsletter />
          <Social />
        </div>

        <div className="min-w-0">
          <FooterLinks />
        </div>
      </div>

      <div className="mt-6">
        <div className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-slate-600">&copy; {new Date().getFullYear()} Eventra. All rights reserved.</p>

            <div className="flex gap-6">
              <Link to="/privacy" className="text-sm text-slate-600 hover:text-slate-900">Privacy</Link>
              <Link to="/terms" className="text-sm text-slate-600 hover:text-slate-900">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
