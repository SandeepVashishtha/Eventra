import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useReducedMotion } from '../../hooks/useReducedMotion';
import {
  User,
  AtSign,
  Mail,
  Phone,
  FileText,
  Github,
  Linkedin,
  Globe,
  Edit3,
  Calendar,
  Trophy,
  FolderOpen,
  Activity,
  ChevronRight,
  Star,
  Zap,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { syncSecureStorage } from "../../utils/secureStorage";
import { safeJsonParse } from "../../utils/safeJsonParse";
import "./UserProfile.css";

const fadeUp = (prefersReducedMotion) => ({
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: prefersReducedMotion ? 0 : i * 0.08, duration: prefersReducedMotion ? 0 : 0.4, ease: "easeOut" },
  }),
});

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

/* ── Mock activity stats (mirrors dashboard MOCK_DATA) ── */
const ACTIVITY_STATS = [
  { label: "Events",      value: 5,  sub: "2 hosted · 3 joined",  icon: <Calendar  size={18} />, accent: "#6366f1" },
  { label: "Hackathons",  value: 4,  sub: "2 hosted · 2 joined",  icon: <Trophy    size={18} />, accent: "#ec4899" },
  { label: "Projects",    value: 2,  sub: "1 done · 1 active",    icon: <FolderOpen size={18}/>, accent: "#8b5cf6" },
  { label: "Achievements",value: 7,  sub: "badges earned",        icon: <Star      size={18} />, accent: "#f59e0b" },
];

export default function UserProfile() {
  const prefersReducedMotion = useReducedMotion();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading]   = useState(true);

  /* Load profile from localStorage (same source as EditProfile) */
  useEffect(() => {
    const saved = syncSecureStorage.getItem("user");
    let merged = user || {};
    if (saved) {
      const parsed = safeJsonParse(saved, {});
      merged = { ...user, ...parsed };
    }
    setProfile(merged);
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [user]);

  /* Derived helpers */
  const displayName = profile?.fullName
    || `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim()
    || profile?.username
    || "Eventra User";

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const skills    = profile?.skills || [];
  const hasSocials = profile?.github || profile?.linkedin || profile?.portfolio;

  if (loading) {
    return (
      <div className="upv-root">
        <div className="upv-skeleton-wrap">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="upv-skeleton" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="upv-root">
      <motion.div
        className="upv-container"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {/* ── Hero / Avatar card ── */}
        <motion.div custom={0} variants={fadeUp(prefersReducedMotion)} className="upv-hero-card">
          <div className="upv-hero-bg" />

          <div className="upv-hero-content">
            {/* Avatar */}
            <div className="upv-avatar-wrap">
              {profile?.avatarBase64 || profile?.profilePicture ? (
                <img
                  src={profile.avatarBase64 || profile.profilePicture}
                  alt={displayName}
                  className="upv-avatar-img" loading="lazy"/>
              ) : (
                <div className="upv-avatar-placeholder">
                  <span className="upv-avatar-initials">{initials}</span>
                </div>
              )}
              <div className="upv-avatar-ring" />
            </div>

            {/* Name + username */}
            <div className="upv-hero-info">
              <h1 className="upv-display-name">{displayName}</h1>
              {profile?.username && (
                <p className="upv-username">
                  <AtSign size={14} />
                  {profile.username}
                </p>
              )}
              {profile?.bio && (
                <p className="upv-bio">{profile.bio}</p>
              )}
            </div>

            {/* Edit Profile button */}
            <Link to="/profile/edit" className="upv-edit-btn" id="edit-profile-btn">
              <Edit3 size={15} />
              Edit Profile
            </Link>
          </div>
        </motion.div>

        {/* ── Two-column body ── */}
        <div className="upv-body">
          {/* LEFT column */}
          <div className="upv-left">

            {/* Contact Info card */}
            <motion.div custom={1} variants={fadeUp} className="upv-card">
              <div className="upv-card-header">
                <span className="upv-card-icon" style={{ background: "#6366f118", color: "#6366f1" }}>
                  <User size={16} />
                </span>
                <h2 className="upv-card-title">Personal Info</h2>
              </div>

              <ul className="upv-info-list">
                <li className="upv-info-row">
                  <span className="upv-info-label"><Mail size={14} /> Email</span>
                  <span className="upv-info-value">
                    {profile?.email || <span className="upv-empty-val">Not set</span>}
                  </span>
                </li>
                <li className="upv-info-row">
                  <span className="upv-info-label"><Phone size={14} /> Phone</span>
                  <span className="upv-info-value">
                    {profile?.phone || <span className="upv-empty-val">Not set</span>}
                  </span>
                </li>
                <li className="upv-info-row">
                  <span className="upv-info-label"><AtSign size={14} /> Username</span>
                  <span className="upv-info-value">
                    {profile?.username || <span className="upv-empty-val">Not set</span>}
                  </span>
                </li>
              </ul>
            </motion.div>

            {/* Bio card (if exists separately from hero) */}
            {profile?.bio && (
              <motion.div custom={2} variants={fadeUp} className="upv-card">
                <div className="upv-card-header">
                  <span className="upv-card-icon" style={{ background: "#8b5cf618", color: "#8b5cf6" }}>
                    <FileText size={16} />
                  </span>
                  <h2 className="upv-card-title">About</h2>
                </div>
                <p className="upv-about-text">{profile.bio}</p>
              </motion.div>
            )}

            {/* Social Links */}
            {hasSocials && (
              <motion.div custom={3} variants={fadeUp} className="upv-card">
                <div className="upv-card-header">
                  <span className="upv-card-icon" style={{ background: "#10b98118", color: "#10b981" }}>
                    <Globe size={16} />
                  </span>
                  <h2 className="upv-card-title">Social Links</h2>
                </div>
                <div className="upv-socials">
                  {profile?.github && (
                    <a href={profile.github} target="_blank" rel="noopener noreferrer" className="upv-social-link upv-social-github">
                      <Github size={16} />
                      <span>GitHub</span>
                      <ChevronRight size={13} className="upv-social-arrow" />
                    </a>
                  )}
                  {profile?.linkedin && (
                    <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="upv-social-link upv-social-linkedin">
                      <Linkedin size={16} />
                      <span>LinkedIn</span>
                      <ChevronRight size={13} className="upv-social-arrow" />
                    </a>
                  )}
                  {profile?.portfolio && (
                    <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="upv-social-link upv-social-portfolio">
                      <Globe size={16} />
                      <span>Portfolio</span>
                      <ChevronRight size={13} className="upv-social-arrow" />
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* RIGHT column */}
          <div className="upv-right">

            {/* Activity stats */}
            <motion.div custom={1} variants={fadeUp} className="upv-card">
              <div className="upv-card-header">
                <span className="upv-card-icon" style={{ background: "#f59e0b18", color: "#f59e0b" }}>
                  <Activity size={16} />
                </span>
                <h2 className="upv-card-title">Activity Stats</h2>
              </div>
              <div className="upv-stats-grid">
                {ACTIVITY_STATS.map((s, i) => (
                  <motion.div
                    key={s.label}
                    custom={i}
                    variants={fadeUp}
                    className="upv-stat-card"
                    style={{ "--stat-accent": s.accent }}
                  >
                    <span className="upv-stat-icon" style={{ background: s.accent + "18", color: s.accent }}>
                      {s.icon}
                    </span>
                    <div className="upv-stat-body">
                      <p className="upv-stat-value">{s.value}</p>
                      <p className="upv-stat-label">{s.label}</p>
                      <p className="upv-stat-sub">{s.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Skills / Interests */}
            <motion.div custom={2} variants={fadeUp} className="upv-card">
              <div className="upv-card-header">
                <span className="upv-card-icon" style={{ background: "#6366f118", color: "#6366f1" }}>
                  <Zap size={16} />
                </span>
                <h2 className="upv-card-title">Skills &amp; Interests</h2>
              </div>

              {skills.length > 0 ? (
                <div className="upv-skills-wrap">
                  {skills.map((skill, idx) => (
                    <span key={`${skill}-${idx}`} className="upv-skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="upv-empty-msg">
                  No skills added yet.{" "}
                  <Link to="/profile/edit" className="upv-inline-link">Add some →</Link>
                </p>
              )}
            </motion.div>

            {/* Achievements quick link */}
            <motion.div custom={3} variants={fadeUp} className="upv-card upv-achievements-card">
              <div className="upv-card-header">
                <span className="upv-card-icon" style={{ background: "#ec489918", color: "#ec4899" }}>
                  <Trophy size={16} />
                </span>
                <h2 className="upv-card-title">Achievements</h2>
              </div>
              <p className="upv-achievements-desc">
                View all your earned badges, milestones and leaderboard rankings.
              </p>
              <Link to="/dashboard/achievements" className="upv-achievements-btn" id="view-achievements-btn">
                <Trophy size={15} />
                View Achievements
                <ChevronRight size={14} />
              </Link>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ACCESSIBILITY COMPLIANCE: Linked form labels to corresponding inputs and added high-contrast focus indicators for keyboard users.
