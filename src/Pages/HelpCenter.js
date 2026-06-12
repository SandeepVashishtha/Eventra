import {
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Github,
  Twitter,
  Youtube,
  Linkedin,
  Send,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useReducedMotion from "../hooks/useReducedMotion.js";
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
  CheckCircle,
  Clock,
  AlertCircle,
  FileSearch,
  GitPullRequest,
  HelpCircle,
  CalendarClock,
  FileCode2,
  CalendarDays,
  GitMerge,
} from "lucide-react";
// ✅ Community icons
import { Link } from "react-router-dom"; // ✅ Import for navigation
import { useTranslation } from "react-i18next";

const HelpCenter = () => {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  useDocumentTitle(t("helpCenter.pageTitle"));
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const controls = useAnimation();

  const categories = [
    {
      icon: <Calendar className="h-8 w-8 text-blue-500" />,
      title: t("helpCenter.categories.hostingHackathons.title"),
      description: t("helpCenter.categories.hostingHackathons.description"),
      link: "/hackathons",
    },
    {
      icon: <FileText className="h-8 w-8 text-green-500" />,
      title: t("helpCenter.categories.projectSubmission.title"),
      description: t("helpCenter.categories.projectSubmission.description"),
      link: "/submit-project",
    },
    {
      icon: <Search className="h-8 w-8 text-yellow-500" />,
      title: t("helpCenter.categories.exploreProjects.title"),
      description: t("helpCenter.categories.exploreProjects.description"),
      link: "/projects",
    },
    {
      icon: <Users className="h-8 w-8 text-purple-500" />,
      title: t("helpCenter.categories.contributing.title"),
      description: t("helpCenter.categories.contributing.description"),
      link: "/contributorguide",
    },
    {
      icon: <Award className="h-8 w-8 text-red-500" />,
      title: t("helpCenter.categories.leaderboard.title"),
      description: t("helpCenter.categories.leaderboard.description"),
      link: "/leaderboard",
    },
    {
      icon: <Star className="h-8 w-8 text-pink-500" />,
      title: t("helpCenter.categories.tipsBestPractices.title"),
      description: t("helpCenter.categories.tipsBestPractices.description"),
      link: "/documentation",
    },
    {
      icon: <Calendar className="h-8 w-8 text-indigo-500" />,
      title: t("helpCenter.categories.events.title"),
      description: t("helpCenter.categories.events.description"),
      link: "/events",
    },
    {
      icon: <FileText className="h-8 w-8 text-gray-600" />,
      title: t("helpCenter.categories.seeOnGitHub.title"),
      description: t("helpCenter.categories.seeOnGitHub.description"),
      link: "https://github.com/your-repo",
    },
    {
      icon: <Settings className="h-8 w-8 text-teal-500" />,
      title: t("helpCenter.categories.apiDocs.title"),
      description: t("helpCenter.categories.apiDocs.description"),
      link: "/api-docs",
    },
    {
      icon: <Users className="h-8 w-8 text-orange-500" />,
      title: t("helpCenter.categories.contributors.title"),
      description: t("helpCenter.categories.contributors.description"),
      link: "/contributors",
    },
    {
      icon: <Calendar className="h-8 w-8 text-cyan-500" />,
      title: t("helpCenter.categories.communityEvents.title"),
      description: t("helpCenter.categories.communityEvents.description"),
      link: "/community-event",
    },
    {
      icon: <Star className="h-8 w-8 text-rose-500" />,
      title: t("helpCenter.categories.contactUs.title"),
      description: t("helpCenter.categories.contactUs.description"),
      link: "/contact",
    },
  ];

  const faqs = [
    {
      id: 1,
      category: t("helpCenter.faqs.1.category"),
      icon: <Calendar className="h-5 w-5" />,
      question: t("helpCenter.faqs.1.question"),
      answer: t("helpCenter.faqs.1.answer"),
    },
    {
      id: 2,
      category: t("helpCenter.faqs.2.category"),
      icon: <BookOpen className="h-5 w-5" />,
      question: t("helpCenter.faqs.2.question"),
      answer: t("helpCenter.faqs.2.answer"),
    },
    {
      id: 3,
      category: t("helpCenter.faqs.3.category"),
      icon: <Award className="h-5 w-5" />,
      question: t("helpCenter.faqs.3.question"),
      answer: t("helpCenter.faqs.3.answer"),
    },
    {
      id: 4,
      category: t("helpCenter.faqs.4.category"),
      icon: <Users className="h-5 w-5" />,
      question: t("helpCenter.faqs.4.question"),
      answer: t("helpCenter.faqs.4.answer"),
    },
    {
      id: 5,
      category: t("helpCenter.faqs.5.category"),
      icon: <Search className="h-5 w-5" />,
      question: t("helpCenter.faqs.5.question"),
      answer: t("helpCenter.faqs.5.answer"),
    },
  ];

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };
  useEffect(() => {
    controls.start("show");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [controls]);
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Hero Section */}
      <section className="px-4 py-16 text-center">
        <motion.h1
          className="mb-4 text-4xl font-bold md:text-5xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.7 }}
        >
          {t("helpCenter.heroHeading")}
        </motion.h1>
        <motion.p
          className="mx-auto mt-10 max-w-xl text-gray-600 dark:text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.9 }}
        >
          {t("helpCenter.heroSubtitle")}
        </motion.p>
      </section>

      {/* Categories Section */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-center text-3xl font-semibold">
          {t("helpCenter.categoriesHeading")}
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, idx) => (
            <motion.div key={idx} whileHover={{ scale: 1.05 }}>
              <Link
                to={cat.link}
                className="block cursor-pointer rounded-xl bg-white p-6 shadow transition-shadow hover:shadow-lg dark:bg-gray-800"
              >
                <div className="mb-4">{cat.icon}</div>
                <h3 className="mb-2 text-xl font-semibold">{cat.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{cat.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Community Links Section */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-8 text-center text-3xl font-bold">{t("helpCenter.communityHeading")}</h2>
        <p className="mb-12 text-center text-gray-600 dark:text-gray-300">
          {t("helpCenter.communitySubtitle")}
        </p>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          {[
            {
              title: "Discord",
              link: "#discord",
              icon: <MessageCircle className="h-8 w-8" />,
              color: "from-gray-700 to-black",
            },
            {
              title: "GitHub Discussions",
              link: "https://github.com/sandeepvashishtha/Eventra",
              icon: <Github className="h-8 w-8" />,
              color: "from-gray-800 to-gray-600",
            },
            {
              title: "Twitter",
              link: "https://x.com/#",
              icon: <Twitter className="h-8 w-8" />,
              color: "from-blue-400 to-cyan-500",
            },
            {
              title: "Telegram",
              link: "https://t.me/eventra",
              icon: <Send className="h-8 w-8" />,
              color: "from-gray-700 to-black",
            },
            {
              title: "YouTube",
              link: "#youtube",
              icon: <Youtube className="h-8 w-8" />,
              color: "from-red-500 to-orange-500",
            },
            {
              title: "LinkedIn",
              link: "https://www.linkedin.com/in/sandeepvashishtha/",
              icon: <Linkedin className="h-8 w-8" />,
              color: "from-sky-600 to-blue-700",
            },
          ].map((item, idx) => (
            <a
              key={idx}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex transform flex-col items-center rounded-2xl bg-white p-6 text-center shadow-lg transition-transform hover:scale-105 hover:shadow-2xl dark:bg-gray-800"
            >
              <div
                className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-white ${item.color} shadow-lg transition-transform group-hover:rotate-12`}
              >
                {item.icon}
              </div>
              <h3 className="mb-2 text-lg font-semibold transition-colors group-hover:text-indigo-500">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("helpCenter.communityVisitLink")}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* Tutorials / Guides Section */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-12 text-center">
          <motion.h2
            className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
          >
            {t("helpCenter.tutorialsHeading")}
          </motion.h2>
          <motion.p
            className="mx-auto max-w-2xl text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.8 }}
          >
            {t("helpCenter.tutorialsSubtitle")}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: t("helpCenter.tutorials.hostingHackathon.title"),
              description: t("helpCenter.tutorials.hostingHackathon.description"),
              icon: <CalendarDays className="h-8 w-8" />,
              link: "/host-hackathon",
              gradient: "from-blue-500 via-blue-600 to-indigo-600",
              difficulty: t("helpCenter.difficultyBeginner"),
              time: "10 min",
              step: "01",
            },
            {
              title: t("helpCenter.tutorials.submittingProject.title"),
              description: t("helpCenter.tutorials.submittingProject.description"),
              icon: <FileCode2 className="h-8 w-8" />,
              link: "/submit-project",
              gradient: "from-green-500 via-emerald-600 to-teal-600",
              difficulty: t("helpCenter.difficultyBeginner"),
              time: "8 min",
              step: "02",
            },
            {
              title: t("helpCenter.tutorials.creatingEvent.title"),
              description: t("helpCenter.tutorials.creatingEvent.description"),
              icon: <CalendarClock className="h-8 w-8" />,
              link: "/create-event",
              gradient: "from-gray-700 via-gray-800 to-black",
              difficulty: t("helpCenter.difficultyBeginner"),
              time: "12 min",
              step: "03",
            },
            {
              title: t("helpCenter.tutorials.contributingGsoc.title"),
              description: t("helpCenter.tutorials.contributingGsoc.description"),
              icon: <GitMerge className="h-8 w-8" />,
              link: "/contributorguide",
              gradient: "from-yellow-500 via-orange-500 to-red-500",
              difficulty: t("helpCenter.difficultyIntermediate"),
              time: "15 min",
              step: "04",
            },
          ].map((guide, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              <Link
                to={guide.link}
                className="block h-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800"
              >
                {/* Gradient Header */}
                <div className={`h-3 bg-gradient-to-r ${guide.gradient}`}></div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Step Number Badge */}
                  <div className="absolute top-6 right-6 opacity-20 transition-opacity duration-300 group-hover:opacity-40">
                    <span className="text-6xl font-black text-gray-300 dark:text-gray-600">
                      {guide.step}
                    </span>
                  </div>

                  {/* Icon Container */}
                  <div
                    className={`relative z-10 mb-4 h-16 w-16 rounded-xl bg-gradient-to-br ${guide.gradient} flex items-center justify-center text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    {guide.icon}
                  </div>

                  {/* Title */}
                  <h3 className="mb-3 text-xl font-bold text-gray-900 transition-all duration-300 dark:text-white">
                    {guide.title}
                  </h3>

                  {/* Description */}
                  <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    {guide.description}
                  </p>

                  {/* Meta Information */}
                  <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                      <span
                        className={`rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold ${guide.gradient} text-white`}
                      >
                        {guide.difficulty}
                      </span>
                      <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="mr-1 h-3 w-3" />
                        {guide.time}
                      </span>
                    </div>
                    <div className="text-indigo-600 transition-transform duration-300 group-hover:translate-x-2 dark:text-indigo-400">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 ${guide.gradient} pointer-events-none transition-opacity duration-300`}
                ></div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Guidelines Section */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            {t("helpCenter.guidelinesHeading")}
          </h2>
          <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-300">
            {t("helpCenter.guidelinesSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: <CheckCircle className="h-6 w-6" />,
              title: t("helpCenter.guidelines.checkHackathonRules.title"),
              description: t("helpCenter.guidelines.checkHackathonRules.description"),
              highlight: "rules",
              color: "from-blue-500 to-cyan-500",
              link: "/hackathons",
            },
            {
              icon: <FileText className="h-6 w-6" />,
              title: t("helpCenter.guidelines.documentYourWork.title"),
              description: t("helpCenter.guidelines.documentYourWork.description"),
              highlight: "documentation",
              color: "from-green-500 to-emerald-500",
              link: "/documentation",
            },
            {
              icon: <GitPullRequest className="h-6 w-6" />,
              title: t("helpCenter.guidelines.followContributionGuidelines.title"),
              description: t("helpCenter.guidelines.followContributionGuidelines.description"),
              highlight: "guidelines",
              color: "from-gray-700 to-black",
              link: "/contributorguide",
            },
            {
              icon: <Clock className="h-6 w-6" />,
              title: t("helpCenter.guidelines.respectDeadlines.title"),
              description: t("helpCenter.guidelines.respectDeadlines.description"),
              highlight: "deadlines",
              color: "from-orange-500 to-red-500",
            },
            {
              icon: <FileSearch className="h-6 w-6" />,
              title: t("helpCenter.guidelines.avoidDuplicates.title"),
              description: t("helpCenter.guidelines.avoidDuplicates.description"),
              highlight: "duplicates",
              color: "from-yellow-500 to-orange-400",
              link: "/projects",
            },
            {
              icon: <HelpCircle className="h-6 w-6" />,
              title: t("helpCenter.guidelines.getSupport.title"),
              description: t("helpCenter.guidelines.getSupport.description"),
              highlight: "support",
              color: "from-gray-700 to-black",
              link: "/contact",
            },
          ].map((guideline, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.4, delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800"
            >
              <div
                className={`absolute top-0 left-0 h-1 w-full rounded-t-2xl bg-gradient-to-r ${guideline.color}`}
              ></div>

              <div className="flex items-start space-x-4">
                <div
                  className={`h-12 w-12 flex-shrink-0 rounded-xl bg-gradient-to-br ${guideline.color} flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
                >
                  {guideline.icon}
                </div>

                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                    {guideline.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    {guideline.description}
                  </p>

                  {guideline.link && (
                    <Link
                      to={guideline.link}
                      className="mt-3 inline-flex items-center text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      {t("helpCenter.guidelinesLearnMore")}
                      <AlertCircle className="ml-1 h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>

              <div className="absolute right-2 bottom-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="text-xs font-bold text-black">
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-4 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-center text-3xl font-bold text-gray-900 dark:text-white">
            {t("helpCenter.faqHeading")}
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-gray-600 dark:text-gray-300">
            {t("helpCenter.faqSubtitle")}
          </p>

          <div className="space-y-6">
            {faqs.map((faq) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
                className={`rounded-2xl border shadow-lg transition-shadow duration-300 ${
                  expandedFAQ === faq.id
                    ? "border-blue-500 ring-2 ring-blue-300"
                    : "border-gray-100 bg-white hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
                }`}
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full rounded-2xl p-6 text-left transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/50">
                          <span className="text-indigo-600 dark:text-indigo-400">{faq.icon}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-medium tracking-wide text-indigo-600 uppercase dark:text-indigo-400">
                          {faq.category}
                        </span>
                        <h3 className="text-md mt-1 font-semibold text-gray-900 md:text-lg dark:text-white">
                          {faq.question}
                        </h3>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      {expandedFAQ === faq.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>

                {expandedFAQ === faq.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: "easeInOut" }}
                    className="px-6 pb-6"
                  >
                    <div className="ml-16 border-t border-gray-300 pt-4 dark:border-gray-700">
                      <p className="leading-relaxed text-gray-600 dark:text-gray-300">
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
      <section className="relative m-8 overflow-hidden rounded-3xl bg-black px-8 py-16 text-white shadow-xl">
        <motion.div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0) 100%)",
          }}
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: prefersReducedMotion ? 0 : 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Centered Content */}
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <motion.h2
            className="mb-4 text-4xl font-bold md:text-5xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
          >
            {t("helpCenter.ctaHeading")}
          </motion.h2>

          <motion.p
            className="mb-10 text-base text-gray-200 md:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.8 }}
          >
            {t("helpCenter.ctaSubtitle")}
          </motion.p>

          {/* Buttons */}
          <div className="flex flex-col justify-center gap-4 md:flex-row">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-black shadow-lg transition-transform duration-300 hover:bg-gray-100"
              >
                <Mail size={20} /> {t("helpCenter.ctaContactUs")}
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/feedback"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-black shadow-lg transition-transform duration-300 hover:scale-105 dark:bg-gray-200 dark:text-black"
              >
                <MessageCircle size={20} /> {t("helpCenter.ctaGiveFeedback")}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpCenter;
