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
import { Link } from "react-router-dom";

const footerLinks = {
  quick_links: [
    { name: "Home", href: "/", icon: Home },
    { name: "Events", href: "/events", icon: Calendar },
    { name: "Hackathons", href: "/hackathons", icon: Star },
    { name: "Projects", href: "/projects", icon: Folder },
    { name: "About", href: "/about", icon: Info }
  ],
  community: [
    { name: "Create Event", href: "/create-event", icon: Plus },
    { name: "Community Events", href: "/community-event", icon: Users },
    { name: "Documentation", href: "/documentation", icon: Book },
    { name: "Contributors", href: "/contributors", icon: Users },
    { name: "Contributors Guide", href: "/contributorguide", icon: Book },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy }
  ],
  support: [
    { name: "Help Center", href: "/helpcenter", icon: HelpCircle },
    { name: "FAQ", href: "/faq", icon: HelpCircle },
    { name: "Contact Us", href: "/contact", icon: Mail },
    { name: "Feedback", href: "/feedback", icon: MessageSquare },
    { name: "API Docs", href: "/apiDocs", icon: BookOpen }
  ]
};

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/sandeepvashishtha/Eventra",
    icon: Github
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

const ExternalLink = ({ href, children, ...props }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
    {children}
  </a>
);

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

    setLoading(true);
    setMsg("");

    await new Promise((r) => setTimeout(r, 700));

    setMsg("Subscribed!");
    setEmail("");
    setLoading(false);
  };

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
      </div>
    </footer>
  );
};

export default Footer;