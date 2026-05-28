import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import {
  Lightbulb, Code2, GitBranch, BookOpen, Users, CheckCircle,
  Trophy, Clock, Star, ArrowRight, Search, Filter, ExternalLink,
  Calendar, TrendingUp, Award, MessageCircle, Zap, Target
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";

// ============ CONSTANTS ============
const GSSOC_TIMELINE = [
  { phase: "Registration", date: "Mar 1", status: "completed", icon: CheckCircle },
  { phase: "Coding Starts", date: "Mar 15", status: "completed", icon: Code2 },
  { phase: "Phase 1 Evaluation", date: "Apr 30", status: "current", icon: Target },
  { phase: "Phase 2 Evaluation", date: "May 31", status: "upcoming", icon: Trophy },
  { phase: "Final Results", date: "Jun 15", status: "upcoming", icon: Award },
];

const MENTORS = [
  { name: "Priya Sharma", role: "Frontend Lead", expertise: ["React", "Tailwind"], avatar: "👩‍💻", available: true },
  { name: "Rahul Verma", role: "Backend Expert", expertise: ["Node.js", "MongoDB"], avatar: "👨‍💻", available: true },
  { name: "Anita Das", role: "DevOps Mentor", expertise: ["Docker", "CI/CD"], avatar: "👩‍🔧", available: false },
  { name: "Vikram Singh", role: "Full-Stack Guide", expertise: ["MERN", "GraphQL"], avatar: "👨‍🚀", available: true },
];

const ACHIEVEMENTS = [
  { id: "first-pr", label: "First PR", icon: Star, unlocked: true, color: "text-yellow-500" },
  { id: "bug-hunter", label: "Bug Hunter", icon: Zap, unlocked: true, color: "text-red-500" },
  { id: "helper", label: "Community Helper", icon: MessageCircle, unlocked: false, color: "text-blue-500" },
  { id: "top-contributor", label: "Top Contributor", icon: Trophy, unlocked: false, color: "text-purple-500" },
];

const RESOURCES = [
  { title: "Git & GitHub Basics", type: "Tutorial", duration: "15 min", link: "#" },
  { title: "Writing Good PR Descriptions", type: "Guide", duration: "5 min", link: "#" },
  { title: "Code Review Checklist", type: "PDF", duration: "2 min", link: "#" },
  { title: "Eventra Architecture Overview", type: "Video", duration: "20 min", link: "#" },
];

// ============ UTILITY FUNCTIONS ============
const calculateTimeLeft = () => {
  const endDate = new Date("2024-06-15T23:59:59");
  const now = new Date();
  const diff = endDate - now;
  
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
  
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    ended: false
  };
};

const getStatusColor = (status) => ({
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  current: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 animate-pulse",
  upcoming: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
}[status]);

// ============ REUSABLE COMPONENTS ============
const CountdownTimer = ({ timeLeft }) => (
  <div className="grid grid-cols-4 gap-3 text-center">
    {Object.entries(timeLeft).filter(([key]) => key !== 'ended').map(([unit, value]) => (
      <motion.div
        key={unit}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-3 text-white"
      >
        <div className="text-2xl font-bold">{String(value).padStart(2, '0')}</div>
        <div className="text-xs opacity-90 capitalize">{unit}</div>
      </motion.div>
    ))}
  </div>
);

const MentorCard = ({ mentor }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="p-4 bg-white dark:bg-gray-700/50 rounded-xl border dark:border-gray-600 flex items-center gap-3"
  >
    <div className="text-3xl">{mentor.avatar}</div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <h4 className="font-medium text-gray-900 dark:text-white truncate">{mentor.name}</h4>
        {mentor.available && (
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Available" />
        )}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{mentor.role}</p>
      <div className="flex flex-wrap gap-1 mt-1">
        {mentor.expertise.map(skill => (
          <span key={skill} className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
            {skill}
          </span>
        ))}
      </div>
    </div>
    {mentor.available && (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
      >
        Connect
      </motion.button>
    )}
  </motion.div>
);

const AchievementBadge = ({ achievement }) => {
  const Icon = achievement.icon;
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`p-3 rounded-xl border-2 transition-all ${
        achievement.unlocked 
          ? 'bg-white dark:bg-gray-700 border-yellow-300 dark:border-yellow-600 shadow-md' 
          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'
      }`}
    >
      <Icon className={`w-6 h-6 mx-auto mb-2 ${achievement.unlocked ? achievement.color : 'text-gray-400'}`} />
      <p className={`text-xs font-medium text-center ${achievement.unlocked ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500'}`}>
        {achievement.label}
      </p>
      {!achievement.unlocked && (
        <p className="text-[10px] text-gray-400 text-center mt-1">Locked</p>
      )}
    </motion.div>
  );
};

const TimelineItem = ({ item, isLast }) => {
  const Icon = item.icon;
  const statusColors = getStatusColor(item.status);
  
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`w-10 h-10 rounded-full flex items-center justify-center ${statusColors}`}
        >
          <Icon className="w-5 h-5" />
        </motion.div>
        {!isLast && (
          <div className={`w-0.5 flex-1 my-2 ${item.status === 'completed' ? 'bg-green-400' : 'bg-gray-300 dark:bg-gray-600'}`} />
        )}
      </div>
      <div className="pb-6">
        <h4 className="font-medium text-gray-900 dark:text-white">{item.phase}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">{item.date}</p>
        {item.status === 'current' && (
          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
            In Progress
          </span>
        )}
      </div>
    </div>
  );
};

// ============ MAIN COMPONENT ============
const GSSoCContribution = () => {
  const prefersReducedMotion = useReducedMotion();
  useDocumentTitle("Eventra | GSSoC Contribution");
  const navigate = useNavigate();
  
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [userStats, setUserStats] = useState({
    issuesClaimed: 3,
    prsMerged: 2,
    points: 450,
    rank: "Rising Star"
  });

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft.ended) return;
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft.ended]);

  // Filtered resources
  const filteredResources = useMemo(() => {
    if (!searchQuery) return RESOURCES;
    return RESOURCES.filter(r => 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, delayChildren: 0.2 } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: prefersReducedMotion ? 0 : 0.4 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-[95%] mx-auto my-10 bg-white dark:bg-black min-h-screen pb-12"
    >
      {/* 🎯 HERO SECTION WITH COUNTDOWN */}
      <motion.div
        variants={itemVariants}
        className="p-8 rounded-3xl shadow-lg bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white mb-8 relative overflow-hidden"
      >
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-300 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-6 h-6 text-yellow-300" />
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                GSSoC 2024
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Contribute to Eventra & <br/>
              <span className="text-yellow-300">Level Up Your Skills</span>
            </h1>
            <p className="text-indigo-100 text-lg mb-6 leading-relaxed">
              Join 500+ contributors building real-world features. Earn points, 
              badges, and recognition while making an impact.
            </p>
            
            {/* User Stats Mini-Card */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: "Issues", value: userStats.issuesClaimed, icon: Target },
                { label: "PRs", value: userStats.prsMerged, icon: GitBranch },
                { label: "Points", value: userStats.points, icon: Star },
                { label: "Rank", value: userStats.rank.split(' ')[0], icon: Award },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Icon className="w-5 h-5 mx-auto mb-1 text-yellow-300" />
                  <div className="text-xl font-bold">{value}</div>
                  <div className="text-xs opacity-90">{label}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Countdown Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5" />
              <h3 className="font-semibold">Program Ends In</h3>
            </div>
            {timeLeft.ended ? (
              <div className="text-center py-4">
                <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-300" />
                <p className="font-medium">Program Completed! 🎉</p>
                <p className="text-sm opacity-90">Check final rankings soon</p>
              </div>
            ) : (
              <CountdownTimer timeLeft={timeLeft} />
            )}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open("https://gssoc.girlscript.tech", "_blank")}
              className="w-full mt-4 py-2.5 bg-white text-indigo-600 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors"
            >
              <span>View Leaderboard</span>
              <ExternalLink className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* 📋 GUIDELINES SECTION (Existing - Enhanced) */}
      <motion.div
        variants={itemVariants}
        className="p-8 rounded-3xl shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mb-2">
            🌟 Contribution Guidelines
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Follow these best practices to make your open-source journey smooth and successful.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Lightbulb, title: "Explore Issues", desc: "Start with beginner-friendly tasks", color: "text-yellow-500" },
            { icon: Code2, title: "Clean PRs", desc: "Tested, documented, well-structured", color: "text-green-500" },
            { icon: GitBranch, title: "Collaborate", desc: "Discuss, review, and learn together", color: "text-purple-500" },
            { icon: BookOpen, title: "Read Docs", desc: "Understand before you contribute", color: "text-blue-500" },
          ].map(({ icon: Icon, title, desc, color }, idx) => (
            <motion.div
              key={title}
              whileHover={{ y: -4, boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}
              className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border dark:border-gray-600 text-center transition-shadow"
            >
              <Icon className={`w-9 h-9 mx-auto mb-3 ${color}`} />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 🎮 NEW: ACHIEVEMENTS & PROGRESS */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Achievements */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Your Achievements</h3>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {ACHIEVEMENTS.map(achievement => (
              <AchievementBadge key={achievement.id} achievement={achievement} />
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
            {ACHIEVEMENTS.filter(a => a.unlocked).length}/{ACHIEVEMENTS.length} unlocked
          </p>
        </div>

        {/* Quick Resources with Search */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Quick Resources</h3>
            </div>
            <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
              {filteredResources.length} items
            </span>
          </div>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tutorials, guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white"
            />
          </div>
          
          {/* Resource List */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            <AnimatePresence>
              {filteredResources.map((resource, idx) => (
                <motion.a
                  key={resource.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: idx * 0.05 }}
                  href={resource.link}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors group"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {resource.title}
                    </p>
                    <p className="text-xs text-gray-500">{resource.type} • {resource.duration}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                </motion.a>
              ))}
            </AnimatePresence>
            {filteredResources.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No resources found</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* 👥 NEW: MENTORS SECTION */}
      <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Meet Your Mentors</h3>
          </div>
          <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-3">
          {MENTORS.map(mentor => (
            <MentorCard key={mentor.name} mentor={mentor} />
          ))}
        </div>
      </motion.div>

      {/* 📅 TIMELINE SECTION */}
      <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Program Timeline</h3>
        </div>
        
        <div className="relative pl-2">
          {GSSOC_TIMELINE.map((item, idx) => (
            <TimelineItem key={item.phase} item={item} isLast={idx === GSSOC_TIMELINE.length - 1} />
          ))}
        </div>
      </motion.div>

      {/* 🎯 GETTING STARTED & BEST PRACTICES (Enhanced) */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Getting Started */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 border dark:border-gray-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Getting Started</h3>
          </div>
          <ol className="space-y-3">
            {[
              "Sign up on GSSoC platform",
              "Join Eventra's Discord community",
              "Browse issues labeled 'good first issue'",
              "Comment on an issue to claim it",
              "Fork, code, and submit your PR!",
            ].map((step, idx) => (
              <li key={step} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </span>
                <span className="text-gray-700 dark:text-gray-300 text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </motion.div>

        {/* Best Practices */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-2xl bg-white dark:bg-gray-800 border dark:border-gray-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Best Practices</h3>
          </div>
          <ul className="space-y-3">
            {[
              "Be respectful & inclusive in all discussions",
              "Write clear PR titles and descriptions",
              "Test your changes locally before pushing",
              "Ask for help early if you're stuck",
              "Review others' PRs to learn and give back",
            ].map((tip, idx) => (
              <li key={tip} className="flex items-start gap-3">
                <CheckCircle className="flex-shrink-0 w-5 h-5 text-green-500 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300 text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* 🚀 ACTION BUTTONS */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-center gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/contributorguide")}
          className="px-8 py-3.5 rounded-full font-semibold text-white bg-gray-900 hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          Contributor's Guide
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.open("https://github.com/SandeepVashishtha/Eventra", "_blank")}
          className="px-8 py-3.5 rounded-full font-semibold text-white bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <GitBranch className="w-4 h-4" />
          Start Contributing
          <ExternalLink className="w-4 h-4" />
        </motion.button>

        {/* NEW: Discord Community Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.open("https://discord.gg/eventra", "_blank")}
          className="px-8 py-3.5 rounded-full font-semibold text-white bg-[#5865F2] hover:bg-[#4752C4] shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          Join Discord
        </motion.button>
      </motion.div>

      {/* 📊 Footer Stats */}
      <motion.div
        variants={itemVariants}
        className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 border dark:border-gray-600"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { label: "Active Contributors", value: "500+", icon: Users, color: "text-blue-500" },
            { label: "Issues Solved", value: "1.2k", icon: CheckCircle, color: "text-green-500" },
            { label: "PRs Merged", value: "850+", icon: GitBranch, color: "text-purple-500" },
            { label: "Countries", value: "45+", icon: Globe, color: "text-orange-500" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="p-3">
              <Icon className={`w-6 h-6 mx-auto mb-2 ${color}`} />
              <div className="text-xl font-bold text-gray-900 dark:text-white">{value}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Missing icon import fix
const Globe = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default GSSoCContribution;