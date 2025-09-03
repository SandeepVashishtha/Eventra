import { useState } from "react";
import { FaTwitter, FaLinkedin, FaDiscord, FaTelegram } from "react-icons/fa";
import {
  FaInfoCircle,
  FaGithub,
  FaCode,
  FaFileAlt,
  FaShieldAlt,
  FaFileContract,
  FaQuestionCircle,
  FaEnvelope,
  FaBookOpen,
  FaPlus,
  FaClipboardList,
  FaUsers,
  FaBook,
  FaServer,
} from "react-icons/fa";

// Toast Component
const Toast = ({ message, type, onClose }) => {
  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg text-white ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      } transition-opacity duration-300`}
    >
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      showToast("Please enter your email address", "error");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real application, you would make an API call to your backend here
      console.log("Submitting email:", email);

      showToast("Thank you for subscribing to our newsletter!");
      setEmail("");
    } catch (error) {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const footerLinks = {
    community: [
      {
        name: "Create Event",
        href: "/create-event",
        icon: <FaPlus size={14} />,
      },
      {
        name: "Event Templates",
        href: "#templates",
        icon: <FaClipboardList size={14} />,
      },
      {
        name: "Community Events",
        href: "#community",
        icon: <FaUsers size={14} />,
      },
      { name: "Documentation", href: "#docs", icon: <FaBook size={14} /> },
    ],
    quick_links: [
      { name: "About", href: "/about", icon: <FaInfoCircle size={14} /> },
      { name: "Open Source", href: "#opensource", icon: <FaCode size={14} /> },
      {
        name: "GitHub",
        href: "https://github.com/sandeepvashishtha/Eventra",
        icon: <FaGithub size={14} />,
      },
      { name: "Changelog", href: "#changelog", icon: <FaFileAlt size={14} /> },
      { name: "Privacy", href: "#privacy", icon: <FaShieldAlt size={14} /> },
      { name: "Terms", href: "#terms", icon: <FaFileContract size={14} /> },
    ],
    support: [
      {
        name: "Help Center",
        href: "#help",
        icon: <FaQuestionCircle size={14} />,
      },
      { name: "Contact Us", href: "#contact", icon: <FaEnvelope size={14} /> },
      { name: "API Docs", href: "#api", icon: <FaBookOpen size={14} /> },
      { name: "Status", href: "#status", icon: <FaServer size={14} /> },
    ],
  };

  const socialLinks = [
    {
      name: "GitHub",
      href: "https://github.com/sandeepvashishtha/Eventra",
      icon: (
        <FaGithub
          className="size-10 p-2 rounded-full text-indigo-500 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:bg-indigo-100"
          size={20}
        />
      ),
    },
    {
      name: "Twitter",
      href: "https://twitter.com/#",
      icon: (
        <FaTwitter
          className="size-10 p-2 rounded-full text-indigo-500 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:bg-indigo-100"
          size={20}
        />
      ),
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/sandeepvashishtha/",
      icon: (
        <FaLinkedin
          className="size-10 p-2 rounded-full text-indigo-500 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:bg-indigo-100"
          size={20}
        />
      ),
    },
    {
      name: "Discord",
      href: "#discord",
      icon: (
        <FaDiscord
          className="size-10 p-2 rounded-full text-indigo-500 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:bg-indigo-100"
          size={20}
        />
      ),
    },
    {
      name: "Telegram",
      href: "https://t.me/eventra",
      icon: (
        <FaTelegram
          className="size-10 p-2 rounded-full text-indigo-500 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:bg-indigo-100"
          size={20}
        />
      ),
    },
  ];

  return (
    <>
      <footer className="bg-indigo-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="space-y-4 md:col-span-2">
              <h2 className="text-3xl font-bold text-indigo-600">Eventra</h2>
              <p className="text-gray-600 text-sm">
                Open-source event management for communities worldwide.
              </p>

              {/* Newsletter Subscription Form */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                  Subscribe to our newsletter
                </h4>
                <p className="text-gray-600 text-sm mb-3">
                  Get the latest updates, event tips, and community news.
                </p>
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row gap-2"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent flex-grow"
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Subscribing..." : "Subscribe"}
                  </button>
                </form>
                <p className="text-xs text-gray-500 mt-2">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </div>
            </div>

            {Object.entries(footerLinks).map(([key, links]) => (
              <div key={key} className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  {key.replace("_", " ")}
                </h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-sm text-gray-600 hover:text-indigo-600 flex items-center gap-2 transition-colors"
                      >
                        {link.icon && (
                          <span className="text-indigo-500">{link.icon}</span>
                        )}
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-400 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © {currentYear} Eventra. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.name}
                >
                  <span className="sr-only">{link.name}</span>
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: "", type: "" })}
        />
      )}
    </>
  );
};

export default Footer;
