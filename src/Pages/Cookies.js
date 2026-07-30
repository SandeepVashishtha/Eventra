import { Link } from "react-router-dom";
import { FaChartBar, FaCog, FaCookie, FaShieldAlt } from "react-icons/fa";

const cookieCategories = [
  {
    title: "Essential Cookies",
    icon: <FaShieldAlt className="text-emerald-600" />,
    description:
      "Required for core site behavior such as authentication, security checks, routing, and saved preferences.",
    duration: "Session or up to 1 year",
  },
  {
    title: "Functional Cookies",
    icon: <FaCog className="text-blue-600" />,
    description:
      "Remember choices such as language, theme, and event preferences so repeat visits feel consistent.",
    duration: "Up to 1 year",
  },
  {
    title: "Analytics Cookies",
    icon: <FaChartBar className="text-purple-600" />,
    description:
      "Help measure page usage and feature performance so the platform can be improved over time.",
    duration: "Up to 2 years",
  },
];

const Cookies = () => (
  <main className="min-h-screen bg-gray-50 px-6 py-16 text-gray-900 dark:bg-gray-950 dark:text-white">
    <div className="mx-auto max-w-4xl">
      <div className="mb-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-100 text-4xl text-amber-600 dark:bg-amber-900/30">
          <FaCookie />
        </div>
        <h1 className="mb-3 text-4xl font-bold">Cookie Policy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: June 29, 2026
        </p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="space-y-10">
          <div>
            <h2 className="mb-3 text-2xl font-semibold">What Are Cookies?</h2>
            <p className="leading-7 text-gray-600 dark:text-gray-300">
              Cookies are small text files stored on your device when you visit a website.
              Eventra uses them to keep the app reliable, remember preferences, and
              understand how visitors use the platform.
            </p>
          </div>

          <div>
            <h2 className="mb-5 text-2xl font-semibold">Types of Cookies We Use</h2>
            <div className="space-y-5">
              {cookieCategories.map((category) => (
                <article
                  key={category.title}
                  className="rounded-xl border border-gray-200 p-5 dark:border-gray-800"
                >
                  <div className="mb-2 flex items-center gap-3">
                    <span className="text-xl" aria-hidden="true">
                      {category.icon}
                    </span>
                    <h3 className="text-lg font-semibold">{category.title}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {category.description}
                  </p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Duration: {category.duration}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold">Managing Cookies</h2>
            <p className="leading-7 text-gray-600 dark:text-gray-300">
              You can manage or delete cookies in your browser settings. Blocking
              essential cookies may prevent parts of the application from working as expected.
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
            <Link to="/privacy" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              Privacy Policy
            </Link>
            <span className="mx-3">|</span>
            <Link to="/terms" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              Terms of Service
            </Link>
          </div>
        </div>
      </section>
    </div>
  </main>
);

export default Cookies;
