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
import "./UserProfile.css";
import { safeJsonParse } from "../../utils/safeJsonParse";

// 🔥 FIX 1: Safe URL Sanitizer to prevent Stored XSS via malicious URI schemes
const sanitizeUrl = (url) => {
  if (!url) return undefined;
  const sanitized = url.trim();
  if (/^(javascript|data|vbscript):/i.test(sanitized)) return undefined;
  if (!/^https?:\/\//i.test(sanitized)) return `https://${sanitized}`;
  return sanitized;
};

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

// 🔥 FIX 2: Replaced static hex codes with dynamic Tailwind classes for Dark Mode support
const ACTIVITY_STATS = [
  { label: "Events",      value: 5,  sub: "2 hosted · 3 joined",  icon: <Calendar  size={18} />, colorClass: "text-indigo-600 bg-indigo-500/10 dark:text-indigo-400 dark:bg-indigo-500/20" },
  { label: "Hackathons",  value: 4,  sub: "2 hosted · 2 joined",  icon: <Trophy    size={18} />, colorClass: "text-pink-600 bg-pink-500/10 dark:text-pink-400 dark:bg-pink-500/20" },
  { label: "Projects",    value: 2,  sub: "1 done · 1 active",    icon: <FolderOpen size={18}/>, colorClass: "text-purple-600 bg-purple-500/10 dark:text-purple-400 dark:bg-purple-500/20" },
  { label: "Achievements",value: 7,  sub: "badges earned",        icon: <Star      size={18} />, colorClass: "text-amber-600 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/20" },
];

export default function UserProfile() {
  const prefersReducedMotion = useReducedMotion();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading]   = useState(true);

  /* Load profile from localStorage (same source as EditProfile) */
  useEffect(() => {
    let active = true;
    const loadProfileData = async () => {
      let merged = user || {};
      try {
        const [saved] = await Promise.all([
          syncSecureStorage.getItemAsync("user"),
          new Promise((resolve) => setTimeout(resolve, 600))
        ]);
        if (saved && active) {
          merged = { ...user, ...safeJsonParse(saved, {}) };
        }
      } catch (error) {
        console.error('Error parsing user profile from localStorage:', error);
      }
      if (active) {
        setProfile(merged);
        setLoading(false);
      }
    };
    loadProfileData();
    return () => {
      active = false;
    };
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
            <motion.div custom={1} variants={fadeUp(prefersReducedMotion)} className="upv-card">
              <div className="upv-card-header">
                <span className="upv-card-icon text-indigo-600 bg-indigo-500/10 dark:text-indigo-400 dark:bg-indigo-500/20">
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
              <motion.div custom={2} variants={fadeUp(prefersReducedMotion)} className="upv-card">
                <div className="upv-card-header">
                  <span className="upv-card-icon text-purple-600 bg-purple-500/10 dark:text-purple-400 dark:bg-purple-500/20">
                    <FileText size={16} />
                  </span>
                  <h2 className="upv-card-title">About</h2>
                </div>
                <p className="upv-about-text">{profile.bio}</p>
              </motion.div>
            )}

            {/* Social Links */}
            {hasSocials && (
              <motion.div custom={3} variants={fadeUp(prefersReducedMotion)} className="upv-card">
                <div className="upv-card-header">
                  <span className="upv-card-icon text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/20">
                    <Globe size={16} />
                  </span>
                  <h2 className="upv-card-title">Social Links</h2>
                </div>
                <div className="upv-socials">
                  {profile?.github && (
                    <a href={sanitizeUrl(profile.github)} target="_blank" rel="noopener noreferrer" className="upv-social-link upv-social-github">
                      <Github size={16} />
                      <span>GitHub</span>
                      <ChevronRight size={13} className="upv-social-arrow" />
                    </a>
                  )}
                  {profile?.linkedin && (
                    <a href={sanitizeUrl(profile.linkedin)} target="_blank" rel="noopener noreferrer" className="upv-social-link upv-social-linkedin">
                      <Linkedin size={16} />
                      <span>LinkedIn</span>
                      <ChevronRight size={13} className="upv-social-arrow" />
                    </a>
                  )}
                  {profile?.portfolio && (
                    <a href={sanitizeUrl(profile.portfolio)} target="_blank" rel="noopener noreferrer" className="upv-social-link upv-social-portfolio">
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
            <motion.div custom={1} variants={fadeUp(prefersReducedMotion)} className="upv-card">
              <div className="upv-card-header">
                <span className="upv-card-icon text-amber-600 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/20">
                  <Activity size={16} />
                </span>
                <h2 className="upv-card-title">Activity Stats</h2>
              </div>
              <div className="upv-stats-grid">
                {ACTIVITY_STATS.map((s, i) => (
                  <motion.div
                    key={s.label}
                    custom={i}
                    variants={fadeUp(prefersReducedMotion)}
                    className="upv-stat-card relative overflow-hidden"
                  >
                    <span className={`upv-stat-icon ${s.colorClass}`}>
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
            <motion.div custom={2} variants={fadeUp(prefersReducedMotion)} className="upv-card">
              <div className="upv-card-header">
                <span className="upv-card-icon text-indigo-600 bg-indigo-500/10 dark:text-indigo-400 dark:bg-indigo-500/20">
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
            <motion.div custom={3} variants={fadeUp(prefersReducedMotion)} className="upv-card upv-achievements-card">
              <div className="upv-card-header">
                <span className="upv-card-icon text-pink-600 bg-pink-500/10 dark:text-pink-400 dark:bg-pink-500/20">
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