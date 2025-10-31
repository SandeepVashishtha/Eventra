// src/Pages/Documentation/DocumentationPage.jsx
import React from "react";
import {
  FiBookOpen,
  FiLayers,
  FiCpu,
  FiCode,
  FiPlay,
  FiGitBranch,
  FiUsers,
} from "react-icons/fi";
import {
  FiInfo,
  FiPlayCircle,
  FiCheckCircle,
  FiSmartphone,
  FiAlertCircle,
  FiPlusCircle,
  FiBell,
  FiLock,
} from "react-icons/fi";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react"; // make sure these are imported

export default function DocumentationPage() {
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };
  const faqs = [
    {
      question: "What is Eventra?",
      answer:
        "Eventra is a platform that provides information about projects, hackathons, events, and more. It helps users stay updated and participate in opportunities that match their interests.",
      icon: <FiInfo className="w-6 h-6 text-blue-500" />,
    },
    {
      question: "How do I get started with Eventra?",
      answer:
        "1. Sign up or log in to Eventra.\n2. Explore the latest projects, hackathons, and events.\n3. Participate or bookmark events that interest you.",
      icon: <FiPlayCircle className="w-6 h-6 text-green-500" />,
    },
    {
      question: "Is Eventra free to use?",
      answer:
        "Yes, Eventra is free to use for browsing and accessing basic event information. Some premium features may require a subscription in the future.",
      icon: <FiCheckCircle className="w-6 h-6 text-yellow-500" />,
    },
    {
      question: "What platforms does Eventra support?",
      answer:
        "Eventra is accessible on Web and Mobile platforms, ensuring you can check events anytime, anywhere.",
      icon: <FiSmartphone className="w-6 h-6 text-purple-500" />,
    },
    {
      question: "How can I suggest an event or report an issue?",
      answer:
        "You can submit suggestions or report issues via our Contact Form or by reaching out to our support email. Please provide detailed information to help us improve Eventra.",
      icon: <FiAlertCircle className="w-6 h-6 text-red-500" />,
    },
    {
      question: "Can I create my own events on Eventra?",
      answer:
        "Yes! Eventra allows registered users to create and manage their own events, hackathons, or project showcases directly from the platform.",
      icon: <FiPlusCircle className="w-6 h-6 text-indigo-500" />,
    },
    {
      question: "How do I stay updated about upcoming events?",
      answer:
        "You can subscribe to notifications, follow specific categories, or bookmark events to get timely updates and reminders.",
      icon: <FiBell className="w-6 h-6 text-pink-500" />,
    },
    {
      question: "Does Eventra support team collaborations?",
      answer:
        "Absolutely. Users can form teams, collaborate on projects, and participate in hackathons together through Eventra's Collaboration Hub.",
      icon: <FiUsers className="w-6 h-6 text-teal-500" />,
    },
    {
      question: "Is my personal information safe on Eventra?",
      answer:
        "Yes. Eventra prioritizes user privacy and security. All personal information is stored securely and is never shared without consent.",
      icon: <FiLock className="w-6 h-6 text-gray-700" />,
    },
  ];

  // UPDATED: Code block styles for dark mode
  const codeBlockClass =
    "bg-indigo-50 dark:bg-gray-900 p-6 rounded-xl overflow-x-auto shadow text-indigo-900 dark:text-indigo-300 text-lg font-mono";
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  return (
    // UPDATED: Main page background and text color
    <div className="min-h-screen bg-gray-100 dark:bg-black text-gray-900 dark:text-gray-300 px-6 py-12 space-y-12">
      {/* Header */}
      <header className="text-center max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          // AOS Implementation (Header)
          data-aos="fade-down"
          data-aos-once="true"
          // UPDATED: Header text colors
          className="text-5xl font-extrabold text-indigo-900 dark:text-indigo-300 mb-4"
        >
          Eventra Documentation
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-indigo-700 dark:text-indigo-400 text-xl"
        >
          Modern Event Management Platform for Builders & Communities
        </motion.p>
      </header>

      {/* Features Section */}
      <motion.section
        // UPDATED: Card background
        className="max-w-5xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
        // AOS Implementation
        data-aos="fade-up"
        data-aos-delay="0"
      >
        {/* UPDATED: Title icon and text colors */}
        <div className="flex items-center mb-6 text-indigo-800 dark:text-indigo-400">
          <FiBookOpen className="mr-3 text-3xl" />
          <h2 className="text-3xl font-bold">Features</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6 text-indigo-900 dark:text-gray-300">
          <div className="space-y-2">
            <h3 className="font-semibold text-xl">Core Features</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Create and manage hackathons</li>
              <li>Register participants and teams</li>
              <li>Project submission and tracking</li>
              <li>Event schedule and agenda management</li>
              <li>Real-time updates and notifications</li>
              <li>Judging and scoring system</li>
              <li>Winner announcement and certificates</li>
              <li>Discussion forums for participants</li>
              <li>Resource sharing (guides, datasets, APIs)</li>
              <li>Customizable hackathon branding</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-xl">Platform Features</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>User authentication and profiles</li>
              <li>Dark mode and theme support</li>
              <li>Responsive and mobile-friendly design</li>
              <li>Search and filter events/projects</li>
              <li>Integration with calendar apps</li>
              <li>Notifications for upcoming deadlines</li>
              <li>Team collaboration tools</li>
              <li>Analytics dashboard for organizers</li>
              <li>Social media sharing and promotion</li>
              <li>Cloud storage for project files</li>
            </ul>
          </div>
        </div>

      </motion.section>

      {/* Tech Stack Section */}
      <motion.section
        // UPDATED: Card background
        className="max-w-5xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
        // AOS Implementation
        data-aos="fade-up"
        data-aos-delay="100"
      >
        {/* UPDATED: Title icon and text colors */}
        <div className="flex items-center mb-6 text-indigo-800 dark:text-indigo-400">
          <FiCpu className="mr-3 text-3xl" />
          <h2 className="text-3xl font-bold">Tech Stack</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6 text-indigo-900 dark:text-gray-300 text-lg">
          <div>
            <h3 className="text-2xl font-semibold mb-3">Backend</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Spring Boot 3.3.1 (Java 17)</li>
              <li>Database: MySQL (Aiven) / H2 (dev)</li>
              <li>Spring Security + JWT</li>
              <li>Maven build tool</li>
            </ul>
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-3">Frontend</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>React 18.2.0</li>
              <li>React Router DOM 6.8.0</li>
              <li>Framer Motion 8.5.2 for animations</li>
              <li>Tailwind CSS for modern styling</li>
              <li>Create React App build setup</li>
            </ul>
          </div>
        </div>
      </motion.section>

      {/* Architecture Section */}
      <motion.section
        // UPDATED: Card background
        className="max-w-5xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
        // AOS Implementation
        data-aos="fade-up"
        data-aos-delay="200"
      >
        {/* UPDATED: Title icon and text colors */}
        <div className="flex items-center mb-6 text-indigo-800 dark:text-indigo-400">
          <FiLayers className="mr-3 text-3xl" />
          <h2 className="text-3xl font-bold">Architecture</h2>
        </div>
        <pre className={codeBlockClass}>
          {`Eventra/
├── .github/                   # GitHub workflows and templates
├── public/                    # Static assets
│   ├── favicon.ico
│   ├── index.html
│   └── manifest.json
├── src/                       # React source code
│   ├── components/            # React components
│   │   ├── admin/             # Admin dashboard components
│   │   │   ├── AdminDashboard.js
│   │   │   └── AdminDashboard.css
│   │   ├── auth/              # Authentication components
│   │   │   ├── Auth.css
│   │   │   ├── Login.js
│   │   │   ├── PasswordReset.js
│   │   │   ├── ProtectedRoute.js
│   │   │   ├── Signup.js
│   │   │   └── Unauthorized.js
│   │   ├── common/            # Shared components
│   │   │   ├── common-components.css
│   │   │   ├── ErrorMessage.js
│   │   │   ├── EventCreation.js
│   │   │   ├── EventCreation.css
│   │   │   ├── Loading.js
│   │   │   ├── ProjectSubmission.js
│   │   │   └── ProjectSubmission.css
│   │   ├── Layout/            # Layout components
│   │   │   ├── Footer.js
│   │   │   └── Navbar.js
│   │   ├── styles/            # Component-specific styles
│   │   │   ├── components.css
│   │   │   ├── Contributors.css
│   │   │   ├── notFound.css
│   │   │   ├── scrolltotopButton.css
│   │   │   └── shared-layout.css
│   │   ├── user/              # User-specific components
│   │   │   ├── UserDashboard.css
│   │   │   └── UserDashboard.js
│   │   ├── CollaborationHub.js       # Collaboration features
│   │   ├── Contributors.js           # Contributors display
│   │   ├── Dashboard.js              # Main dashboard
│   │   ├── NotFound.js               # 404 page
│   │   ├── ScrollToTop.js            # Scroll to top button
│   │   └── SearchFilter.js           # Search and filter
│   ├── config/                # Configuration files
│   │   └── api.js                    # API endpoints and utilities
│   ├── context/               # React context providers
│   │   └── AuthContext.js            # Authentication context
│   ├── Pages/                 # Page components
│   │   ├── About/             # About page components
│   │   │   ├── AboutPage.js
│   │   │   ├── Features.js
│   │   │   ├── MissionVision.js
│   │   │   └── ModernAbout.js
│   │   ├── Contact/           # Contact page
│   │   │   └── ContactUs.js
│   │   ├── Events/            # Events pages
│   │   │   ├── eventsMockData.json
│   │   │   └── EventsPage.js
│   │   ├── Hackathons/        # Hackathons section
│   │   │   ├── HackathonHero.js
│   │   │   ├── hackathonMockData.json
│   │   │   └── HackathonPage.js
│   │   ├── Home/              # Home page
│   │   │   ├── HomePage.jsx
│   │   │   └── components/
│   │   │       ├── Community.js
│   │   │       ├── Features.js
│   │   │       ├── GitHubStats.jsx
│   │   │       ├── Hero.js
│   │   │       ├── Testimonials.js
│   │   │       └── WhatsHappening.js
│   │   ├── Leaderboard/       # Leaderboard page
│   │   │   └── Leaderboard.jsx
│   │   └── Projects/          # Projects section
│   │       ├── mockProjectsData.json
│   │       ├── ProjectHero.js
│   │       └── ProjectsPage.js
│   ├── App.js                 # Main App component
│   ├── App.css                # Global app styles
│   ├── index.js               # React entry point
│   └── index.css              # Global CSS styles
├── build/                     # Production build output
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── LICENSE                    # Apache 2.0 license
├── package.json               # npm dependencies and scripts
├── package-lock.json          # npm lock file
├── README.md                  # Project documentation
└── vercel.json                # Vercel deployment configuration`}
        </pre>
      </motion.section>

      {/* Quick Start Section */}
      <motion.section
        // UPDATED: Card background
        className="max-w-5xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
        // AOS Implementation
        data-aos="fade-up"
        data-aos-delay="300"
      >
        {/* UPDATED: Title icon and text colors */}
        <div className="flex items-center mb-6 text-indigo-800 dark:text-indigo-400">
          <FiPlay className="mr-3 text-3xl" />
          <h2 className="text-3xl font-bold">Quick Start</h2>
        </div>
        <p className="text-indigo-900 dark:text-gray-300 text-lg mb-3">
          <strong>Prerequisites:</strong> Node.js 16+, npm/yarn, Git
        </p>
        <pre className={codeBlockClass}>
          {`git clone https://github.com/SandeepVashishtha/Eventra.git
cd Eventra
npm install
npm start`}
        </pre>
      </motion.section>

      {/* Deployment Section */}
      <motion.section
        className="max-w-5xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
        // AOS Implementation
        data-aos="fade-up"
        data-aos-delay="400"
      >
        <div className="flex items-center mb-6 text-indigo-800 dark:text-indigo-400">
          <FiGitBranch className="mr-3 text-3xl" />
          <h2 className="text-3xl font-bold">Deployment</h2>
        </div>
        <ul className="list-disc list-inside text-indigo-900 dark:text-gray-300 text-lg space-y-1">
          <li>Frontend: Hosted on Vercel</li>
          <li>Backend: Spring Boot deployment on Azure or preferred host</li>
        </ul>
      </motion.section>

      {/* License Section */}
      <motion.section
        className="max-w-5xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
        // AOS Implementation
        data-aos="fade-up"
        data-aos-delay="500"
      >
        <div className="flex items-center mb-6 text-indigo-800 dark:text-indigo-400">
          <FiCode className="mr-3 text-3xl" />
          <h2 className="text-3xl font-bold">License</h2>
        </div>
        <p className="text-indigo-900 dark:text-gray-300 text-lg">
          Apache License 2.0 - see the LICENSE file for details.
        </p>
      </motion.section>

      {/* Contributing Section */}
      <motion.section
        className="max-w-5xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
        // AOS Implementation
        data-aos="fade-up"
        data-aos-delay="600"
      >
        <div className="flex items-center mb-6 text-indigo-800 dark:text-indigo-400">
          <FiUsers className="mr-3 text-3xl" />
          <h2 className="text-3xl font-bold">Contributing</h2>
        </div>
        <ol className="list-decimal list-inside space-y-2 text-indigo-900 dark:text-gray-300 text-lg">
          <li>Fork the repository</li>
          <li>
            Create a feature branch:{" "}
            <code className="bg-indigo-100 dark:bg-gray-700 px-2 py-1 rounded">
              git checkout -b feature/your-feature
            </code>
          </li>
          <li>
            Commit changes:{" "}
            <code className="bg-indigo-100 dark:bg-gray-700 px-2 py-1 rounded">
              git commit -m "Add feature"
            </code>
          </li>
          <li>Push branch and open a Pull Request</li>
        </ol>
      </motion.section>

      {/* FAQ Section */}
      <section 
        className="max-w-5xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg"
        // AOS Implementation
        data-aos="fade-up"
        data-aos-delay="700"
      >
        <h2 className="text-3xl font-bold mb-10 text-center text-gray-900 dark:text-white">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => toggleFAQ(index)}
              data-aos="zoom-in-up"
              data-aos-delay={750 + index * 50}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-6">
                  {faq.icon}
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {faq.question}
                  </h3>
                </div>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                )}
              </div>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-line"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* UPDATED: Footer text, border, and link colors */}
      <footer 
        className="text-center text-indigo-700 dark:text-indigo-400 mt-24 border-t border-indigo-200 dark:border-gray-700 pt-8 pb-6"
        data-aos="fade-up"
        data-aos-offset="50"
      >
        <p className="text-indigo-800 dark:text-indigo-300 text-lg font-medium">
          Built with <span className="text-red-500">❤️</span> by the Eventra
          Team.
        </p>
        <p className="mt-2 text-indigo-700 dark:text-indigo-400 text-base">
          Visit{" "}
          <a
            href="https://eventra-psi.vercel.app/"
            className="text-indigo-900 dark:text-indigo-200 font-semibold underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Live Demo
          </a>
        </p>
      </footer>
    </div>
  );
}