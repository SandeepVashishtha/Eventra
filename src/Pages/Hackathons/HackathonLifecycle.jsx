import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Award,
  Terminal,
  FileText,
  Settings,
  Lock,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Zap,
  ChevronRight,
} from "lucide-react";
import confetti from "canvas-confetti";
import TeamWorkspace from "../../components/hackathons/TeamWorkspace";

const PHASES = [
  {
    id: 1,
    name: "Ideation & Planning",
    status: "completed",
    description:
      "Brainstorming themes, setting up rules, securing sponsors, and assembling core mentor teams.",
    icon: Terminal,
    color: "from-blue-500 to-cyan-500",
    tasks: [
      { id: "p1", text: "Finalize event themes and tracks", done: true },
      { id: "p2", text: "Secure sponsor packages and hardware resources", done: true },
      { id: "p3", text: "Create marketing website and initial landing assets", done: true },
      { id: "p4", text: "Draft comprehensive rules & code of conduct", done: true },
    ],
    resources: [
      { name: "Organizer Handbook.pdf", type: "PDF", size: "2.4 MB" },
      { name: "Sponsor Pitch Template.key", type: "Slides", size: "12.1 MB" },
    ],
  },
  {
    id: 2,
    name: "Registration & Team Formation",
    status: "active",
    description:
      "Accepting participant registrations, hosting team networking mixers, and reviewing applications.",
    icon: Users,
    color: "from-indigo-500 to-purple-500",
    tasks: [
      { id: "t1", text: "Launch participant registration form", done: true },
      { id: "t2", text: "Host virtual team matching mixer on Discord", done: true },
      { id: "t3", text: "Approve pending applications (Current: 432 approved)", done: false },
      { id: "t4", text: "Release mentor and judging sign-up forms", done: false },
    ],
    resources: [
      { name: "Team_Formation_Guide.md", type: "Markdown", size: "12 KB" },
      { name: "Eventra Discord Invite Link", type: "External Link", size: "N/A" },
    ],
  },
  {
    id: 3,
    name: "Active Hacking Phase",
    status: "upcoming",
    description:
      "The main coding phase! 48 hours of building, workshops, mentor ticketing, and midnight snacks.",
    icon: Zap,
    color: "from-amber-500 to-rose-500",
    tasks: [
      { id: "h1", text: "Opening ceremony keynotes & track announcements", done: false },
      { id: "h2", text: "Open the mentor support ticketing queue", done: false },
      { id: "h3", text: "Midnight mini-games & wellness check-ins", done: false },
      { id: "h4", text: "Host Git & deployment troubleshooting workshop", done: false },
    ],
    resources: [
      { name: "API_Starter_Boilerplates.zip", type: "ZIP", size: "15.4 MB" },
      { name: "Mentor ticketing dashboard login", type: "External", size: "N/A" },
    ],
  },
  {
    id: 4,
    name: "Project Submission & Judging",
    status: "upcoming",
    description:
      "Locking code submissions, routing projects to judges, and scoring based on innovation & design.",
    icon: FileText,
    color: "from-pink-500 to-red-500",
    tasks: [
      { id: "s1", text: "Lock devpost and github submissions", done: false },
      { id: "s2", text: "Auto-assign judging assignments using scoring algorithm", done: false },
      { id: "s3", text: "Submit final peer review scoring rubrics", done: false },
      { id: "s4", text: "Aggregate scoreboard & flag anomaly ratings", done: false },
    ],
    resources: [
      { name: "Judging_Rubric_v1.0.pdf", type: "PDF", size: "1.1 MB" },
      { name: "Devpost submission tutorial", type: "Video Link", size: "4 mins" },
    ],
  },
  {
    id: 5,
    name: "Winners Showcase & Closure",
    status: "upcoming",
    description:
      "Stellar closing ceremony, live winner project demos, distributing prizes, and sponsor matching.",
    icon: Award,
    color: "from-emerald-500 to-teal-500",
    tasks: [
      { id: "w1", text: "Host live final 5 project pitches", done: false },
      { id: "w2", text: "Announce gold, silver, bronze and sponsor track winners", done: false },
      { id: "w3", text: "Send digital participant completion badges (NFTs)", done: false },
      { id: "w4", text: "Publish post-event summary newsletter and feedback loop", done: false },
    ],
    resources: [{ name: "Prizes_Claim_Instructions.pdf", type: "PDF", size: "850 KB" }],
  },
];

const HackathonLifecycle = () => {
  // Mock Active Phase Management
  const [activePhaseIndex, setActivePhaseIndex] = useState(1); // Defaults to registration
  const [selectedPhaseId, setSelectedPhaseId] = useState(2); // Selected phase to view
  const [phasesList, setPhasesList] = useState(PHASES);
  const [isOrganizerMode, setIsOrganizerMode] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");

  const selectedPhase = phasesList.find((p) => p.id === selectedPhaseId);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask = {
      id: `custom-${Date.now()}`,
      text: newTaskText.trim(),
      done: false,
    };

    setPhasesList(
      phasesList.map((phase) => {
        if (phase.id === selectedPhaseId) {
          return {
            ...phase,
            tasks: [...phase.tasks, newTask],
          };
        }
        return phase;
      })
    );

    setNewTaskText("");
  };

  // Toggle dynamic checklist tasks
  const toggleTask = (phaseId, taskId) => {
    setPhasesList(
      phasesList.map((phase) => {
        if (phase.id === phaseId) {
          return {
            ...phase,
            tasks: phase.tasks.map((task) =>
              task.id === taskId ? { ...task, done: !task.done } : task
            ),
          };
        }
        return phase;
      })
    );
  };

  // Change overall active phase (organizer simulation)
  const setGlobalActivePhase = (index) => {
    setActivePhaseIndex(index);
    setPhasesList(
      phasesList.map((phase, idx) => {
        let status = "upcoming";
        if (idx < index) status = "completed";
        else if (idx === index) status = "active";
        return { ...phase, status };
      })
    );
    setSelectedPhaseId(index + 1);

    if (index === 4) {
      // Trigger confetti celebration on final phase!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="bg-bg text-text min-h-screen px-4 py-20 transition-colors duration-300 md:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        {/* HEADER SECTION */}
        <div className="border-border flex flex-col gap-6 border-b pb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-primary flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
              <Shield className="h-4 w-4" />
              Eventra Organizer Hub
            </div>
            <h1 className="from-text to-primary mt-2 bg-gradient-to-r bg-clip-text text-4xl font-black tracking-tight text-transparent md:text-5xl">
              Hackathon Lifecycle
            </h1>
            <p className="text-text-light mt-2 max-w-xl text-base">
              Track the current execution stage, organize phase tasks, fetch resources, and simulate
              real-time workflow phases below.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOrganizerMode(!isOrganizerMode)}
              className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 ${
                isOrganizerMode
                  ? "bg-primary border-primary text-white hover:opacity-90"
                  : "bg-card-bg border-border text-text-light hover:bg-bg"
              }`}
            >
              <Settings className="h-4 w-4" />
              {isOrganizerMode ? "Exit Organizer Controls" : "Organizer Simulator Mode"}
            </button>
          </div>
        </div>

        {/* ORGANIZER SIMULATOR CONTROL DECK */}
        {isOrganizerMode && (
          <div className="border-primary/30 bg-primary/10 rounded-2xl border p-6 backdrop-blur-md transition-all">
            <div className="text-primary mb-4 flex items-center gap-2 font-bold">
              <Settings className="h-5 w-5 animate-spin" style={{ animationDuration: "6s" }} />
              Organizer Phase Command Board
            </div>
            <p className="text-primary/80 mb-6 text-sm">
              Simulate operational transition changes between phases to test real-time state updates
              across the participant portal.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {phasesList.map((phase, idx) => (
                <button
                  key={phase.id}
                  onClick={() => setGlobalActivePhase(idx)}
                  className={`rounded-xl border p-3 text-center transition-all ${
                    activePhaseIndex === idx
                      ? "bg-primary border-primary shadow-glow-sm font-bold text-white"
                      : "bg-card-bg border-border text-text-light hover:bg-bg"
                  }`}
                >
                  <div className="text-text-light/60 mb-1 text-xs tracking-widest uppercase">
                    Phase {phase.id}
                  </div>
                  <div className="truncate text-sm font-semibold">{phase.name.split(" ")[0]}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* THE LIFECYCLE TIMELINE GRID */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {phasesList.map((phase, idx) => {
            const PhaseIcon = phase.icon;
            const isActive = activePhaseIndex === idx;
            const isCompleted = idx < activePhaseIndex;
            const isSelected = selectedPhaseId === phase.id;

            return (
              <button
                key={phase.id}
                onClick={() => setSelectedPhaseId(phase.id)}
                className={`relative rounded-2xl border p-5 text-left transition-all duration-300 ${
                  isSelected
                    ? "bg-card-bg border-primary ring-primary/20 shadow-xl ring-2"
                    : "bg-card-bg/60 border-border hover:border-primary/50 shadow-sm"
                }`}
                aria-current={isActive ? "step" : undefined}
              >
                {/* Active/Completed Indicators */}
                <div className="absolute top-4 right-4">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 fill-emerald-100 text-emerald-500 dark:fill-emerald-950" />
                  ) : isActive ? (
                    <span className="relative flex h-3 w-3">
                      <span className="bg-primary/70 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                      <span className="bg-primary relative inline-flex h-3 w-3 rounded-full"></span>
                    </span>
                  ) : (
                    <Lock className="text-text-light h-4 w-4" />
                  )}
                </div>

                <div
                  className={`inline-flex rounded-xl bg-gradient-to-br p-2.5 ${phase.color} mb-4 text-white`}
                >
                  <PhaseIcon className="h-5 w-5" />
                </div>

                <h3 className="text-text-light text-sm font-bold tracking-widest uppercase">
                  Phase {phase.id}
                </h3>

                <h2 className="text-text mt-1 text-base font-extrabold tracking-tight">
                  {phase.name}
                </h2>

                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold">
                  {isCompleted ? (
                    <span className="text-emerald-600 dark:text-emerald-400">Archived</span>
                  ) : isActive ? (
                    <span className="text-primary">Current Phase</span>
                  ) : (
                    <span className="text-text-light">Locked / Upcoming</span>
                  )}
                  <ChevronRight className="text-text-light h-3 w-3" />
                </div>
              </button>
            );
          })}
        </div>

        {/* SELECTED PHASE WORKSPACE */}
        {selectedPhase && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* LEFT COLUMN: PHASE OVERVIEW & RESOURCES */}
            <div className="space-y-6 lg:col-span-2">
              {/* DESCRIPTION BOARD */}
              <div className="bg-card-bg border-border rounded-3xl border p-6 shadow-sm md:p-8">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-xl bg-gradient-to-br p-3 ${selectedPhase.color} text-white`}
                  >
                    <selectedPhase.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-text-light text-xs font-bold tracking-wider uppercase">
                      Phase {selectedPhase.id}
                    </span>
                    <h2 className="text-text mt-0.5 text-2xl font-black md:text-3xl">
                      {selectedPhase.name}
                    </h2>
                  </div>
                </div>

                <p className="text-text-light mt-5 text-base leading-relaxed">
                  {selectedPhase.description}
                </p>

                {/* Sub status bar */}
                <div className="bg-bg/40 border-border mt-6 flex flex-wrap items-center gap-4 rounded-2xl border p-4">
                  <div className="text-text-light flex items-center gap-2 text-sm">
                    <Clock className="text-text-light/60 h-4 w-4" />
                    <strong>Timeline Status:</strong>
                    {selectedPhase.status === "completed" ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        Finished
                      </span>
                    ) : selectedPhase.status === "active" ? (
                      <span className="bg-primary/15 text-primary rounded-full px-2.5 py-0.5 text-xs font-bold">
                        Active Now
                      </span>
                    ) : (
                      <span className="bg-bg text-text-light rounded-full px-2.5 py-0.5 text-xs font-bold">
                        Upcoming
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {selectedPhase.id === 3 && (
                <div className="mt-8">
                  <TeamWorkspace />
                </div>
              )}

              {/* RESOURCES & STARTER DOWNLOADS */}
              <div className="bg-card-bg border-border rounded-3xl border p-6 shadow-sm">
                <h3 className="text-text border-border border-b pb-3 text-lg font-bold">
                  📦 Phase Documents & Starter Kits
                </h3>
                <div className="mt-4 space-y-3">
                  {selectedPhase.resources && selectedPhase.resources.length > 0 ? (
                    selectedPhase.resources.map((res, i) => (
                      <div
                        key={i}
                        className="bg-bg hover:bg-card-bg border-border flex items-center justify-between rounded-2xl border p-3.5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 text-primary rounded-lg p-2">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-text max-w-xs truncate text-sm font-semibold sm:max-w-md">
                              {res.name}
                            </div>
                            <div className="text-text-light text-xs">
                              Format: {res.type} &bull; Size: {res.size}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="bg-bg hover:bg-card-bg border-border text-primary rounded-xl border px-3 py-1.5 text-xs font-bold shadow-sm"
                          aria-label="button"
                        >
                          Fetch File
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-sm text-slate-400">
                      No document downloads available for this phase.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: DYNAMIC COMPONENT ACTIONS / CHECKLIST */}
            <div className="space-y-6">
              {/* CHECKLIST */}
              <div className="bg-card-bg border-border rounded-3xl border p-6 shadow-sm">
                <h3 className="text-text border-border border-b pb-3 text-lg font-bold">
                  ✔️ Phase Task Checklist
                </h3>
                <p className="text-text-light mt-2 mb-4 text-xs">
                  Check off finished milestones to maintain operational track records.
                </p>

                {isOrganizerMode && (
                  <form onSubmit={handleAddTask} className="mb-5 flex gap-2">
                    <input
                      type="text"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      placeholder="Add custom phase task..."
                      className="border-border text-text placeholder-text-light/60 focus:border-primary min-w-0 flex-1 rounded-xl border bg-transparent px-3.5 py-2 text-sm transition-colors outline-none"
                      maxLength={100}
                    />
                    <button
                      type="submit"
                      className="bg-primary shrink-0 rounded-xl px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
                      aria-label="button"
                    >
                      Add Task
                    </button>
                  </form>
                )}

                <div className="space-y-3.5">
                  {selectedPhase.tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => toggleTask(selectedPhase.id, task.id)}
                      className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                        task.done
                          ? "border-emerald-100 bg-emerald-50/40 text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/10 dark:text-emerald-300"
                          : "bg-bg border-border hover:border-primary/50 hover:bg-card-bg text-text"
                      }`}
                    >
                      <div className="mt-0.5">
                        {task.done ? (
                          <CheckCircle2 className="h-5 w-5 fill-emerald-100 text-emerald-500 dark:fill-emerald-950" />
                        ) : (
                          <div className="border-border hover:border-primary h-5 w-5 rounded-full border-2 transition-colors" />
                        )}
                      </div>
                      <span
                        className={`text-sm leading-relaxed font-semibold ${task.done ? "line-through opacity-70" : ""}`}
                      >
                        {task.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ACTION CALLOUT CARD */}
              <div className="from-primary/30 to-secondary/20 border-primary/20 relative overflow-hidden rounded-3xl border bg-gradient-to-br p-6 text-white shadow-lg">
                <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 transform opacity-10">
                  <Award className="h-48 w-48" />
                </div>
                <h3 className="flex items-center gap-2 text-xl font-black">
                  <Zap className="h-5 w-5 fill-amber-400 text-amber-400" />
                  Fast Track Registration
                </h3>
                <p className="text-indigo-250 mt-2 text-xs leading-relaxed">
                  Join the current Hackathon as an active participant to start pitching dynamic
                  concepts and secure your place.
                </p>
                <div className="mt-6 flex flex-col gap-2.5">
                  <Link
                    to="/host-hackathon"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-slate-100"
                  >
                    Host Your Own
                    <ArrowRight className="h-4 w-4 text-slate-700" />
                  </Link>
                  <Link
                    to="/hackathons"
                    className="border-primary/50 hover:bg-primary/10 inline-flex w-full items-center justify-center rounded-2xl border bg-transparent px-5 py-3 text-sm font-bold text-white transition"
                  >
                    Browse All Hackathons
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HackathonLifecycle;
