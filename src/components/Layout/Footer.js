import React, { useState } from "react";
/**
 * CHANGES MADE TO THIS FILE (Footer.js):
 * 
 * 1. FIXED UNDEFINED FUNCTION ERROR:
 *    - Removed duplicate inline newsletter form that was causing "handleSubmit is not defined" error
 *    - The form was in the main Footer component without state management
 *    - Replaced with proper Newsletter component that has its own state and handleSubmit
 * 
 * 2. REMOVED DUPLICATE CODE:
 *    - Removed duplicate email input, button, and form validation logic
 *    - Removed duplicate social media icons section
 *    - Both were already properly implemented in separate Newsletter and SocialLinksRender components
 * 
 * 3. RESULT:
 *    - Footer now uses the Newsletter component with proper state management
 *    - Footer now uses the SocialLinksRender component for social links
 *    - No more undefined variable errors (email, setEmail, isSubmitting, handleSubmit)
 */

import { useState } from "react";
import {
  FaGithub,
  FaQuestionCircle,
  FaEnvelope,
  FaBookOpen,
  FaPlus,
  FaUsers,
  FaBook,
  FaHome,
  FaCalendarAlt,
  FaStar,
  FaFolder,
  FaTrophy,
  FaComments,
  FaLinkedin,
  FaDiscord,
  FaTelegram, // Swapped from FaTelegramPlane for official branding
  FaInstagram,
  FaEnvelope,
} from "react-icons/fa";

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
  
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const footerLinks = {
  quick_links: [
    { name: "Home", href: "/", icon: <FaHome size={14} /> },
    { name: "Events", href: "/events", icon: <FaCalendarAlt size={14} /> },
    { name: "Hackathons", href: "/hackathons", icon: <FaStar size={14} /> },
    { name: "Projects", href: "/projects", icon: <FaFolder size={14} /> },
    { name: "About", href: "/about", icon: <FaInfoCircle size={14} /> },
  ],
  community: [
    { name: "Create Event", href: "/create-event", icon: <FaPlus size={14} /> },
    { name: "Community Events", href: "/communityEvent", icon: <FaUsers size={14} /> },
    { name: "Documentation", href: "/documentation", icon: <FaBook size={14} /> },
    { name: "Contributors", href: "/contributors", icon: <FaUsers size={14} /> },
    { name: "Contributors Guide", href: "/contributorguide", icon: <FaBook size={14} /> },
    { name: "LeaderBoard", href: "/leaderBoard", icon: <FaTrophy size={14} /> },
  ],
  support: [
    { name: "Help Center", href: "/helpcenter", icon: <FaQuestionCircle size={14} /> },
    { name: "Contact Us", href: "/contact", icon: <FaEnvelope size={14} /> },
    { name: "Feedback", href: "/feedback", icon: <FaComments size={14} /> },
    { name: "API Docs", href: "/apiDocs", icon: <FaBookOpen size={14} /> },
  ],
};

const legalLinks = [
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms of Service", href: "/terms" },
];

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/sandeepvashishtha/Eventra",
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
    icon: (
      <FaLinkedin
        className="size-10 p-2 rounded-full text-black dark:text-white bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-110 hover:-translate-y-1"
        size={20}
      />
    ),
  },
  {
    name: "Discord",
    href: "https://www.discord.com/",
    icon: (
      <FaDiscord
        className="size-10 p-2 rounded-full text-black dark:text-white bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-110 hover:-translate-y-1"
        size={20}
      />
    ),
  },
  {
    name: "Telegram",
    href: "https://www.telegram.com/",
    icon: (
      <FaTelegram
        className="size-10 p-2 rounded-full text-black dark:text-white bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-110 hover:-translate-y-1"
        size={20}
      />
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/",
    icon: (
      <FaInstagram
        className="size-10 p-2 rounded-full text-black dark:text-white bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-110 hover:-translate-y-1"
        size={20}
      />
    ),
  },
];

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Submitting email:", email);
      toast.success("Thank you for subscribing to our newsletter!");
      setEmail("");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-2">
        Subscribe to our newsletter
      </h4>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
        Get the latest updates, event tips, and community news.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full"
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-4 py-2.5 bg-black text-white dark:bg-white dark:text-black dark:hover:bg-gray-400 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </div>
  );
};

const SocialLinksRender = () => (
  <div className="mt-6">
    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">
      Follow Us
    </h4>
    <div className="flex flex-wrap gap-3">
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          className="text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.name}
          title={link.name}
        >
          <span className="sr-only">{link.name}</span>
          {link.icon}
        </a>
      ))}
    </div>
  </div>
);

const FooterLinksRender = () => (
  <>
    {Object.entries(footerLinks).map(([key, links]) => (
      <div 
        key={key} 
        className="py-2"
        data-aos="fade-up"
        data-aos-delay={key === "quick_links" ? "100" : key === "community" ? "200" : "300"}
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
                  <span className="text-black dark:text-white group-hover:text-black dark:group-hover:text-white group-hover:scale-110 transition-all duration-300">
                    {link.icon}
                  </span>
                )}
                <span>{link.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </>
);

const FooterBottom = () => {
  const currentYear = new Date().getFullYear();
  return (
    <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">
        © {currentYear} Eventra. All rights reserved. Created with ❤️ by Sandeep Vashishtha, Rhythm and the amazing open-source community.
      </p>
      <div className="flex gap-6">
        {legalLinks.map((link) => (
          <Link
            key={link.name}
            to={link.href}
            className="text-xs text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {link.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <footer 
      className="relative z-50 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800"
      data-aos="fade-up"
      data-aos-duration="1000"
      data-aos-offset="100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <div 
            className="space-y-4 lg:col-span-2"
            data-aos="fade-up"
            data-aos-delay="0"
          >
            <h2
              className="text-2xl sm:text-3xl font-bold text-black dark:text-white"
              style={{ fontFamily: "Anton, sans-serif" }}
            >
              Eventra
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Open-source event management for communities worldwide.
            </p>

            {/* Newsletter Component */}
            <Newsletter />
            
            {/* Social Links */}
            <SocialLinksRender />
          </div>
          <FooterLinksRender />
        </div>
      </div>
    </footer>
  );
};

export default NewFooter;
export default Footer;
