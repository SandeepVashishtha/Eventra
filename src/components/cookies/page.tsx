"use client";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FaCookie, FaShieldAlt, FaChartBar, FaCog, FaGlobe, FaUsers } from "react-icons/fa";

export default function CookiesPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-3xl flex items-center justify-center text-6xl mb-6 shadow-2xl">
            🍪
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            Cookie Policy
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">Last updated: June 29, 2026</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-10 md:p-14 space-y-14">
          {/* What are Cookies */}
          <section>
            <h2 className="text-3xl font-semibold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
              <FaCookie className="text-amber-500" /> What Are Cookies?
            </h2>
            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
              Cookies are small text files that are stored on your device (computer, smartphone, or
              tablet) when you visit a website. They help websites remember information about your
              visit, making your experience more efficient and personalized.
            </p>
          </section>

          {/* Why We Use Cookies */}
          <section>
            <h2 className="text-3xl font-semibold mb-6 text-gray-900 dark:text-white">
              Why Does Eventra Use Cookies?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              We use cookies to provide a seamless experience, improve functionality, analyze usage,
              and enhance the overall quality of our platform.
            </p>
          </section>

          {/* Cookie Categories */}
          <section>
            <h2 className="text-3xl font-semibold mb-8 text-gray-900 dark:text-white">
              Types of Cookies We Use
            </h2>

            <div className="space-y-10">
              {/* Essential */}
              <div className="border-l-4 border-emerald-500 pl-6">
                <div className="flex items-center gap-4 mb-3">
                  <FaShieldAlt className="text-2xl text-emerald-600" />
                  <h3 className="text-2xl font-semibold">1. Essential Cookies</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  These cookies are necessary for the website to function properly and cannot be
                  disabled.
                </p>
                <p className="text-sm text-gray-500">Duration: Session or up to 1 year</p>
              </div>

              {/* Functional */}
              <div className="border-l-4 border-blue-500 pl-6">
                <div className="flex items-center gap-4 mb-3">
                  <FaCog className="text-2xl text-blue-600" />
                  <h3 className="text-2xl font-semibold">2. Functional Cookies</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  These allow us to remember your preferences (language, theme, saved events, etc.)
                  for a better experience.
                </p>
                <p className="text-sm text-gray-500">Duration: Up to 1 year</p>
              </div>

              {/* Performance / Analytics */}
              <div className="border-l-4 border-purple-500 pl-6">
                <div className="flex items-center gap-4 mb-3">
                  <FaChartBar className="text-2xl text-purple-600" />
                  <h3 className="text-2xl font-semibold">3. Analytics &amp; Performance Cookies</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Help us understand how visitors use Eventra, which pages are most popular, and
                  improve our services.
                </p>
                <p className="text-sm text-gray-500">Duration: Up to 2 years</p>
              </div>

              {/* Marketing */}
              <div className="border-l-4 border-rose-500 pl-6">
                <div className="flex items-center gap-4 mb-3">
                  <FaGlobe className="text-2xl text-rose-600" />
                  <h3 className="text-2xl font-semibold">4. Marketing Cookies</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Used to show relevant advertisements and measure the effectiveness of our
                  marketing campaigns.
                </p>
                <p className="text-sm text-gray-500 mt-2">Duration: Up to 1 year</p>
              </div>
            </div>
          </section>

          {/* Third-Party Cookies */}
          <section>
            <h2 className="text-3xl font-semibold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
              <FaUsers className="text-violet-500" /> Third-Party Cookies
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We may use services from trusted third parties (such as Google Analytics, payment
              gateways, and social media platforms) that set their own cookies. These third parties
              have their own privacy and cookie policies.
            </p>
          </section>

          {/* Managing Cookies */}
          <section>
            <h2 className="text-3xl font-semibold mb-6 text-gray-900 dark:text-white">
              How to Manage Cookies
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                You can control and manage cookies through your browser settings. Here’s how:
              </p>
              <ul className="space-y-4 text-gray-600 dark:text-gray-400">
                <li className="flex gap-3">
                  <span className="font-medium text-gray-900 dark:text-white">1.</span>
                  Visit your browser’s settings or preferences menu
                </li>
                <li className="flex gap-3">
                  <span className="font-medium text-gray-900 dark:text-white">2.</span>
                  Look for “Privacy” or “Cookies” section
                </li>
                <li className="flex gap-3">
                  <span className="font-medium text-gray-900 dark:text-white">3.</span>
                  Block, allow, or delete cookies as per your preference
                </li>
              </ul>
              <p className="mt-6 text-sm text-amber-600 dark:text-amber-400 font-medium">
                Note: Disabling essential cookies may affect the functionality of the website.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-gray-600 dark:text-gray-400">
              If you have any questions about our Cookie Policy, please contact us at{" "}
              <a
                href="mailto:privacy@eventra.in"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                privacy@eventra.in
              </a>
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-gray-500 dark:text-gray-400">
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
          <span>•</span>
          <span>© {new Date().getFullYear()} Eventra</span>
        </div>
      </div>
    </div>
  );
}
