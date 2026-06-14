import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Github, Rocket, ChevronRight, ChevronLeft,
  Check, AlertCircle, Loader2, Plus, Trash2,
  Lock, Globe, ExternalLink, Copy, Users,
  KeyRound, FolderGit2, BookOpen,
} from "lucide-react";
import {
  validateGitHubToken,
  slugifyRepoName,
  extractGitHubUsername,
  bootstrapWorkspace,
} from "../../utils/githubWorkspace";

// ─── Step indicator ──────────────────────────────────────────────────────────
const STEPS = [
  { id: "connect", label: "Connect GitHub", icon: KeyRound },
  { id: "config",  label: "Configure Repo", icon: FolderGit2 },
  { id: "team",    label: "Add Teammates",  icon: Users },
  { id: "launch",  label: "Launch",         icon: Rocket },
];

const BOOTSTRAP_PHASES = [
  { key: "validating",    label: "Verifying GitHub token…" },
  { key: "creating_repo", label: "Creating repository…" },
  { key: "pushing_readme",label: "Scaffolding README…" },
  { key: "inviting",      label: "Inviting teammates…" },
  { key: "done",          label: "Workspace ready!" },
];

// ─── Small helpers ────────────────────────────────────────────────────────────
const StatusIcon = ({ status }) => {
  if (status === "invited")  return <Check size={14} className="text-emerald-500" />;
  if (status === "skipped")  return <Check size={14} className="text-slate-400" />;
  if (status === "error")    return <AlertCircle size={14} className="text-rose-500" />;
  return null;
};

const PhaseRow = ({ phase, currentPhase, donePhases }) => {
  const isDone    = donePhases.includes(phase.key);
  const isActive  = currentPhase === phase.key;
  return (
    <div className={`flex items-center gap-3 py-2 px-3 rounded-xl transition-all duration-300 ${
      isActive ? "bg-blue-50 dark:bg-blue-900/20" : ""
    }`}>
      <div className="w-5 h-5 shrink-0 flex items-center justify-center">
        {isDone
          ? <Check size={14} className="text-emerald-500 stroke-3" />
          : isActive
          ? <Loader2 size={14} className="text-blue-500 animate-spin" />
          : <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
        }
      </div>
      <span className={`text-xs font-medium ${
        isDone    ? "text-emerald-600 dark:text-emerald-400 line-through opacity-70" :
        isActive  ? "text-blue-600 dark:text-blue-400 font-bold" :
                    "text-slate-400 dark:text-slate-600"
      }`}>{phase.label}</span>
    </div>
  );
};

// ─── Main modal ───────────────────────────────────────────────────────────────
const WorkspaceBootstrapModal = ({ team, onClose }) => {
  /* ── Step state ── */
  const [step, setStep]           = useState(0);

  /* ── Step 1: Connect ── */
  const [token, setToken]         = useState("");
  const [tokenError, setTokenError] = useState("");
  const [tokenLoading, setTokenLoading] = useState(false);
  const [ghUser, setGhUser]       = useState(null); // { login, avatar_url, html_url }

  /* ── Step 2: Config ── */
  const defaultRepoName = slugifyRepoName(
    `${team?.hackathon || "hackathon"}-team-workspace`
  );
  const [repoName, setRepoName]   = useState(defaultRepoName);
  const [repoDesc, setRepoDesc]   = useState(
    team?.idea ? team.idea.slice(0, 120) : ""
  );
  const [isPrivate, setIsPrivate] = useState(false);
  const [repoNameError, setRepoNameError] = useState("");

  /* ── Step 3: Teammates ── */
  const initialHandle = extractGitHubUsername(team?.contact) || "";
  const [teammates, setTeammates] = useState(
    initialHandle ? [initialHandle] : [""]
  );

  /* ── Step 4: Launch ── */
  const [currentPhase, setCurrentPhase]   = useState("");
  const [donePhases, setDonePhases]       = useState([]);
  const [launching, setLaunching]         = useState(false);
  const [result, setResult]               = useState(null); // success result
  const [launchError, setLaunchError]     = useState("");
  const [copied, setCopied]               = useState(false);

  // Close on Escape
  useEffect(() => {
    const handle = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onClose]);

  // ── Token validation ──
  const handleVerifyToken = useCallback(async () => {
    setTokenError("");
    setTokenLoading(true);
    try {
      const user = await validateGitHubToken(token.trim());
      setGhUser(user);
    } catch (err) {
      setTokenError(err.message);
      setGhUser(null);
    } finally {
      setTokenLoading(false);
    }
  }, [token]);

  // ── Repo name validation ──
  const validateRepoName = (name) => {
    if (!name) return "Repository name is required.";
    if (!/^[a-zA-Z0-9_.-]+$/.test(name))
      return "Only letters, numbers, hyphens, dots and underscores are allowed.";
    if (name.length > 100) return "Name must be 100 characters or less.";
    return "";
  };

  // ── Teammate helpers ──
  const addTeammate     = () => setTeammates((p) => [...p, ""]);
  const removeTeammate  = (i) => setTeammates((p) => p.filter((_, idx) => idx !== i));
  const updateTeammate  = (i, val) =>
    setTeammates((p) => p.map((t, idx) => (idx === i ? val : t)));

  // ── Navigation guards ──
  const canGoNext = () => {
    if (step === 0) return !!ghUser;
    if (step === 1) return repoName.trim() !== "" && !repoNameError;
    return true;
  };

  const goNext = () => {
    if (step === 1) {
      const err = validateRepoName(repoName.trim());
      if (err) { setRepoNameError(err); return; }
    }
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  };

  // ── Launch ──
  const handleLaunch = async () => {
    setLaunching(true);
    setLaunchError("");
    setDonePhases([]);
    setCurrentPhase("");

    try {
      const res = await bootstrapWorkspace(
        token.trim(),
        {
          repoName:      repoName.trim(),
          description:   repoDesc.trim(),
          isPrivate,
          hackathonName: team?.hackathon || "Hackathon",
          projectIdea:   team?.idea || "",
          teammates:     teammates.map((t) => t.trim()).filter(Boolean),
        },
        (phase) => {
          setCurrentPhase(phase);
          setDonePhases((prev) => {
            const phaseOrder = BOOTSTRAP_PHASES.map((p) => p.key);
            const idx = phaseOrder.indexOf(phase);
            return phaseOrder.slice(0, idx);
          });
        }
      );
      setDonePhases(BOOTSTRAP_PHASES.map((p) => p.key));
      setResult(res);
    } catch (err) {
      setLaunchError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLaunching(false);
    }
  };

  const copyCloneUrl = () => {
    navigator.clipboard.writeText(result?.cloneUrl || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-500 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Bootstrap Team Workspace"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-violet-600 shadow-md">
              <Rocket size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                Bootstrap Team Workspace
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">
                {team?.hackathon || "Hackathon"} · with {team?.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-400"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Step indicator ── */}
        <div className="flex items-center gap-0 px-6 py-3 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
          {STEPS.map((s, i) => {
            const isActive   = i === step;
            const isComplete = i < step;
            const Icon = s.icon;
            return (
              <div key={s.id} className="flex items-center flex-1 min-w-0">
                <div className={`flex items-center gap-1.5 min-w-0 ${isActive ? "shrink-0" : ""}`}>
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-black transition-all ${
                    isComplete ? "bg-emerald-500 text-white" :
                    isActive   ? "bg-blue-600 text-white shadow-md shadow-blue-500/30" :
                                 "bg-slate-200 dark:bg-slate-800 text-slate-400"
                  }`}>
                    {isComplete ? <Check size={11} className="stroke-3" /> : <Icon size={11} />}
                  </div>
                  {isActive && (
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">
                      {s.label}
                    </span>
                  )}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-2 transition-all ${isComplete ? "bg-emerald-400" : "bg-slate-200 dark:bg-slate-700"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* ══ STEP 0: Connect GitHub ══ */}
            {step === 0 && (
              <motion.div key="step-connect"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40">
                  <div className="flex items-start gap-3">
                    <Github size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-blue-800 dark:text-blue-300">
                        Connect your GitHub account
                      </p>
                      <p className="text-[11px] text-blue-700/80 dark:text-blue-400/80 leading-relaxed">
                        Enter a Personal Access Token (Classic) with <code className="font-mono bg-blue-100 dark:bg-blue-900/50 px-1 py-0.5 rounded text-[10px]">repo</code> scope.
                        Your token is used only in-memory and never stored.
                      </p>
                      <a
                        href="https://github.com/settings/tokens/new?scopes=repo,read:user&description=Eventra+Workspace+Bootstrap"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold mt-1"
                      >
                        <ExternalLink size={11} /> Create a token on GitHub
                      </a>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">
                    GitHub Personal Access Token
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={token}
                      onChange={(e) => { setToken(e.target.value); setGhUser(null); setTokenError(""); }}
                      onKeyDown={(e) => { if (e.key === "Enter" && token.trim()) handleVerifyToken(); }}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                      autoComplete="off"
                      spellCheck="false"
                      aria-label="GitHub Personal Access Token"
                    />
                    <button
                      onClick={handleVerifyToken}
                      disabled={!token.trim() || tokenLoading}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                    >
                      {tokenLoading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                      Verify
                    </button>
                  </div>

                  {tokenError && (
                    <div className="flex items-center gap-2 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                      <AlertCircle size={13} />
                      {tokenError}
                    </div>
                  )}
                </div>

                {ghUser && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40"
                  >
                    <img
                      src={ghUser.avatar_url}
                      alt={ghUser.login}
                      className="w-9 h-9 rounded-full border-2 border-emerald-200 dark:border-emerald-800"
                    />
                    <div>
                      <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        ✓ Authenticated as @{ghUser.login}
                      </p>
                      <a
                        href={ghUser.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-emerald-600 hover:underline"
                      >
                        {ghUser.html_url}
                      </a>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ══ STEP 1: Configure Repo ══ */}
            {step === 1 && (
              <motion.div key="step-config"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">
                    Repository Name *
                  </label>
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => {
                      setRepoName(e.target.value);
                      setRepoNameError(validateRepoName(e.target.value));
                    }}
                    placeholder="my-hackathon-workspace"
                    className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono outline-none focus:ring-2 transition ${
                      repoNameError
                        ? "border-rose-400 focus:ring-rose-500/20"
                        : "border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                    aria-label="Repository name"
                  />
                  {repoNameError && (
                    <p className="text-[11px] text-rose-500 flex items-center gap-1.5">
                      <AlertCircle size={11} /> {repoNameError}
                    </p>
                  )}
                  {ghUser && !repoNameError && (
                    <p className="text-[11px] text-slate-400 font-mono">
                      github.com/{ghUser.login}/{repoName || "…"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">
                    Description
                  </label>
                  <textarea
                    value={repoDesc}
                    onChange={(e) => setRepoDesc(e.target.value)}
                    rows={3}
                    placeholder="Describe your hackathon project…"
                    maxLength={350}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition resize-none"
                    aria-label="Repository description"
                  />
                  <p className="text-[10px] text-slate-400 text-right">{repoDesc.length}/350</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPrivate(false)}
                    className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-bold transition ${
                      !isPrivate
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                    aria-pressed={!isPrivate}
                  >
                    <Globe size={15} /> Public
                  </button>
                  <button
                    onClick={() => setIsPrivate(true)}
                    className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-bold transition ${
                      isPrivate
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                    aria-pressed={isPrivate}
                  >
                    <Lock size={15} /> Private
                  </button>
                </div>
              </motion.div>
            )}

            {/* ══ STEP 2: Add Teammates ══ */}
            {step === 2 && (
              <motion.div key="step-team"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Add GitHub usernames of your teammates. They&apos;ll receive a collaboration invitation email.
                    {initialHandle && (
                      <span className="block mt-1 text-blue-600 dark:text-blue-400">
                        ✓ Pre-filled <strong>@{initialHandle}</strong> from the contact link.
                      </span>
                    )}
                  </p>
                </div>

                <div className="space-y-2">
                  {teammates.map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition">
                        <span className="text-slate-400 text-xs font-mono">@</span>
                        <input
                          type="text"
                          value={t}
                          onChange={(e) => updateTeammate(i, e.target.value.replace(/[^a-zA-Z0-9-]/g, ""))}
                          placeholder="github-username"
                          className="flex-1 bg-transparent text-slate-900 dark:text-white text-xs font-mono outline-none"
                          aria-label={`Teammate ${i + 1} GitHub username`}
                        />
                      </div>
                      <button
                        onClick={() => removeTeammate(i)}
                        disabled={teammates.length === 1}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label={`Remove teammate ${i + 1}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={addTeammate}
                    disabled={teammates.length >= 8}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-500 hover:border-blue-400 hover:text-blue-500 transition text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus size={13} /> Add Another Teammate
                  </button>
                </div>
              </motion.div>
            )}

            {/* ══ STEP 3: Launch ══ */}
            {step === 3 && (
              <motion.div key="step-launch"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                {/* Summary card */}
                {!result && !launching && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-linear-to-br from-blue-50 to-violet-50 dark:from-blue-900/20 dark:to-violet-900/20 border border-blue-100 dark:border-blue-800/40 space-y-2.5">
                      <h3 className="text-xs font-black text-slate-800 dark:text-white">Ready to bootstrap! 🚀</h3>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                          <FolderGit2 size={12} className="text-blue-500" />
                          <span className="font-mono font-bold">{ghUser?.login}/{repoName}</span>
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px]">
                            {isPrivate ? "Private" : "Public"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                          <BookOpen size={12} className="text-violet-500" />
                          <span>README with hackathon template</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                          <Users size={12} className="text-emerald-500" />
                          <span>{teammates.filter(Boolean).length} teammate{teammates.filter(Boolean).length !== 1 ? "s" : ""} will be invited</span>
                        </div>
                      </div>
                    </div>

                    {launchError && (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 text-[11px] text-rose-700 dark:text-rose-400">
                        <AlertCircle size={13} className="shrink-0 mt-0.5" />
                        <span>{launchError}</span>
                      </div>
                    )}

                    <button
                      onClick={handleLaunch}
                      className="w-full py-3.5 rounded-2xl bg-linear-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white text-sm font-black transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                      aria-label="Create workspace on GitHub"
                    >
                      <Rocket size={16} />
                      Create Workspace on GitHub
                    </button>
                  </div>
                )}

                {/* Progress state */}
                {launching && (
                  <div className="space-y-1 py-2">
                    {BOOTSTRAP_PHASES.map((phase) => (
                      <PhaseRow
                        key={phase.key}
                        phase={phase}
                        currentPhase={currentPhase}
                        donePhases={donePhases}
                      />
                    ))}
                  </div>
                )}

                {/* Success state */}
                {result && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="text-center py-4">
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30">
                        <Check size={24} className="text-white stroke-3" />
                      </div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        Workspace Created! 🎉
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">{result.fullName}</p>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <code className="flex-1 text-[11px] font-mono text-slate-700 dark:text-slate-300 truncate">
                        {result.cloneUrl}
                      </code>
                      <button
                        onClick={copyCloneUrl}
                        className="shrink-0 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition text-slate-500"
                        aria-label="Copy clone URL"
                      >
                        {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                      </button>
                    </div>

                    {result.collaboratorResults?.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-black uppercase text-slate-400">Teammate Invites</p>
                        {result.collaboratorResults.map((r) => (
                          <div
                            key={r.username}
                            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50"
                          >
                            <span className="text-xs font-mono text-slate-700 dark:text-slate-300">@{r.username}</span>
                            <div className="flex items-center gap-1.5">
                              <StatusIcon status={r.status} />
                              <span className={`text-[10px] font-bold ${
                                r.status === "invited"  ? "text-emerald-600 dark:text-emerald-400" :
                                r.status === "skipped"  ? "text-slate-400" :
                                                          "text-rose-500"
                              }`}>
                                {r.status === "invited"  ? "Invited"  :
                                 r.status === "skipped"  ? "Skipped"  :
                                 r.message || "Error"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <a
                      href={result.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-black transition"
                    >
                      <Github size={16} />
                      Open on GitHub
                      <ExternalLink size={13} />
                    </a>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Footer nav (only before launch step or on launch without result) ── */}
        {!result && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} /> Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={goNext}
                disabled={!canGoNext()}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                Continue <ChevronRight size={14} />
              </button>
            ) : (
              /* On the launch step, the big button is inside the body */
              <div />
            )}
          </div>
        )}

        {/* ── Close after success ── */}
        {result && (
          <div className="px-6 pb-5">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Close
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default WorkspaceBootstrapModal;
