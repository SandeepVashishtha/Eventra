import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCopy,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiInfo,
  FiFile,
  FiLock,
  FiCode,
  FiFileText,
  FiPackage,
  FiCheckCircle,
  FiServer,
  FiClipboard,
  FiGitBranch,
  FiGithub,
  FiArrowRightCircle,
} from "react-icons/fi";
import {
  HelpCircle,
  GitBranch,
  GitPullRequest,
  FileText as LucideFileText, // Renamed to avoid conflict
  Users,
} from "lucide-react";

const ContributorGuide = () => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const commands = [
    {
      id: "clone",
      title: "Clone Repository",
      cmd: "git clone https://github.com/sandeepvashishtha/Eventra.git",
    },
    {
      id: "branch",
      title: "Create Branch",
      cmd: "git checkout -b feature/your-feature",
    },
    { id: "add", title: "Stage Changes", cmd: "git add ." },
    {
      id: "commit",
      title: "Commit Changes",
      cmd: 'git commit -m "Describe your changes"',
    },
    {
      id: "push",
      title: "Push Branch",
      cmd: "git push origin feature/your-feature",
    },
  ];

  const faqs = [
    {
      icon: <GitBranch className="w-5 h-5 text-blue-500" />,
      question: "What is a fork?",
      answer:
        "A fork is your personal copy of the repository where you can safely make changes without affecting the original project.",
    },
    {
      icon: <GitPullRequest className="w-5 h-5 text-green-500" />,
      question: "What is a pull request?",
      answer:
        "A pull request is a way to propose your changes and request that they be reviewed and merged into the main project.",
    },
    {
      icon: <LucideFileText className="w-5 h-5 text-purple-500" />,
      question: "How should I name branches?",
      answer:
        "Use descriptive names like 'feature/login' or 'fix/header-bug' to indicate the purpose of the branch clearly.",
    },
    {
      icon: <Users className="w-5 h-5 text-pink-500" />,
      question: "Can I contribute without coding?",
      answer:
        "Yes! Contributions can include improving documentation, design, accessibility, testing, or community support.",
    },
    {
      icon: <HelpCircle className="w-5 h-5 text-yellow-500" />,
      question: "Where can I ask for help?",
      answer:
        "You can open a discussion in the repository, raise an issue, or join our community chat to get assistance.",
    },
    {
      icon: <HelpCircle className="w-5 h-5 text-orange-500" />,
      question: "Do I need prior open-source experience?",
      answer:
        "Not at all! Beginners are welcome — open-source is a great way to learn and grow your skills.",
    },
    {
      icon: <LucideFileText className="w-5 h-5 text-indigo-500" />,
      question: "How do I report a bug?",
      answer:
        "You can report bugs by creating a new issue in the repository. Be sure to include steps to reproduce the problem and screenshots if possible.",
    },
    {
      icon: <Users className="w-5 h-5 text-red-500" />,
      question: "How do I find beginner-friendly issues?",
      answer:
        "Look for labels like 'good first issue' or 'beginner-friendly' in the issues tab of the repository.",
    },
    {
      icon: <GitBranch className="w-5 h-5 text-teal-500" />,
      question: "Should I work on an issue without assignment?",
      answer:
        "It's best to comment on the issue and ask to be assigned before starting. This avoids duplicate efforts.",
    },
    {
      icon: <GitPullRequest className="w-5 h-5 text-cyan-500" />,
      question: "What happens after I open a pull request?",
      answer:
        "Your pull request will be reviewed by maintainers or contributors. They may suggest changes before it gets merged into the main branch.",
    },
  ];

  const contributionTypes = [
    {
      title: "Bug Fixes",
      description:
        "Identify bugs from issues tagged 'bug' and submit a PR with a clear explanation and test cases if possible.",
      example: "Example: Fix header alignment issue in responsive view.",
    },
    {
      title: "Features",
      description:
        "Add a new feature or improve an existing one. Make sure to follow existing patterns and code structure.",
      example: "Example: Add dark mode toggle button with smooth animation.",
    },
    {
      title: "Documentation",
      description:
        "Improve README, add examples, or clarify instructions for contributors.",
      example: "Example: Add step-by-step setup instructions with screenshots.",
    },
    {
      title: "Testing",
      description:
        "Write unit or integration tests for existing code to ensure stability and prevent regressions.",
      example: "Example: Add Jest tests for new login form components.",
    },
    {
      title: "Design & UI",
      description:
        "Improve the user interface, accessibility, or design consistency across the project.",
      example:
        "Example: Update button styles for better contrast and hover effects.",
    },
    {
      title: "Code Refactoring",
      description:
        "Improve existing code structure without changing functionality to make it cleaner, readable, and maintainable.",
      example:
        "Example: Simplify a complex function or restructure components into smaller reusable pieces.",
    },
  ];

  const copyCommand = (cmd, id) => {
    navigator.clipboard.writeText(cmd);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen px-4 sm:px-6 lg:px-12 py-12 max-w-6xl mx-auto space-y-16">
      {/* Page Heading */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-indigo-900 dark:text-gray-100 mb-4">
          Welcome to Eventra Contributions!
        </h1>
        <p className="text-gray-700 dark:text-gray-300 text-base max-w-3xl mx-auto">
          We're excited to have you join the Eventra community! This guide
          provides detailed, actionable instructions, examples, and interactive
          tips to help first-time contributors succeed.
        </p>
      </div>

      {/* Step-by-Step Contribution Section */}
      <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-xl shadow-md">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 mt-8 text-center">
          Step-by-Step Contribution Journey
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contributionTypes.map((type, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="border-l-4 border-indigo-500 dark:border-indigo-400 p-4 bg-gray-200 dark:bg-gray-800 rounded shadow-sm"
            >
              <div className="flex items-center mb-2">
                <FiInfo className="text-indigo-500 dark:text-indigo-400 mr-2 flex-shrink-0" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {type.title}
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                {type.description}
              </p>
              <p className="text-gray-600 dark:text-gray-400 italic">
                💡 {type.example}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Important Files Section */}
      <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-xl shadow-md">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center flex items-center justify-center gap-3">
          <FiFile className="text-indigo-500 dark:text-indigo-400" size={32} />
          Important Files in This Project
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
            <thead className="bg-indigo-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  File
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Purpose
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 dark:divide-gray-600">
              <tr className="hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-4 sm:px-6 py-4 flex items-center gap-2 font-mono text-indigo-500 dark:text-indigo-400">
                  <FiLock /> .env
                </td>
                <td className="px-4 sm:px-6 py-4 text-gray-700 dark:text-gray-300">
                  Stores environment variables like API keys. Do not commit this
                  file.
                </td>
              </tr>
              <tr className="hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-4 sm:px-6 py-4 flex items-center gap-2 font-mono text-indigo-500">
                  <FiLock /> .env.example
                </td>
                <td className="px-4 sm:px-6 py-4 text-gray-700 dark:text-gray-300">
                  Example environment file. Use it as a template to create your
                  own .env file.
                </td>
              </tr>
              <tr className="hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-4 sm:px-6 py-4 flex items-center gap-2 font-mono text-indigo-500">
                  <FiCode /> .gitignore
                </td>
                <td className="px-4 sm:px-6 py-4 text-gray-700 dark:text-gray-300">
                  Lists files/folders to ignore in Git commits, like
                  node_modules or .env.
                </td>
              </tr>
              <tr className="hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-4 sm:px-6 py-4 flex items-center gap-2 font-mono text-indigo-500">
                  <FiFileText /> LICENSE
                </td>
                <td className="px-4 sm:px-6 py-4 text-gray-700 dark:text-gray-300">
                  Contains the license details for the project.
                </td>
              </tr>
              <tr className="hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-4 sm:px-6 py-4 flex items-center gap-2 font-mono text-indigo-500">
                  <FiClipboard /> README.md
                </td>
                <td className="px-4 sm:px-6 py-4 text-gray-700 dark:text-gray-300">
                  Main documentation for the project. Explains setup, usage, and
                  contribution guide.
                </td>
              </tr>
              <tr className="hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-4 sm:px-6 py-4 flex items-center gap-2 font-mono text-indigo-500">
                  <FiPackage /> package.json
                </td>
                <td className="px-4 sm:px-6 py-4 text-gray-700 dark:text-gray-300">
                  Contains project metadata, scripts, and dependencies.
                </td>
              </tr>
              <tr className="hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-4 sm:px-6 py-4 flex items-center gap-2 font-mono text-indigo-500">
                  <FiCheckCircle /> package-lock.json
                </td>
                <td className="px-4 sm:px-6 py-4 text-gray-700 dark:text-gray-300">
                  Locks dependency versions for consistent installs across
                  environments.
                </td>
              </tr>
              <tr className="hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-4 sm:px-6 py-4 flex items-center gap-2 font-mono text-indigo-500">
                  <FiServer /> vercel.json
                </td>
                <td className="px-4 sm:px-6 py-4 text-gray-700 dark:text-gray-300">
                  Configuration file for deployment on Vercel.
                </td>
              </tr>
              <tr className="hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-4 sm:px-6 py-4 flex items-center gap-2 font-mono text-indigo-500">
                  <FiFileText /> CODE_OF_CONDUCT.md
                </td>
                <td className="px-4 sm:px-6 py-4 text-gray-700 dark:text-gray-300">
                  Outlines expected behavior and guidelines for contributors.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue & PR Workflow Section */}
      <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-xl shadow-md mt-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-10 text-center flex items-center justify-center gap-3">
          <FiGitBranch
            className="text-indigo-500 dark:text-indigo-400"
            size={32}
          />
          Issue & PR Workflow
        </h2>
        <div className="space-y-8">
          {[
            {
              step: 1,
              icon: <FiFileText />,
              title: "Pick an Issue",
              description: (
                <>
                  Browse issues labeled{" "}
                  <span className="font-mono text-indigo-500 bg-indigo-100 dark:bg-indigo-900/50 px-1 rounded">
                    good-first-issue
                  </span>{" "}
                  or{" "}
                  <span className="font-mono text-indigo-500 bg-indigo-100 dark:bg-indigo-900/50 px-1 rounded">
                    bug
                  </span>
                  . Choose one you can work on.
                </>
              ),
            },
            {
              step: 2,
              icon: <FiGitBranch />,
              title: "Create a Branch",
              description: (
                <>
                  Use descriptive branch names like{" "}
                  <span className="font-mono text-indigo-500 bg-indigo-100 dark:bg-indigo-900/50 px-1 rounded">
                    feature/add-login
                  </span>{" "}
                  or{" "}
                  <span className="font-mono text-indigo-500 bg-indigo-100 dark:bg-indigo-900/50 px-1 rounded">
                    fix/navbar-bug
                  </span>
                  .
                </>
              ),
            },
            {
              step: 3,
              icon: <FiCheckCircle />,
              title: "Make Changes & Commit",
              description: (
                <>
                  Make your code changes locally. Commit with clear messages
                  like{" "}
                  <span className="font-mono text-indigo-500 bg-indigo-100 dark:bg-indigo-900/50 px-1 rounded">
                    Add login form component
                  </span>
                  .
                </>
              ),
            },
            {
              step: 4,
              icon: <FiArrowRightCircle />,
              title: "Open a Pull Request",
              description: (
                <>
                  Push your branch to GitHub and open a PR. Follow the template
                  below:
                </>
              ),
              code: `### Description
Explain what your PR does.

### Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update

### Checklist
- [ ] I have tested my changes
- [ ] I have updated documentation if needed

### Related Issue
Closes #<issue_number>`,
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col md:flex-row items-start gap-4 p-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-500 text-white font-bold text-lg">
                  {item.step}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
                  {item.icon} {item.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  {item.description}
                </p>
                {item.code && (
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm text-gray-800 dark:text-gray-200">
                    <pre className="whitespace-pre-wrap break-all">{item.code}</pre>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6">
          <div className="flex flex-col items-center gap-2">
            <FiFileText
              className="text-indigo-500 dark:text-indigo-400"
              size={36}
            />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">
              Pick Issue
            </span>
          </div>

          <FiChevronDown className="text-indigo-300 dark:text-gray-600 text-2xl md:hidden" />
          <div className="text-indigo-300 dark:text-gray-600 text-2xl hidden md:block">
            →
          </div>

          <div className="flex flex-col items-center gap-2">
            <FiGitBranch
              className="text-indigo-500 dark:text-indigo-400"
              size={36}
            />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">
              Create Branch
            </span>
          </div>

          <FiChevronDown className="text-indigo-300 dark:text-gray-600 text-2xl md:hidden" />
          <div className="text-indigo-300 dark:text-gray-600 text-2xl hidden md:block">
            →
          </div>

          <div className="flex flex-col items-center gap-2">
            <FiCheckCircle
              className="text-indigo-500 dark:text-indigo-400"
              size={36}
            />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">
              Commit Changes
            </span>
          </div>

          <FiChevronDown className="text-indigo-300 dark:text-gray-600 text-2xl md:hidden" />
          <div className="text-indigo-300 dark:text-gray-600 text-2xl hidden md:block">
            →
          </div>

          <div className="flex flex-col items-center gap-2">
            <FiArrowRightCircle
              className="text-indigo-500 dark:text-indigo-400"
              size={36}
            />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">
              Open PR
            </span>
          </div>
        </div>
      </div>

      {/* Git Commands Section */}
      <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-xl shadow-md">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Essential Git Commands
        </h2>
        <div className="space-y-4">
          {commands.map((c) => (
            <div
              key={c.id}
              className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-gray-100 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex-grow">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {c.title}
                </h3>
                {/* UPDATED: Added 'inline-block' to shrink background to text size */}
                <pre className="inline-block bg-gray-200 dark:bg-gray-900/50 p-2 rounded mt-1 text-sm text-blue-600 dark:text-blue-400 whitespace-pre-wrap break-all">
                  {c.cmd}
                </pre>
              </div>
              <button
                onClick={() => copyCommand(c.cmd, c.id)}
                className="flex items-center justify-center sm:justify-start gap-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition self-start sm:self-center flex-shrink-0"
              >
                {copied === c.id ? <FiCheck /> : <FiCopy />}
                <span>{copied === c.id ? "Copied" : "Copy"}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <section className="bg-indigo-50 dark:bg-gray-900 p-6 md:p-8 rounded-2xl shadow-lg">
        <motion.h2
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative text-3xl md:text-4xl font-extrabold tracking-tight 
           text-transparent bg-clip-text 
           bg-gradient-to-r from-blue-700 via-purple-700 to-cyan-400 
           dark:from-blue-400 dark:via-purple-400 dark:to-cyan-400 
           mb-10 text-center"
        >
          Frequently Asked Questions
          <motion.span
            initial={{ width: 0 }}
            animate={{ width: "60%" }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute left-1/2 -translate-x-1/2 -bottom-2 h-1 rounded-full 
             bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          />
        </motion.h2>

        <div className="divide-y divide-gray-400 dark:divide-gray-700">
          {faqs.map((faq, index) => {
            const isOpen = expandedFAQ === index;
            return (
              <div key={index} className="py-3">
                <button
                  onClick={() => setExpandedFAQ(isOpen ? null : index)}
                  className="w-full flex justify-between items-center px-2 py-3 text-left group"
                >
                  <div className="flex items-center gap-3">
                    {faq.icon}
                    <span className="text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-500 transition">
                      {faq.question}
                    </span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400">
                    {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                  </span>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="pl-9 pr-2 pb-3 text-gray-700 dark:text-gray-300 leading-relaxed"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action */}
      <div className="relative overflow-hidden rounded-xl p-10 shadow-xl text-center text-white bg-gradient-to-r from-black via-indigo-600 via-purple-600 to-pink-900">
        <FiGithub className="absolute top-5 left-5 text-white/10 text-6xl rotate-12" />
        <FiGithub className="absolute bottom-5 right-5 text-white/10 text-6xl -rotate-12" />

        <h2 className="text-2xl md:text-3xl font-bold mb-3 flex items-center justify-center gap-2">
          <FiArrowRightCircle /> Ready to Contribute?
        </h2>
        <p className="mb-6 text-white/90 text-lg">
          Take the first step and submit your pull request today!
        </p>
        <motion.a
          href="https://github.com/SandeepVashishtha/Eventra"
          target="_blank"
          rel="noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-300 to-purple-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300"
        >
          <FiGithub className="text-lg" /> Go to GitHub
        </motion.a>
      </div>
    </div>
  );
};

export default ContributorGuide;