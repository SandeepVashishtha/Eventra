import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Check,
  ChevronDown,
  Info,
  File,
  Lock,
  Code2,
  FileText,
  Package,
  CheckCircle,
  Server,
  Clipboard,
  GitBranch,
  Github,
  ArrowRightCircle,
  HelpCircle,
  GitPullRequest,
  Users,
  Sparkles,
  Trophy,
  Terminal,
  Zap,
  Target,
  Rocket,
} from "lucide-react";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import useDocumentTitle from "../../hooks/useDocumentTitle";

// Static data moved outside component to prevent re-creation on every render
const COMMANDS = [
  { id: "clone", title: "Clone Repository", cmd: "git clone https://github.com/sandeepvashishtha/Eventra.git" },
  { id: "branch", title: "Create Branch", cmd: "git checkout -b feature/your-feature" },
  { id: "add", title: "Stage Changes", cmd: "git add ." },
  { id: "commit", title: "Commit Changes", cmd: 'git commit -m "Describe your changes"' },
  { id: "push", title: "Push Branch", cmd: "git push origin feature/your-feature" },
];

const FAQS = [
  { icon: GitBranch, color: "text-sky-400", bg: "bg-sky-500/10", question: "What is a fork?", answer: "A fork is your personal copy of the repository where you can safely make changes without affecting the original project." },
  { icon: GitPullRequest, color: "text-emerald-400", bg: "bg-emerald-500/10", question: "What is a pull request?", answer: "A pull request is a way to propose your changes and request that they be reviewed and merged into the main project." },
  { icon: FileText, color: "text-violet-400", bg: "bg-violet-500/10", question: "How should I name branches?", answer: "Use descriptive names like 'feature/login' or 'fix/header-bug' to indicate the purpose of the branch clearly." },
  { icon: Users, color: "text-rose-400", bg: "bg-rose-500/10", question: "Can I contribute without coding?", answer: "Yes! Contributions can include improving documentation, design, accessibility, testing, or community support." },
  { icon: HelpCircle, color: "text-amber-400", bg: "bg-amber-500/10", question: "Where can I ask for help?", answer: "You can open a discussion in the repository, raise an issue, or join our community chat to get assistance." },
  { icon: HelpCircle, color: "text-orange-400", bg: "bg-orange-500/10", question: "Do I need prior open-source experience?", answer: "Not at all! Beginners are welcome — open-source is a great way to learn and grow your skills." },
  { icon: FileText, color: "text-sky-400", bg: "bg-sky-500/10", question: "How do I report a bug?", answer: "You can report bugs by creating a new issue in the repository. Be sure to include steps to reproduce the problem and screenshots if possible." },
  { icon: Users, color: "text-red-400", bg: "bg-red-500/10", question: "How do I find beginner-friendly issues?", answer: "Look for labels like 'good first issue' or 'beginner-friendly' in the issues tab of the repository." },
  { icon: GitBranch, color: "text-teal-400", bg: "bg-teal-500/10", question: "Should I work on an issue without assignment?", answer: "It's best to comment on the issue and ask to be assigned before starting. This avoids duplicate efforts." },
  { icon: GitPullRequest, color: "text-cyan-400", bg: "bg-cyan-500/10", question: "What happens after I open a pull request?", answer: "Your pull request will be reviewed by maintainers or contributors. They may suggest changes before it gets merged into the main branch." },
];

const CONTRIBUTION_TYPES = [
  { title: "Bug Fixes", icon: Target, gradient: "from-rose-500 to-pink-500", description: "Identify bugs from issues tagged 'bug' and submit a PR with a clear explanation and test cases if possible.", example: "Fix header alignment issue in responsive view." },
  { title: "Features", icon: Rocket, gradient: "from-blue-500 to-indigo-500", description: "Add a new feature or improve an existing one. Make sure to follow existing patterns and code structure.", example: "Add dark mode toggle button with smooth animation." },
  { title: "Documentation", icon: FileText, gradient: "from-emerald-500 to-teal-500", description: "Improve README, add examples, or clarify instructions for contributors.", example: "Add step-by-step setup instructions with screenshots." },
  { title: "Testing", icon: CheckCircle, gradient: "from-amber-500 to-orange-500", description: "Write unit or integration tests for existing code to ensure stability and prevent regressions.", example: "Add Jest tests for new login form components." },
  { title: "Design & UI", icon: Sparkles, gradient: "from-violet-500 to-purple-500", description: "Improve the user interface, accessibility, or design consistency across the project.", example: "Update button styles for better contrast and hover effects." },
  { title: "Code Refactoring", icon: Code2, gradient: "from-cyan-500 to-sky-500", description: "Improve existing code structure without changing functionality to make it cleaner, readable, and maintainable.", example: "Simplify a complex function or restructure components." },
];

const IMPORTANT_FILES = [
  { name: ".env", icon: Lock, color: "text-rose-400", bg: "bg-rose-500/10", purpose: "Stores environment variables like API keys. Do not commit this file." },
  { name: ".env.example", icon: Lock, color: "text-amber-400", bg: "bg-amber-500/10", purpose: "Example environment file. Use it as a template to create your own .env file." },
  { name: ".gitignore", icon: Code2, color: "text-sky-400", bg: "bg-sky-500/10", purpose: "Lists files/folders to ignore in Git commits, like node_modules or .env." },
  { name: "LICENSE", icon: FileText, color: "text-emerald-400", bg: "bg-emerald-500/10", purpose: "Contains the license details for the project." },
  { name: "README.md", icon: Clipboard, color: "text-violet-400", bg: "bg-violet-500/10", purpose: "Main documentation for the project. Explains setup, usage, and contribution guide." },
  { name: "package.json", icon: Package, color: "text-indigo-400", bg: "bg-indigo-500/10", purpose: "Contains project metadata, scripts, and dependencies." },
  { name: "package-lock.json", icon: CheckCircle, color: "text-teal-400", bg: "bg-teal-500/10", purpose: "Locks dependency versions for consistent installs across environments." },
  { name: "vercel.json", icon: Server, color: "text-cyan-400", bg: "bg-cyan-500/10", purpose: "Configuration file for deployment on Vercel." },
  { name: "CODE_OF_CONDUCT.md", icon: FileText, color: "text-pink-400", bg: "bg-pink-500/10", purpose: "Outlines expected behavior and guidelines for contributors." },
];

const WORKFLOW_STEPS = [
  { step: 1, icon: FileText, color: "from-sky-500 to-blue-500", title: "Pick an Issue", description: "Browse issues labeled 'good-first-issue' or 'bug'. Choose one you can work on." },
  { step: 2, icon: GitBranch, color: "from-emerald-500 to-teal-500", title: "Create a Branch", description: "Use descriptive branch names like 'feature/add-login' or 'fix/navbar-bug'." },
  { step: 3, icon: CheckCircle, color: "from-amber-500 to-orange-500", title: "Make Changes & Commit", description: "Make your code changes locally. Commit with clear messages like 'Add login form component'." },
  { step: 4, icon: ArrowRightCircle, color: "from-rose-500 to-pink-500", title: "Open a Pull Request", description: "Push your branch to GitHub and open a PR following the project template." },
];

// Reusable Terminal-style Command Block
const CommandBlock = ({ command, copied, onCopy }) => (
  <div className="group relative flex flex-col sm:flex-row sm:items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all">
    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-950/50 border-b sm:border-b-0 sm:border-r border-zinc-800">
      <div className="flex gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70"></div>
      </div>
      <span className="text-xs font-medium text-zinc-400 ml-2">{command.title}</span>
    </div>
    <div className="flex-1 flex items-center gap-3 px-4 py-3 font-mono text-sm">
      <span className="text-emerald-400 select-none">$</span>
      <code className="text-zinc-200 break-all flex-1">{command.cmd}</code>
    </div>
    <button
      onClick={() => onCopy(command.cmd, command.id)}
      className="flex items-center justify-center gap-1.5 px-4 py-3 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 hover:text-white text-xs font-medium transition-all border-l border-zinc-800 sm:border-l sm:border-t-0 border-t"
      aria-label={`Copy ${command.title} command`}
    >
      {copied === command.id ? (
        <>
          <Check size={14} className="text-emerald-400" />
          <span className="text-emerald-400">Copied</span>
        </>
      ) : (
        <>
          <Copy size={14} />
          <span>Copy</span>
        </>
      )}
    </button>
  </div>
);

const ContributorGuide = () => {
  const prefersReducedMotion = useReducedMotion();
  useDocumentTitle("Eventra | Contributor Guide");
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const copyCommand = async (cmd, id) => {
    try {
      if (navigator?.clipboard) {
        await navigator.clipboard.writeText(cmd);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = cmd;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(id);
      setTimeout(() => setCopied(""), 2000);
    } catch (err) {
      console.warn("Failed to copy command:", err);
    }
  };

  const duration = prefersReducedMotion ? 0 : 0.5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-blue-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-blue-950/20 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration }}
          className="text-center space-y-5"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-medium">
            <Sparkles size={14} />
            Open Source Contribution Guide
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Eventra
            </span>
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            We're excited to have you join the community! This guide provides detailed, 
            actionable instructions to help first-time contributors succeed.
          </p>
        </motion.div>

        {/* GAMIFICATION & SCORING SYSTEM */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 p-[1px]"
        >
          <div className="relative bg-zinc-950 rounded-3xl p-6 md:p-10 overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
            
            <div className="relative">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Trophy className="text-amber-400" size={28} />
                <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
                  Contribution Arena
                </h2>
              </div>
              <p className="text-zinc-400 text-center max-w-xl mx-auto mb-10">
                Every contribution earns you arena points, rank metrics, and elite profile achievements.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Point System */}
                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-5">
                    <Zap size={18} className="text-amber-400" />
                    Label-Based Scoring
                  </h3>
                  <ul className="space-y-3">
                    {[
                      { label: "Level 1 GSSoC PR", points: "3", color: "text-sky-400 bg-sky-500/10" },
                      { label: "Level 2 GSSoC PR", points: "7", color: "text-violet-400 bg-violet-500/10" },
                      { label: "Level 3 GSSoC PR", points: "10", color: "text-amber-400 bg-amber-500/10" },
                    ].map((item, i) => (
                      <li key={i} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                        <span className="text-sm text-zinc-300">{item.label}</span>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${item.color}`}>
                          +{item.points} pts
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 pt-5 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500 mb-3">🚀 Milestone Boosters</p>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                        <span className="text-xs text-emerald-300">5+ Merged PRs</span>
                        <span className="text-xs font-bold text-emerald-400">+5 Bonus</span>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
                        <span className="text-xs text-amber-300">10+ Merged PRs</span>
                        <span className="text-xs font-bold text-amber-400">+10 Bonus</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Achievement Badges */}
                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-5">
                    <Trophy size={18} className="text-amber-400" />
                    Elite Badges
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { title: "Grandmaster", sub: "Rank #1", emoji: "👑", gradient: "from-amber-500/20 to-orange-500/20 border-amber-500/30" },
                      { title: "Champion", sub: "Rank #2", emoji: "⭐", gradient: "from-zinc-500/20 to-slate-500/20 border-zinc-500/30" },
                      { title: "Elite", sub: "Rank #3", emoji: "🏅", gradient: "from-orange-500/20 to-red-500/20 border-orange-500/30" },
                      { title: "PR Machine", sub: "10+ PRs", emoji: "🔥", gradient: "from-indigo-500/20 to-violet-500/20 border-indigo-500/30" },
                    ].map((badge, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-xl bg-gradient-to-br ${badge.gradient} border text-center hover:scale-105 transition-transform`}
                      >
                        <div className="text-2xl mb-1">{badge.emoji}</div>
                        <div className="text-sm font-bold text-white">{badge.title}</div>
                        <div className="text-xs text-zinc-400 mt-0.5">{badge.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* STEP-BY-STEP CONTRIBUTION TYPES */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-3">
              Ways to Contribute
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Pick a path that matches your skills and interests
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CONTRIBUTION_TYPES.map((type, index) => {
              const Icon = type.icon;
              return (
                <motion.div
                  key={type.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration, delay: index * 0.05 }}
                  className="group relative bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-zinc-950/50 transition-all"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${type.gradient} mb-4 shadow-lg`}>
                    <Icon className="text-white" size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                    {type.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
                    {type.description}
                  </p>
                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">💡 Example:</span>{" "}
                      {type.example}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* IMPORTANT FILES - Modern Card Grid */}
        <section>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <File className="text-emerald-500" size={24} />
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white">
                Important Files
            </h2>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">
              Key files you'll interact with during development
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {IMPORTANT_FILES.map((file, index) => {
              const Icon = file.icon;
              return (
                <motion.div
                  key={file.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration, delay: index * 0.03 }}
                  className="group bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${file.bg} shrink-0`}>
                      <Icon size={18} className={file.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <code className="text-sm font-mono font-semibold text-zinc-900 dark:text-white break-all">
                        {file.name}
                      </code>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
                        {file.purpose}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ISSUE & PR WORKFLOW - Vertical Timeline */}
        <section>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <GitBranch className="text-violet-500" size={24} />
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white">
                Contribution Workflow
              </h2>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">
              Follow these steps to submit your first pull request
            </p>
          </div>

          <div className="relative">
            {/* Vertical connecting line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-sky-500/50 via-violet-500/50 to-rose-500/50 -translate-x-1/2 hidden sm:block"></div>

            <div className="space-y-8">
              {WORKFLOW_STEPS.map((item, idx) => {
                const Icon = item.icon;
                const isEven = idx % 2 === 0;
                return (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration, delay: idx * 0.1 }}
                    className="relative flex items-start gap-6 sm:gap-8"
                  >
                    {/* Timeline dot */}
                    <div className="relative z-10 shrink-0">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-zinc-950`}>
                        <span className="text-white font-bold text-lg">{item.step}</span>
                      </div>
                    </div>

                    {/* Content card */}
                    <div className="flex-1 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color}`}>
                          <Icon className="text-white" size={16} />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* PR Template */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration }}
            className="mt-10 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
          >
            <div className="flex items-center gap-2 px-5 py-3 bg-zinc-950/50 border-b border-zinc-800">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/70"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/70"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/70"></div>
              </div>
              <span className="text-xs font-medium text-zinc-400 ml-2">pull-request-template.md</span>
            </div>
            <pre className="p-5 text-sm text-zinc-300 font-mono overflow-x-auto leading-relaxed">
{`### Description
Explain what your PR does.

### Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update

### Checklist
- [ ] I have tested my changes
- [ ] I have updated documentation if needed

### Related Issue
Closes #<issue_number>`}
            </pre>
          </motion.div>
        </section>

        {/* GIT COMMANDS - Terminal Style */}
        <section>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <Terminal className="text-emerald-500" size={24} />
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white">
                Essential Git Commands
              </h2>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">
              Copy-paste these commands to get started quickly
            </p>
          </div>
          <div className="space-y-3">
            {COMMANDS.map((command) => (
              <CommandBlock
                key={command.id}
                command={command}
                copied={copied}
                onCopy={copyCommand}
              />
            ))}
          </div>
        </section>

        {/* FAQ SECTION - Polished Accordion */}
        <section className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <HelpCircle className="text-blue-500" size={24} />
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white">
                Frequently Asked Questions
              </h2>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">
              Quick answers to common contributor questions
            </p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {FAQS.map((faq, index) => {
              const isOpen = expandedFAQ === index;
              const Icon = faq.icon;
              return (
                <div
                  key={index}
                  className={`border rounded-xl transition-all ${
                    isOpen
                      ? "border-blue-500/30 bg-blue-500/5 dark:bg-blue-500/10"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <button
                    onClick={() => setExpandedFAQ(isOpen ? null : index)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <div className={`p-2 rounded-lg ${faq.bg} shrink-0`}>
                      <Icon size={18} className={faq.color} />
                    </div>
                    <span className="flex-1 font-medium text-zinc-900 dark:text-white">
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-zinc-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pl-[72px] text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* CALL TO ACTION */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950 p-10 md:p-14 text-center"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl"></div>
          <Github className="absolute top-8 left-8 text-white/5" size={80} />
          <Github className="absolute bottom-8 right-8 text-white/5" size={80} />

          <div className="relative">
            <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 mb-6">
              <Rocket className="text-white" size={28} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Contribute?
            </h2>
            <p className="text-zinc-300 text-lg mb-8 max-w-xl mx-auto">
              Take the first step and submit your pull request today!
            </p>
            <motion.a
              href="https://github.com/SandeepVashishtha/Eventra"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 bg-white text-zinc-900 font-semibold px-8 py-3.5 rounded-full shadow-2xl hover:shadow-white/20 transition-all"
            >
              <Github size={20} />
              Go to GitHub
              <ArrowRightCircle size={18} />
            </motion.a>
          </div>
        </motion.section>

      </div>
    </div>
  );
};

export default ContributorGuide;