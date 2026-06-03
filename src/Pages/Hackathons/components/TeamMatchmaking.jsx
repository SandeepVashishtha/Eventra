import { useState } from "react";
import { Check, AlertTriangle, User, Briefcase, Zap, Code, Plus, ExternalLink, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TeamMatchmaking = () => {
  const [showForm, setShowForm] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [expandedSkillsCard, setExpandedSkillsCard] = useState(null);

  // User's own match profile
  const [myProfile, setMyProfile] = useState({
    role: "Frontend Developer",
    skills: "React, Tailwind CSS, JavaScript, Figma",
    level: "Intermediate"
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
      idea: "AI-driven event schedule optimizer. Needs a frontend wizard to design the client dashboards."
    },
    {
      id: 2,
      name: "Sophia Chen",
      hackathon: "Web3 Innovation Summit",
      role: "Frontend Developer",
      skills: ["React", "Tailwind CSS", "TypeScript"],
      level: "Intermediate",
      contact: "https://github.com/sophiachen",
      idea: "Decentralized ticketing platform using smart contracts and smooth client interfaces."
    },
    {
      id: 3,
      name: "Marcus Dupont",
      hackathon: "Eco-Tech Hackathon",
      role: "UI/UX Designer",
      skills: ["Figma", "User Research", "Prototyping"],
      level: "Intermediate",
      contact: "https://figma.com/@marcus",
      idea: "Visual carbon footprint calculator and gamified target tracker for campus events."
    }
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
      skills: formData.skills ? formData.skills.split(",").map(s => s.trim()).filter(s => s.length > 0) : [],
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
      .map(s => s.trim().toLowerCase())
      .filter(s => s.length > 0);
      
    const teamSkills = (team.skills || [])
      .map(s => s.trim().toLowerCase())
      .filter(s => s.length > 0);

    let roleScore = 0;
    const userRoleLower = myProfile.role.toLowerCase();
    const teamRoleLower = (team.role || "").toLowerCase();
    
    if (userRoleLower === teamRoleLower) {
      roleScore = 40;
    } else if (
      userRoleLower.includes(teamRoleLower) || 
      teamRoleLower.includes(userRoleLower) ||
      (userRoleLower.includes("full") && (teamRoleLower.includes("front") || teamRoleLower.includes("back")))
    ) {
      roleScore = 25;
    }

    let skillScore = 0;
    const matchedSkills = [];
    const missingSkills = [];
    
    if (teamSkills.length > 0) {
      teamSkills.forEach(skill => {
        if (userSkills.some(us => us.includes(skill) || skill.includes(us))) {
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
      missingSkills
    };
  };

  const sanitizeUrl = (url) => {
    if (!url) return "#";
    const sanitized = url.trim();
    const lower = sanitized.toLowerCase();
    if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("vbscript:")) {
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
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4 space-y-6">

        {/* TOP INTRO SECTION */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
              🤝 Team Matchmaking
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">
              Find Your Perfect Hackathon Team
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Connect with developers, designers, and engineers based on automated compatibility scores and interactive skill checklists.
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => {
                setShowProfileSettings(!showProfileSettings);
                setShowForm(false);
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 transition"
            >
              <Settings size={14} />
              {showProfileSettings ? "Close Match Settings" : "Configure My Skills"}
            </button>
            
            <button
              onClick={() => {
                setShowForm(!showForm);
                setShowProfileSettings(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-500/10"
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
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md"
            >
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <User size={18} className="text-blue-500" />
                Configure Your Matching Criteria
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">My Role</label>
                  <input
                    type="text"
                    name="role"
                    value={myProfile.role}
                    onChange={handleProfileChange}
                    placeholder="e.g. Frontend Developer"
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">My Skills (comma-separated)</label>
                  <input
                    type="text"
                    name="skills"
                    value={myProfile.skills}
                    onChange={handleProfileChange}
                    placeholder="e.g. React, Tailwind CSS, TypeScript"
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">My Level</label>
                  <select
                    name="level"
                    value={myProfile.level}
                    onChange={handleProfileChange}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:border-blue-500 cursor-pointer"
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
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md"
            >
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                <Code size={18} className="text-blue-500" />
                Submit A Team Request
              </h3>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Hackathon Name *</label>
                  <input
                    type="text"
                    name="hackathon"
                    value={formData.hackathon}
                    onChange={handleChange}
                    placeholder="e.g. SpaceApps 2026"
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Looking For Role *</label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    placeholder="e.g. Backend Developer"
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Experience Tier Preferred</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 text-slate-900 dark:text-white text-xs outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Skills Needed (comma-separated)</label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="e.g. Node.js, Python, MongoDB"
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Contact details (LinkedIn, GitHub or Discord)</label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    placeholder="e.g. https://github.com/myusername"
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Project Concept/Idea</label>
                  <textarea
                    name="idea"
                    value={formData.idea}
                    onChange={handleChange}
                    placeholder="Describe your hackathon vision..."
                    rows="3"
                    className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 text-slate-900 dark:text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="md:col-span-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-500/10"
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
            <span className="text-xs text-slate-400 font-bold bg-slate-100 dark:bg-slate-850 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800/80">
              {teamRequests.length} Listings
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamRequests.map((team) => {
              const matchResults = calculateCompatibility(team);
              const scoreColor = getScoreColorClass(matchResults.percentage);
              const isExpanded = expandedSkillsCard === team.id;

              return (
                <div
                  key={team.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition duration-300"
                >
                  <div>
                    {/* Header line */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase">
                        {team.level}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 truncate max-w-[130px]" title={team.hackathon}>
                        {team.hackathon}
                      </span>
                    </div>

                    {/* Author & Score Badge */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {team.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                          <Briefcase size={12} className="text-slate-400" />
                          <span>Looking for: <strong>{team.role}</strong></span>
                        </p>
                      </div>

                      {/* Weighted compatibility score indicator badge */}
                      <div className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-black flex items-center gap-1 ${scoreColor}`}>
                        <Zap size={11} className="fill-current" />
                        <span>{matchResults.percentage}% Match</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-650 dark:text-slate-450 leading-relaxed mb-4 line-clamp-3">
                      {team.idea}
                    </p>

                    {/* Skills Checklist analysis dropdown */}
                    {team.skills && team.skills.length > 0 && (
                      <div className="border-t border-slate-100 dark:border-slate-850/60 pt-4 mb-4">
                        <button
                          onClick={() => setExpandedSkillsCard(isExpanded ? null : team.id)}
                          className="w-full flex items-center justify-between text-[11px] font-black text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
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
                              className="overflow-hidden mt-3 space-y-2"
                            >
                              <div className="text-[10px] text-slate-400 mb-1.5 uppercase font-bold">Skills Match breakdown:</div>
                              {team.skills.map((skill, sIdx) => {
                                const isMatched = matchResults.matchedSkills.some(
                                  ms => ms.toLowerCase() === skill.toLowerCase()
                                );

                                return (
                                  <div key={sIdx} className="flex items-center justify-between text-xs py-0.5">
                                    <span className="text-slate-650 dark:text-slate-350">{skill}</span>
                                    {isMatched ? (
                                      <span className="flex items-center gap-1 text-emerald-500 font-bold text-[10px]">
                                        <Check size={12} className="stroke-[3]" /> Have
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 text-amber-500 font-bold text-[10px]">
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

                  <div className="border-t border-slate-100 dark:border-slate-850/60 pt-4 flex items-center justify-between gap-3">
                    <a
                      href={sanitizeUrl(team.contact)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1 transition"
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
  );
};

export default TeamMatchmaking;
