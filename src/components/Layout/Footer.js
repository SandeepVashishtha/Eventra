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
  FaInfoCircle,
  FaInstagram,
  FaDiscord,
  FaTelegram,
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
} from "react-icons/fa";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        <FooterBottom />
      </div>
    </footer>
  );
};

export default Footer;