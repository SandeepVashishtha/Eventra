import { useState } from "react";
import {
  Check,
  AlertTriangle,
  User,
  Briefcase,
  Zap,
  Code,
  Plus,
  ExternalLink,
  Settings,
  Rocket,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WorkspaceBootstrapModal from "../../../components/hackathons/WorkspaceBootstrapModal";

const TeamMatchmaking = () => {
  const [showForm, setShowForm] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [expandedSkillsCard, setExpandedSkillsCard] = useState(null);
  const [bootstrapTarget, setBootstrapTarget] = useState(null);

  // User's own match profile
  const [myProfile, setMyProfile] = useState({
    role: "Frontend Developer",
    skills: "React, Tailwind CSS, JavaScript, Figma",
    level: "Intermediate",
  });

  const defaultRequests = [
    {
      id: 1,
      name: "Alex Rivera",
      hackathon: "Global AI Hack 2026",
      role: "Backend Developer",
      skills: ["Python", "FastAPI", "PostgreSQL", "Docker"],
      level: "Advanced",
      contact: "https://github.com/alexrivera",
      idea: "AI-driven event schedule optimizer. Needs a frontend wizard to design the client dashboards.",
    },
    {
      id: 2,
      name: "Sophia Chen",
      hackathon: "Web3 Innovation Summit",
      role: "Frontend Developer",
      skills: ["React", "Tailwind CSS", "TypeScript"],
      level: "Intermediate",
      contact: "https://github.com/sophiachen",
      idea: "Decentralized ticketing platform using smart contracts and smooth client interfaces.",
    },
    {
      id: 3,
      name: "Marcus Dupont",
      hackathon: "Eco-Tech Hackathon",
      role: "UI/UX Designer",
      skills: ["Figma", "User Research", "Prototyping"],
      level: "Intermediate",
      contact: "https://figma.com/@marcus",
      idea: "Visual carbon footprint calculator and gamified target tracker for campus events.",
    },
  ];

  const [teamRequests, setTeamRequests] = useState(defaultRequests);

  const [formData, setFormData] = useState({
    name: "",
    hackathon: "",
    role: "",
    skills: "",
    level: "Beginner",
    contact: "",
    idea: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileChange = (e) => {
    setMyProfile({
      ...myProfile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.hackathon || !formData.role) {
      return;
    }

    const newRequest = {
      ...formData,
      skills: formData.skills
        ? formData.skills
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        : [],
      id: Date.now(),
    };

    setTeamRequests([newRequest, ...teamRequests]);

    setFormData({
      name: "",
      hackathon: "",
      role: "",
      skills: "",
      level: "Beginner",
      contact: "",
      idea: "",
    });

    setShowForm(false);
  };

  // Compatibility score calculation algorithm
  const calculateCompatibility = (team) => {
    const userSkills = myProfile.skills
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0);

    const teamSkills = (team.skills || [])
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0);

    let roleScore = 0;
    const userRoleLower = myProfile.role.toLowerCase();
    const teamRoleLower = (team.role || "").toLowerCase();

    if (userRoleLower === teamRoleLower) {
      roleScore = 40;
    } else if (
      userRoleLower.includes(teamRoleLower) ||
      teamRoleLower.includes(userRoleLower) ||
      (userRoleLower.includes("full") &&
        (teamRoleLower.includes("front") || teamRoleLower.includes("back")))
    ) {
      roleScore = 25;
    }

    let skillScore = 0;
    const matchedSkills = [];
    const missingSkills = [];

    if (teamSkills.length > 0) {
      const loweredUserSkills = userSkills.map((s) => s.toLowerCase());
      teamSkills.forEach((skill) => {
        const lowered = skill.toLowerCase();
        const isMatch = loweredUserSkills.some(
          (us) => us.includes(lowered) || lowered.includes(us)
        );
        if (isMatch) {
          matchedSkills.push(skill);
        } else {
          missingSkills.push(skill);
        }
      });
      skillScore = Math.round((matchedSkills.length / teamSkills.length) * 40);
    } else {
      skillScore = 20;
    }

    let levelScore = 0;
    if (myProfile.level === team.level) {
      levelScore = 20;
    } else {
      const levels = ["Beginner", "Intermediate", "Advanced"];
      const userIdx = levels.indexOf(myProfile.level);
      const teamIdx = levels.indexOf(team.level);
      if (userIdx !== -1 && teamIdx !== -1 && Math.abs(userIdx - teamIdx) === 1) {
        levelScore = 10;
      }
    }

    const totalScore = roleScore + skillScore + levelScore;
    return {
      percentage: totalScore,
      matchedSkills,
      missingSkills,
    };
  };

  const sanitizeUrl = (url) => {
    if (!url) return "#";
    const sanitized = url.trim();
    const lower = sanitized.toLowerCase();
    if (
      lower.startsWith("javascript:") ||
      lower.startsWith("data:") ||
      lower.startsWith("vbscript:")
    ) {
      return "#";
    }
    return sanitized;
  };

  const getScoreColorClass = (score) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 50) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-rose-500 bg-rose-500/10 border-rose-500/20";
  };

  return (
    <>
      <section className="py-6">
        <div className="mx-auto max-w-7xl space-y-6 px-4">
          {/* TOP INTRO SECTION */}
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:p-8 dark:border-slate-800 dark:bg-slate-900">
            <div className="space-y-3">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-bold tracking-wider text-blue-700 uppercase dark:bg-blue-900/30 dark:text-blue-400">
                🤝 Team Matchmaking
              </span>
              <h2 className="text-2xl leading-tight font-black text-slate-900 md:text-3xl dark:text-white">
                Find Your Perfect Hackathon Team
              </h2>
              <p className="max-w-2xl text-xs leading-relaxed text-slate-500 md:text-sm dark:text-slate-400">
                Connect with developers, designers, and engineers based on automated compatibility
                scores and interactive skill checklists.
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => {
                  setShowProfileSettings(!showProfileSettings);
                  setShowForm(false);
                }}
                className="dark:hover:bg-slate-850 flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
              >
                <Settings size={14} />
                {showProfileSettings ? "Close Match Settings" : "Configure My Skills"}
              </button>

              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setShowProfileSettings(false);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/10 transition hover:bg-blue-700"
              >
                <Plus size={14} />
                {showForm ? "Close Form" : "Create Request"}
              </button>
            </div>
          </div>

          {/* USER PROFILE SETTINGS COLLAPSIBLE */}
          <AnimatePresence>
            {showProfileSettings && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <h3 className="mb-4 flex items-center gap-2 text-base font-extrabold text-slate-900 dark:text-white">
                  <User size={18} className="text-blue-500" />
                  Configure Your Matching Criteria
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase">
                      My Role
                    </label>
                    <input
                      type="text"
                      name="role"
                      value={myProfile.role}
                      onChange={handleProfileChange}
                      placeholder="e.g. Frontend Developer"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase">
                      My Skills (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="skills"
                      value={myProfile.skills}
                      onChange={handleProfileChange}
                      placeholder="e.g. React, Tailwind CSS, TypeScript"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase">
                      My Level
                    </label>
                    <select
                      name="level"
                      value={myProfile.level}
                      onChange={handleProfileChange}
                      className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TEAM REQUEST CREATION FORM */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <h3 className="mb-5 flex items-center gap-2 text-base font-extrabold text-slate-900 dark:text-white">
                  <Code size={18} className="text-blue-500" />
                  Submit A Team Request
                </h3>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase">
                      Hackathon Name *
                    </label>
                    <input
                      type="text"
                      name="hackathon"
                      value={formData.hackathon}
                      onChange={handleChange}
                      placeholder="e.g. SpaceApps 2026"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase">
                      Looking For Role *
                    </label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      placeholder="e.g. Backend Developer"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase">
                      Experience Tier Preferred
                    </label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      className="dark:bg-slate-955 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:text-white"
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">
                      Skills Needed (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="e.g. Node.js, Python, MongoDB"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">
                      Contact details (LinkedIn, GitHub or Discord)
                    </label>
                    <input
                      type="text"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      placeholder="e.g. https://github.com/myusername"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">
                      Project Concept/Idea
                    </label>
                    <textarea
                      name="idea"
                      value={formData.idea}
                      onChange={handleChange}
                      placeholder="Describe your hackathon vision..."
                      rows="3"
                      className="dark:bg-slate-955 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/10 transition hover:bg-blue-700 md:col-span-2"
                    aria-label="Submit team matchmaking request"
                  >
                    Submit Team Request
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* LIST OF REQUESTS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Active Community Matchmaking Requests
              </h3>
              <span className="dark:bg-slate-850 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-400 dark:border-slate-800/80">
                {teamRequests.length} Listings
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {teamRequests.map((team) => {
                const matchResults = calculateCompatibility(team);
                const scoreColor = getScoreColorClass(matchResults.percentage);
                const isExpanded = expandedSkillsCard === team.id;

                return (
                  <div
                    key={team.id}
                    className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900"
                  >
                    <div>
                      {/* Header line */}
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="rounded-lg bg-blue-50 px-2.5 py-0.5 text-[10px] font-black text-blue-600 uppercase dark:bg-blue-900/20 dark:text-blue-400">
                          {team.level}
                        </span>
                        <span
                          className="max-w-[130px] truncate text-[10px] font-bold text-slate-400"
                          title={team.hackathon}
                        >
                          {team.hackathon}
                        </span>
                      </div>

                      {/* Author & Score Badge */}
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {team.name}
                          </h4>
                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <Briefcase size={12} className="text-slate-400" />
                            <span>
                              Looking for: <strong>{team.role}</strong>
                            </span>
                          </p>
                        </div>

                        {/* Weighted compatibility score indicator badge */}
                        <div
                          className={`flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-[11px] font-black ${scoreColor}`}
                        >
                          <Zap size={11} className="fill-current" />
                          <span>{matchResults.percentage}% Match</span>
                        </div>
                      </div>

                      <p className="text-slate-650 dark:text-slate-450 mb-4 line-clamp-3 text-xs leading-relaxed">
                        {team.idea}
                      </p>

                      {/* Skills Checklist analysis dropdown */}
                      {team.skills && team.skills.length > 0 && (
                        <div className="dark:border-slate-850/60 mb-4 border-t border-slate-100 pt-4">
                          <button
                            onClick={() => setExpandedSkillsCard(isExpanded ? null : team.id)}
                            className="flex w-full items-center justify-between text-[11px] font-black text-slate-500 transition-colors hover:text-slate-700 dark:hover:text-slate-300"
                          >
                            <span>Skills Compatibility Fit</span>
                            <span className="text-blue-500 hover:underline">
                              {isExpanded ? "Hide Details" : "View Fit Check"}
                            </span>
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-3 space-y-2 overflow-hidden"
                              >
                                <div className="mb-1.5 text-[10px] font-bold text-slate-400 uppercase">
                                  Skills Match breakdown:
                                </div>
                                {team.skills.map((skill, sIdx) => {
                                  const isMatched = matchResults.matchedSkills.some(
                                    (ms) => ms.toLowerCase() === skill.toLowerCase()
                                  );

                                  return (
                                    <div
                                      key={sIdx}
                                      className="flex items-center justify-between py-0.5 text-xs"
                                    >
                                      <span className="text-slate-650 dark:text-slate-350">
                                        {skill}
                                      </span>
                                      {isMatched ? (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                                          <Check size={12} className="stroke-[3]" /> Have
                                        </span>
                                      ) : (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                                          <AlertTriangle size={12} className="stroke-[3]" /> Missing
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>

                    <div className="dark:border-slate-850/60 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <button
                        onClick={() => setBootstrapTarget(team)}
                        className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/10 transition hover:bg-indigo-700"
                      >
                        <Rocket size={12} />
                        <span>Bootstrap Workspace</span>
                      </button>
                      <a
                        href={sanitizeUrl(team.contact)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dark:hover:bg-slate-750 flex items-center gap-1 rounded-xl bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
                      >
                        <span>Contact builder</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Workspace Bootstrap Modal */}
      {bootstrapTarget && (
        <WorkspaceBootstrapModal team={bootstrapTarget} onClose={() => setBootstrapTarget(null)} />
      )}
    </>
  );
};

export default TeamMatchmaking;
