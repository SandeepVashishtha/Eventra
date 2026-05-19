import React, { useState } from "react";
import {
  FaGithub,
  FaLinkedin,
  FaDiscord,
  FaTelegram, // Swapped from FaTelegramPlane for official branding
  FaInstagram,
  FaEnvelope,
} from "react-icons/fa";

// 1. STATIC DATA STRUCTURES (Declared outside component to prevent re-renders)
const FOOTER_LINKS = [
  {
    category: "Quick Links",
    links: [
      { name: "Home", href: "#" },
      { name: "Events", href: "#" },
      { name: "Hackathons", href: "#" },
      { name: "Projects", href: "#" },
      { name: "About", href: "#" },
    ],
  },
  {
    category: "Support",
    links: [
      { name: "Help Center", href: "#" },
      { name: "Contact Us", href: "#" },
      { name: "Feedback", href: "#" },
      { name: "API Docs", href: "#" },
    ],
  },
  {
    category: "Community",
    links: [
      { name: "Create Event", href: "#" },
      { name: "Community Events", href: "#" },
      { name: "Documentation", href: "#" },
      { name: "Contributors", href: "#" },
      { name: "Contributors Guide", href: "#" },
      { name: "LeaderBoard", href: "#" },
    ],
  },
];

const LEGAL_LINKS = [
  { name: "Privacy Policy", href: "#" },
  { name: "Terms of Service", href: "#" },
  { name: "Cookie Settings", href: "#" }, // Restored missing legal item
];

const SOCIAL_LINKS = [
  {
    name: "GitHub",
    href: "https://github.com",
    icon: <FaGithub className="w-5 h-5" />,
    brandColor: "hover:bg-neutral-800 dark:hover:bg-white hover:text-white dark:hover:text-black",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    icon: <FaLinkedin className="w-5 h-5" />,
    brandColor: "hover:bg-[#0077B5] hover:text-white",
  },
  {
    name: "Discord",
    href: "https://discord.com",
    icon: <FaDiscord className="w-5 h-5" />,
    brandColor: "hover:bg-[#5865F2] hover:text-white",
  },
  {
    name: "Telegram",
    href: "https://t.me",
    icon: <FaTelegram className="w-5 h-5" />, // Swapped to crisp official branding icon
    brandColor: "hover:bg-[#26A5E4] hover:text-white",
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: <FaInstagram className="w-5 h-5" />,
    brandColor: "hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:text-white",
  },
];

const NewFooter = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // Simulate an API network request duration
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setEmail("");
    setIsLoading(false);
    alert("Thank you for subscribing!");
  };

  return (
    <footer className="site-footer bg-white dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-900 mt-20 text-gray-600 dark:text-zinc-400 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        
        {/* MAIN GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* LEFT SIDE: Brand, Description & Socials */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-black dark:text-white tracking-tight">
                Eventra
              </span>
            </div>

            <p className="leading-relaxed text-sm max-w-sm text-gray-500 dark:text-zinc-400">
              Open-source event management for communities worldwide.
            </p>

            {/* CHANGED HERE: Changed 'flex-wrap' to 'flex-nowrap' to force single line alignment */}
            <div className="flex flex-nowrap gap-3 pt-2">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.name}
                  aria-label={`Visit our ${link.name} page`}
                  className={`footer-social-btn flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800/60 text-gray-700 dark:text-zinc-300 shadow-sm transition-all duration-300 transform ${link.brandColor} shrink-0`}
                >
                  {link.icon}
                  <span className="sr-only">{link.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* DYNAMIC FOOTER NAVIGATION LINKS */}
          {FOOTER_LINKS.map((group) => (
            <div key={group.category}>
              <h3 className="text-xs font-bold text-black dark:text-white mb-4 uppercase tracking-wider">
                {group.category}
              </h3>
              <ul className="space-y-3 text-sm">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="footer-nav-link hover:text-black dark:hover:text-white transition-colors duration-200 block py-0.5"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* MIDDLE SECTION: NEWSLETTER CONTROL BOX */}
        <div className="mt-12 flex justify-center">
          <div className="w-full max-w-lg bg-gray-50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-900 rounded-xl p-5 sm:p-6 flex flex-col items-center text-center shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-1">
              Subscribe to our newsletter
            </h4>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mb-4 max-w-sm">
              Get the latest updates, event tips, and community news.
            </p>
            
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 mb-2 w-full justify-center">
              <div className="relative flex-1 max-w-md w-full">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 dark:text-zinc-500 pointer-events-none">
                  <FaEnvelope size={14} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={isLoading}
                  className="footer-newsletter-input w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm text-gray-800 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-600 outline-none focus:border-gray-400 dark:focus:border-zinc-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="footer-newsletter-btn bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-zinc-200 disabled:opacity-60 disabled:hover:bg-black dark:disabled:hover:bg-white disabled:cursor-not-allowed transition-all duration-200 shadow-sm whitespace-nowrap min-w-[100px] flex items-center justify-center"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  "Subscribe"
                )}
              </button>
            </form>
            
            <p className="text-[11px] text-gray-400 dark:text-zinc-500">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-gray-100 dark:border-zinc-900 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400 dark:text-zinc-500">
          <p>© {currentYear} Eventra. All rights reserved. Created by Sandeep Vashishtha</p>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="hover:text-black dark:hover:text-white underline underline-offset-4 transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default NewFooter;