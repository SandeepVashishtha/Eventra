import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import {
  Search,
  Award,
  Users,
  FileText,
  Star,
  Calendar,
  Settings,
  BookOpen,
  Mail,
  MessageCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  FileSearch,
  GitPullRequest,
  HelpCircle,
} from "lucide-react";
import {
  FaDiscord,
  FaGithub,
  FaTwitter,
  FaYoutube,
  FaLinkedin,
  FaTelegram,
} from "react-icons/fa"; // ✅ Community icons
import { Link } from "react-router-dom"; // ✅ Import for navigation

const categories = [
  {
    icon: <Calendar className="w-8 h-8 text-blue-500" />,
    title: "Hosting Hackathons",
    description: "Learn how to create, manage, and publish hackathons.",
    link: "/hackathons",
  },
  {
    icon: <FileText className="w-8 h-8 text-green-500" />,
    title: "Project Submission",
    description: "Step-by-step guide for submitting projects correctly.",
    link: "/submit-project",
  },
  {
    icon: <Search className="w-8 h-8 text-yellow-500" />,
    title: "Explore Projects",
    description: "Search, filter, and bookmark projects on the platform.",
    link: "/projects",
  },
  {
    icon: <Users className="w-8 h-8 text-purple-500" />,
    title: "Contributing",
    description: "Guides for contributors and GSOC participants.",
    link: "/contributorguide",
  },
  {
    icon: <Award className="w-8 h-8 text-red-500" />,
    title: "Leaderboard",
    description: "Understand points, ranks, and top contributors.",
    link: "/leaderBoard",
  },
  {
    icon: <Star className="w-8 h-8 text-pink-500" />,
    title: "Tips & Best Practices",
    description: "Maximize your visibility, submissions, and participation.",
    link: "/documentation",
  },
  {
    icon: <Calendar className="w-8 h-8 text-indigo-500" />,
    title: "Events",
    description: "Stay updated with upcoming hackathons and events.",
    link: "/events",
  },
  {
    icon: <FileText className="w-8 h-8 text-gray-600" />,
    title: "See on GitHub",
    description: "Browse our open-source repositories and contributions.",
    link: "https://github.com/your-repo", // 🔗 replace with actual repo URL
  },
  {
    icon: <Settings className="w-8 h-8 text-teal-500" />,
    title: "API Docs",
    description: "Explore our API documentation for developers.",
    link: "/api-docs",
  },
  {
    icon: <Users className="w-8 h-8 text-orange-500" />,
    title: "Contributors",
    description: "Meet the amazing contributors powering this project.",
    link: "/contributors",
  },
  {
    icon: <Calendar className="w-8 h-8 text-cyan-500" />,
    title: "Community Events",
    description: "Join upcoming community-driven meetups and activities.",
    link: "/communityEvent",
  },
  {
    icon: <Star className="w-8 h-8 text-rose-500" />,
    title: "Contact Us",
    description: "Reach out for support, feedback, or collaboration.",
    link: "/contact",
  },
];

const faqs = [
  {
    id: 1,
    category: "Hackathons",
    icon: <Calendar className="w-5 h-5" />,
    question: "How do I host a hackathon?",
    answer:
      "Go to the 'Host Hackathon' page, fill in the details including title, dates, description, prizes, and publish. Ensure all fields are correctly filled.",
  },
  {
    id: 2,
    category: "Project Submission",
    icon: <BookOpen  className="w-5 h-5" />,
    question: "How can I submit a project?",
    answer:
      "Navigate to 'Submit Project', fill in the required fields, upload your files, and submit before the deadline.",
  },
  {
    id: 3,
    category: "Leaderboard",
    icon: <Award className="w-5 h-5" />,
    question: "How are leaderboard points calculated?",
    answer:
      "Points are awarded based on hackathon wins, contributions, and project submissions. Leaderboard updates in real-time.",
  },
  {
    id: 4,
    category: "Contributing",
    icon: <Users className="w-5 h-5" />,
    question: "How can I contribute to GSSOC tasks?",
    answer:
      "Check the 'Contribute' page for open issues, fork the repository, make a PR, and follow contribution guidelines.",
  },
  {
    id: 5,
    category: "Explore Projects",
    icon: <Search className="w-5 h-5" />,
    question: "Can I explore projects without signing up?",
    answer:
      "Yes, projects are publicly viewable, but you need an account to submit or bookmark projects.",
  },
];

const HelpCenter = () => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);
   const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Hero Section */}
      <section className="text-center py-16 px-4">
        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Need Help with Hackathons, Projects, or Contributions?
        </motion.h1>
        <motion.p
          className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9 }}
        >
          Find step-by-step guides, FAQs, and tips to make the most of our
          platform.
        </motion.p>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold mb-8 text-center">
          Browse by Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat, idx) => (
            <motion.div key={idx} whileHover={{ scale: 1.05 }}>
              <Link
                to={cat.link}
                className="block bg-white dark:bg-gray-800 rounded-xl p-6 shadow hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="mb-4">{cat.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{cat.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {cat.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Community Links Section */}
      <section className="py-12 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Connect with the Community
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-12">
          Join discussions, meet contributors, and stay updated through our
          community platforms.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {[
            {
              title: "Discord",
              link: "#discord",
              icon: <FaDiscord className="w-8 h-8" />,
              color: "from-indigo-500 to-purple-500",
            },
            {
              title: "GitHub Discussions",
              link: "https://github.com/sandeepvashishtha/Eventra",
              icon: <FaGithub className="w-8 h-8" />,
              color: "from-gray-800 to-gray-600",
            },
            {
              title: "Twitter",
              link: "https://x.com/#",
              icon: <FaTwitter className="w-8 h-8" />,
              color: "from-blue-400 to-cyan-500",
            },
            {
              title: "Telegram",
              link: "https://t.me/eventra",
              icon: <FaTelegram className="w-8 h-8" />,
              color: "from-purple-500 to-pink-500",
            },
            {
              title: "YouTube",
              link: "#youtube",
              icon: <FaYoutube className="w-8 h-8" />,
              color: "from-red-500 to-orange-500",
            },
            {
              title: "LinkedIn",
              link: "https://www.linkedin.com/in/sandeepvashishtha/",
              icon: <FaLinkedin className="w-8 h-8" />,
              color: "from-sky-600 to-blue-700",
            },
          ].map((item, idx) => (
            <a
              key={idx}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col items-center text-center transition-transform transform hover:scale-105 hover:shadow-2xl"
            >
              <div
                className={`w-16 h-16 mb-4 flex items-center justify-center text-white rounded-full bg-gradient-to-br ${item.color} shadow-lg group-hover:rotate-12 transition-transform`}
              >
                {item.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2 group-hover:text-indigo-500 transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Click to visit and connect with other contributors and
                enthusiasts.
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* Tutorials / Guides Section */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold mb-8 text-center">
          Step-by-Step Guides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Hosting a Hackathon",
              icon: (
                <Calendar className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              ),
              link: "/guides/hosting",
            },
            {
              title: "Submitting a Project",
              icon: (
                <FileText className="w-12 h-12 text-green-500 mx-auto mb-4" />
              ),
              link: "/guides/submission",
            },
            {
              title: "Contributing to GSOC",
              icon: (
                <Users className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              ),
              link: "/guides/contributing",
            },
          ].map((guide, idx) => (
            <motion.a
              href={guide.link}
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg p-6 flex flex-col items-center justify-center"
            >
              {guide.icon}
              <h3 className="font-semibold text-lg text-center">
                {guide.title}
              </h3>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Guidelines Section */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Platform Guidelines
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Follow these best practices to make the most of your experience and contribute effectively to the community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <CheckCircle className="w-6 h-6" />,
              title: "Check Hackathon Rules",
              description: "Always review the hackathon rules and requirements before submitting a project.",
              highlight: "rules",
              color: "from-blue-500 to-cyan-500",
              link: "/hackathons",
            },
            {
              icon: <FileText className="w-6 h-6" />,
              title: "Document Your Work",
              description: "Use descriptive titles and provide proper documentation for all your submissions.",
              highlight: "documentation",
              color: "from-green-500 to-emerald-500",
              link: "/documentation",
            },
            {
              icon: <GitPullRequest className="w-6 h-6" />,
              title: "Follow Contribution Guidelines",
              description: "Adhere to contribution guidelines for GSOC and other open-source tasks.",
              highlight: "guidelines",
              color: "from-purple-500 to-pink-500",
              link: "/contributorguide",
            },
            {
              icon: <Clock className="w-6 h-6" />,
              title: "Respect Deadlines",
              description: "Submit your projects and contributions before the specified deadlines to ensure participation.",
              highlight: "deadlines",
              color: "from-orange-500 to-red-500",
            },
            {
              icon: <FileSearch className="w-6 h-6" />,
              title: "Avoid Duplicates",
              description: "Explore existing projects before submitting to ensure your work is unique and adds value.",
              highlight: "duplicates",
              color: "from-yellow-500 to-orange-400",
              link: "/projects",
            },
            {
              icon: <HelpCircle className="w-6 h-6" />,
              title: "Get Support",
              description: "Reach out to our support team if you encounter any issues, errors, or have questions.",
              highlight: "support",
              color: "from-indigo-500 to-purple-500",
              link: "/contact",
            },
          ].map((guideline, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
            >
              <div className={`absolute top-0 left-0 w-full h-1 rounded-t-2xl bg-gradient-to-r ${guideline.color}`}></div>
              
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${guideline.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {guideline.icon}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {guideline.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {guideline.description}
                  </p>
                  
                  {guideline.link && (
                    <Link
                      to={guideline.link}
                      className="inline-flex items-center mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    >
                      Learn more
                      <AlertCircle className="w-4 h-4 ml-1" />
                    </Link>
                  )}
                </div>
              </div>
              
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className={`text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r ${guideline.color}`}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Everything you need to know about using our platform. Can't find what you're looking for? 
            Reach out to our community!
          </p>
          
          <div className="space-y-6">
            {faqs.map((faq) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`rounded-2xl shadow-lg transition-shadow duration-300 border 
                ${expandedFAQ === faq.id 
                  ? "border-blue-500 ring-2 ring-blue-300" 
                  : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:shadow-xl"}`}
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full p-6 text-left rounded-2xl transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
                          <span className="text-indigo-600 dark:text-indigo-400">
                            {faq.icon}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                          {faq.category}
                        </span>
                        <h3 className="text-md md:text-lg font-semibold text-gray-900 dark:text-white mt-1">
                          {faq.question}
                        </h3>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      {expandedFAQ === faq.id ? (
                        <FiChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <FiChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>
                
                {expandedFAQ === faq.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="px-6 pb-6"
                  >
                    <div className="ml-16 pt-4 border-t border-gray-300 dark:border-gray-700">
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern CTA Section */}
      <section className="relative py-16 px-8 m-8 rounded-3xl bg-gradient-to-tr from-black via-purple-800 via-indigo-900 to-pink-900 text-white shadow-xl overflow-hidden">
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0) 100%)",
          }}
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Centered Content */}
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Need Help or Have Feedback?
          </motion.h2>

          <motion.p
            className="text-base md:text-lg mb-10 text-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            Reach out to our support team or share your thoughts to improve the
            platform.
          </motion.p>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-500 font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-indigo-400/50 transition-transform duration-300"
              >
                <Mail size={20} /> Contact Us
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/feedback"
                className="inline-flex items-center justify-center gap-2 bg-white text-indigo-700 dark:bg-gray-200 dark:text-indigo-800 font-semibold px-8 py-4 rounded-full shadow-lg hover:scale-105 transition-transform duration-300"
              >
                <MessageCircle size={20} /> Give Feedback
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpCenter;
