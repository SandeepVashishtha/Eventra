import React from "react";
import {
  FaGithub,
  FaLinkedin,
  FaDiscord,
  FaTelegramPlane,
  FaInstagram,
  FaEnvelope,
} from "react-icons/fa";

const NewFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        
        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* LEFT SIDE: Brand, Description & Socials */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl font-bold text-black tracking-tight">
                Eventra
              </span>
            </div>

            <p className="text-gray-500 leading-relaxed text-sm mb-4 max-w-sm">
              Open-source event management for communities worldwide.
            </p>

            {/* SOCIAL ICONS */}
            <div className="flex gap-4 text-black text-lg">
              <a href="#" className="hover:text-gray-500 transition" aria-label="GitHub">
                <FaGithub />
              </a>
              <a href="#" className="hover:text-gray-500 transition" aria-label="LinkedIn">
                <FaLinkedin />
              </a>
              <a href="#" className="hover:text-gray-500 transition" aria-label="Discord">
                <FaDiscord />
              </a>
              <a href="#" className="hover:text-gray-500 transition" aria-label="Telegram">
                <FaTelegramPlane />
              </a>
              <a href="#" className="hover:text-gray-500 transition" aria-label="Instagram">
                <FaInstagram />
              </a>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="text-[15px] font-semibold text-black mb-4 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="hover:text-black cursor-pointer transition">Home</li>
              <li className="hover:text-black cursor-pointer transition">Events</li>
              <li className="hover:text-black cursor-pointer transition">Hackathons</li>
              <li className="hover:text-black cursor-pointer transition">Projects</li>
              <li className="hover:text-black cursor-pointer transition">About</li>
            </ul>
          </div>

          {/* SUPPORT LINKS */}
          <div>
            <h3 className="text-[15px] font-semibold text-black mb-4 uppercase tracking-wider">
              Support
            </h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="hover:text-black cursor-pointer transition">Help Center</li>
              <li className="hover:text-black cursor-pointer transition">Contact Us</li>
              <li className="hover:text-black cursor-pointer transition">Feedback</li>
              <li className="hover:text-black cursor-pointer transition">API Docs</li>
            </ul>
          </div>

          {/* COMMUNITY LINKS */}
          <div>
            <h3 className="text-[15px] font-semibold text-black mb-4 uppercase tracking-wider">
              Community
            </h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="hover:text-black cursor-pointer transition">Create Event</li>
              <li className="hover:text-black cursor-pointer transition">Community Events</li>
              <li className="hover:text-black cursor-pointer transition">Documentation</li>
              <li className="hover:text-black cursor-pointer transition">Contributors</li>
              <li className="hover:text-black cursor-pointer transition">Contributors Guide</li>
              <li className="hover:text-black cursor-pointer transition">LeaderBoard</li>
            </ul>
          </div>

        </div>

        {/* MIDDLE SECTION: TIGHTLY FITTED NEWSLETTER BOX */}
        <div className="mt-6 flex justify-center">
          <div className="w-full max-w-lg bg-gray-50 border border-gray-100 rounded-xl p-4 sm:p-5 flex flex-col items-center text-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-1">
              Subscribe to our newsletter
            </h4>
            <p className="text-xs text-gray-500 mb-4">
              Get the latest updates, event tips, and community news.
            </p>
            
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 mb-2 w-full justify-center">
              <div className="relative flex-1 max-w-xs">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <FaEnvelope size={14} />
                </span>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-gray-400 transition"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition shadow-sm whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
            
            <p className="text-[11px] text-gray-400">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-gray-100 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© {currentYear} Eventra. All rights reserved. Created by Sandeep Vashishtha</p>

          <div className="flex gap-6">
            <a href="#" className="hover:text-black underline underline-offset-4 transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-black underline underline-offset-4 transition">
              Terms of Service
            </a>
            <a href="#" className="hover:text-black underline underline-offset-4 transition">
              Cookies Settings
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default NewFooter;