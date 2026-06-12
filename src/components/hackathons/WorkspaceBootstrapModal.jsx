import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Github,
  Rocket,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  Lock,
  Globe,
  ExternalLink,
  Copy,
  Users,
  KeyRound,
  FolderGit2,
  BookOpen,
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
  { id: "config", label: "Configure Repo", icon: FolderGit2 },
  { id: "team", label: "Add Teammates", icon: Users },
  { id: "launch", label: "Launch", icon: Rocket },
];

const BOOTSTRAP_PHASES = [
  { key: "validating", label: "Verifying GitHub token…" },
  { key: "creating_repo", label: "Creating repository…" },
  { key: "pushing_readme", label: "Scaffolding README…" },
  { key: "inviting", label: "Inviting teammates…" },
  { key: "done", label: "Workspace ready!" },
];

// ─── Small helpers ────────────────────────────────────────────────────────────
const StatusIcon = ({ status }) => {
  if (status === "invited") return <Check size={14} className="text-emerald-500" />;
  if (status === "skipped") return <Check size={14} className="text-slate-400" />;
  if (status === "error") return <AlertCircle size={14} className="text-rose-500" />;
  return null;
};

const PhaseRow = ({ phase, currentPhase, donePhases }) => {
  const isDone = donePhases.includes(phase.key);
  const isActive = currentPhase === phase.key;
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-all duration-300 ${
        isActive ? "bg-blue-50 dark:bg-blue-900/20" : ""
      }`}
    >
      <div className="flex h-5 w-5 shrink-0 items-center justify-center">
        {isDone ? (
          <Check size={14} className="stroke-[3] text-emerald-500" />
        ) : isActive ? (
          <Loader2 size={14} className="animate-spin text-blue-500" />
        ) : (
          <div className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-700" />
        )}
      </div>
      <span
        className={`text-xs font-medium ${
          isDone
            ? "text-emerald-600 line-through opacity-70 dark:text-emerald-400"
            : isActive
              ? "font-bold text-blue-600 dark:text-blue-400"
              : "text-slate-400 dark:text-slate-600"
        }`}
      >
        {phase.label}
      </span>
    </div>
  );
};

// ─── Main modal ───────────────────────────────────────────────────────────────
const WorkspaceBootstrapModal = ({ team, onClose }) => {
  /* ── Step state ── */
  const [step, setStep] = useState(0);

  /* ── Step 1: Connect ── */
  const [token, setToken] = useState("");
  const [tokenError, setTokenError] = useState("");
  const [tokenLoading, setTokenLoading] = useState(false);
  const [ghUser, setGhUser] = useState(null); // { login, avatar_url, html_url }

  /* ── Step 2: Config ── */
  const defaultRepoName = slugifyRepoName(`${team?.hackathon || "hackathon"}-team-workspace`);
  const [repoName, setRepoName] = useState(defaultRepoName);
  const [repoDesc, setRepoDesc] = useState(team?.idea ? team.idea.slice(0, 120) : "");
  const [isPrivate, setIsPrivate] = useState(false);
  const [repoNameError, setRepoNameError] = useState("");

  /* ── Step 3: Teammates ── */
  const initialHandle = extractGitHubUsername(team?.contact) || "";
  const [teammates, setTeammates] = useState(initialHandle ? [initialHandle] : [""]);

  /* ── Step 4: Launch ── */
  const [currentPhase, setCurrentPhase] = useState("");
  const [donePhases, setDonePhases] = useState([]);
  const [launching, setLaunching] = useState(false);
  const [result, setResult] = useState(null); // success result
  const [launchError, setLaunchError] = useState("");
  const [copied, setCopied] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handle = (e) => {
      if (e.key === "Escape") onClose();
    };
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
  const addTeammate = () => setTeammates((p) => [...p, ""]);
  const removeTeammate = (i) => setTeammates((p) => p.filter((_, idx) => idx !== i));
  const updateTeammate = (i, val) => setTeammates((p) => p.map((t, idx) => (idx === i ? val : t)));

  // ── Navigation guards ──
  const canGoNext = () => {
    if (step === 0) return !!ghUser;
    if (step === 1) return repoName.trim() !== "" && !repoNameError;
    return true;
  };

  const goNext = () => {
    if (step === 1) {
      const err = validateRepoName(repoName.trim());
      if (err) {
        setRepoNameError(err);
        return;
      }
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
          repoName: repoName.trim(),
          description: repoDesc.trim(),
          isPrivate,
          hackathonName: team?.hackathon || "Hackathon",
          projectIdea: team?.idea || "",
          teammates: teammates.map((t) => t.trim()).filter(Boolean),
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
      className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Bootstrap Team Workspace"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-md">
              <Rocket size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm leading-tight font-black text-slate-900 dark:text-white">
                Bootstrap Team Workspace
              </h2>
              <p className="text-[10px] font-medium text-slate-400">
                {team?.hackathon || "Hackathon"} · with {team?.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Step indicator ── */}
        <div className="flex items-center gap-0 border-b border-slate-100 bg-slate-50 px-6 py-3 dark:border-slate-800 dark:bg-slate-950/50">
          {STEPS.map((s, i) => {
            const isActive = i === step;
            const isComplete = i < step;
            const Icon = s.icon;
            return (
              <div key={s.id} className="flex min-w-0 flex-1 items-center">
                <div
                  className={`flex min-w-0 items-center gap-1.5 ${isActive ? "flex-shrink-0" : ""}`}
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-black transition-all ${
                      isComplete
                        ? "bg-emerald-500 text-white"
                        : isActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                          : "bg-slate-200 text-slate-400 dark:bg-slate-800"
                    }`}
                  >
                    {isComplete ? <Check size={11} className="stroke-[3]" /> : <Icon size={11} />}
                  </div>
                  {isActive && (
                    <span className="truncate text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      {s.label}
                    </span>
                  )}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`mx-2 h-px flex-1 transition-all ${isComplete ? "bg-emerald-400" : "bg-slate-200 dark:bg-slate-700"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Body ── */}
        <div className="max-h-[60vh] space-y-4 overflow-y-auto px-6 py-5">
          <AnimatePresence mode="wait">
            {/* ══ STEP 0: Connect GitHub ══ */}
            {step === 0 && (
              <motion.div
                key="step-connect"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-800/40 dark:bg-blue-900/20">
                  <div className="flex items-start gap-3">
                    <Github
                      size={18}
                      className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400"
                    />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-blue-800 dark:text-blue-300">
                        Connect your GitHub account
                      </p>
                      <p className="text-[11px] leading-relaxed text-blue-700/80 dark:text-blue-400/80">
                        Enter a Personal Access Token (Classic) with{" "}
                        <code className="rounded bg-blue-100 px-1 py-0.5 font-mono text-[10px] dark:bg-blue-900/50">
                          repo
                        </code>{" "}
                        scope. Your token is used only in-memory and never stored.
                      </p>
                      <a
                        href="https://github.com/settings/tokens/new?scopes=repo,read:user&description=Eventra+Workspace+Bootstrap"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline dark:text-blue-400"
                      >
                        <ExternalLink size={11} /> Create a token on GitHub
                      </a>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">
                    GitHub Personal Access Token
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={token}
                      onChange={(e) => {
                        setToken(e.target.value);
                        setGhUser(null);
                        setTokenError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && token.trim()) handleVerifyToken();
                      }}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-mono text-xs text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      autoComplete="off"
                      spellCheck="false"
                      aria-label="GitHub Personal Access Token"
                    />
                    <button
                      onClick={handleVerifyToken}
                      disabled={!token.trim() || tokenLoading}
                      className="flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {tokenLoading ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Check size={13} />
                      )}
                      Verify
                    </button>
                  </div>

                  {tokenError && (
                    <div className="flex items-center gap-2 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                      <AlertCircle size={13} />
                      {tokenError}
                    </div>
                  )}
                </div>

                {ghUser && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800/40 dark:bg-emerald-900/20"
                  >
                    <img
                      src={ghUser.avatar_url}
                      alt={ghUser.login}
                      className="h-9 w-9 rounded-full border-2 border-emerald-200 dark:border-emerald-800"
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
              <motion.div
                key="step-config"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">
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
                    className={`w-full rounded-xl border bg-white px-4 py-2.5 font-mono text-xs text-slate-900 transition outline-none focus:ring-2 dark:bg-slate-950 dark:text-white ${
                      repoNameError
                        ? "border-rose-400 focus:ring-rose-500/20"
                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 dark:border-slate-800"
                    }`}
                    aria-label="Repository name"
                  />
                  {repoNameError && (
                    <p className="flex items-center gap-1.5 text-[11px] text-rose-500">
                      <AlertCircle size={11} /> {repoNameError}
                    </p>
                  )}
                  {ghUser && !repoNameError && (
                    <p className="font-mono text-[11px] text-slate-400">
                      github.com/{ghUser.login}/{repoName || "…"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">
                    Description
                  </label>
                  <textarea
                    value={repoDesc}
                    onChange={(e) => setRepoDesc(e.target.value)}
                    rows={3}
                    placeholder="Describe your hackathon project…"
                    maxLength={350}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    aria-label="Repository description"
                  />
                  <p className="text-right text-[10px] text-slate-400">{repoDesc.length}/350</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPrivate(false)}
                    className={`flex flex-1 items-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold transition ${
                      !isPrivate
                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                    }`}
                    aria-pressed={!isPrivate}
                  >
                    <Globe size={15} /> Public
                  </button>
                  <button
                    onClick={() => setIsPrivate(true)}
                    className={`flex flex-1 items-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold transition ${
                      isPrivate
                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
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
              <motion.div
                key="step-team"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700/60 dark:bg-slate-800/60">
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                    Add GitHub usernames of your teammates. They&apos;ll receive a collaboration
                    invitation email.
                    {initialHandle && (
                      <span className="mt-1 block text-blue-600 dark:text-blue-400">
                        ✓ Pre-filled <strong>@{initialHandle}</strong> from the contact link.
                      </span>
                    )}
                  </p>
                </div>

                <div className="space-y-2">
                  {teammates.map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950">
                        <span className="font-mono text-xs text-slate-400">@</span>
                        <input
                          type="text"
                          value={t}
                          onChange={(e) =>
                            updateTeammate(i, e.target.value.replace(/[^a-zA-Z0-9-]/g, ""))
                          }
                          placeholder="github-username"
                          className="flex-1 bg-transparent font-mono text-xs text-slate-900 outline-none dark:text-white"
                          aria-label={`Teammate ${i + 1} GitHub username`}
                        />
                      </div>
                      <button
                        onClick={() => removeTeammate(i)}
                        disabled={teammates.length === 1}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-rose-900/20"
                        aria-label={`Remove teammate ${i + 1}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={addTeammate}
                    disabled={teammates.length >= 8}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-2.5 text-xs font-bold text-slate-500 transition hover:border-blue-400 hover:text-blue-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800"
                  >
                    <Plus size={13} /> Add Another Teammate
                  </button>
                </div>
              </motion.div>
            )}

            {/* ══ STEP 3: Launch ══ */}
            {step === 3 && (
              <motion.div
                key="step-launch"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                {/* Summary card */}
                {!result && !launching && (
                  <div className="space-y-3">
                    <div className="space-y-2.5 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-violet-50 p-4 dark:border-blue-800/40 dark:from-blue-900/20 dark:to-violet-900/20">
                      <h3 className="text-xs font-black text-slate-800 dark:text-white">
                        Ready to bootstrap! 🚀
                      </h3>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                          <FolderGit2 size={12} className="text-blue-500" />
                          <span className="font-mono font-bold">
                            {ghUser?.login}/{repoName}
                          </span>
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] dark:bg-slate-800">
                            {isPrivate ? "Private" : "Public"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                          <BookOpen size={12} className="text-violet-500" />
                          <span>README with hackathon template</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                          <Users size={12} className="text-emerald-500" />
                          <span>
                            {teammates.filter(Boolean).length} teammate
                            {teammates.filter(Boolean).length !== 1 ? "s" : ""} will be invited
                          </span>
                        </div>
                      </div>
                    </div>

                    {launchError && (
                      <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[11px] text-rose-700 dark:border-rose-800/40 dark:bg-rose-900/20 dark:text-rose-400">
                        <AlertCircle size={13} className="mt-0.5 shrink-0" />
                        <span>{launchError}</span>
                      </div>
                    )}

                    <button
                      onClick={handleLaunch}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-700 hover:to-violet-700"
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
                    <div className="py-4 text-center">
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30">
                        <Check size={24} className="stroke-[3] text-white" />
                      </div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        Workspace Created! 🎉
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">{result.fullName}</p>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800">
                      <code className="flex-1 truncate font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        {result.cloneUrl}
                      </code>
                      <button
                        onClick={copyCloneUrl}
                        className="shrink-0 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-200 dark:hover:bg-slate-700"
                        aria-label="Copy clone URL"
                      >
                        {copied ? (
                          <Check size={13} className="text-emerald-500" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    </div>

                    {result.collaboratorResults?.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase">
                          Teammate Invites
                        </p>
                        {result.collaboratorResults.map((r) => (
                          <div
                            key={r.username}
                            className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-700/50 dark:bg-slate-800/60"
                          >
                            <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                              @{r.username}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <StatusIcon status={r.status} />
                              <span
                                className={`text-[10px] font-bold ${
                                  r.status === "invited"
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : r.status === "skipped"
                                      ? "text-slate-400"
                                      : "text-rose-500"
                                }`}
                              >
                                {r.status === "invited"
                                  ? "Invited"
                                  : r.status === "skipped"
                                    ? "Skipped"
                                    : r.message || "Error"}
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
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-sm font-black text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
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
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-slate-800">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ChevronLeft size={14} /> Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={goNext}
                disabled={!canGoNext()}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
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
              className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
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
