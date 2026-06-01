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
  ChevronRight
} from "lucide-react";
import confetti from "canvas-confetti";
import TeamWorkspace from "../../components/hackathons/TeamWorkspace";

const PHASES = [
  {
    id: 1,
    name: "Ideation & Planning",
    status: "completed",
    description: "Brainstorming themes, setting up rules, securing sponsors, and assembling core mentor teams.",
    icon: Terminal,
    color: "from-blue-500 to-cyan-500",
    tasks: [
      { id: "p1", text: "Finalize event themes and tracks", done: true },
      { id: "p2", text: "Secure sponsor packages and hardware resources", done: true },
      { id: "p3", text: "Create marketing website and initial landing assets", done: true },
      { id: "p4", text: "Draft comprehensive rules & code of conduct", done: true }
    ],
    resources: [
      { name: "Organizer Handbook.pdf", type: "PDF", size: "2.4 MB" },
      { name: "Sponsor Pitch Template.key", type: "Slides", size: "12.1 MB" }
    ]
  },
  {
    id: 2,
    name: "Registration & Team Formation",
    status: "active",
    description: "Accepting participant registrations, hosting team networking mixers, and reviewing applications.",
    icon: Users,
    color: "from-indigo-500 to-purple-500",
    tasks: [
      { id: "t1", text: "Launch participant registration form", done: true },
      { id: "t2", text: "Host virtual team matching mixer on Discord", done: true },
      { id: "t3", text: "Approve pending applications (Current: 432 approved)", done: false },
      { id: "t4", text: "Release mentor and judging sign-up forms", done: false }
    ],
    resources: [
      { name: "Team_Formation_Guide.md", type: "Markdown", size: "12 KB" },
      { name: "Eventra Discord Invite Link", type: "External Link", size: "N/A" }
    ]
  },
  {
    id: 3,
    name: "Active Hacking Phase",
    status: "upcoming",
    description: "The main coding phase! 48 hours of building, workshops, mentor ticketing, and midnight snacks.",
    icon: Zap,
    color: "from-amber-500 to-rose-500",
    tasks: [
      { id: "h1", text: "Opening ceremony keynotes & track announcements", done: false },
      { id: "h2", text: "Open the mentor support ticketing queue", done: false },
      { id: "h3", text: "Midnight mini-games & wellness check-ins", done: false },
      { id: "h4", text: "Host Git & deployment troubleshooting workshop", done: false }
    ],
    resources: [
      { name: "API_Starter_Boilerplates.zip", type: "ZIP", size: "15.4 MB" },
      { name: "Mentor ticketing dashboard login", type: "External", size: "N/A" }
    ]
  },
  {
    id: 4,
    name: "Project Submission & Judging",
    status: "upcoming",
    description: "Locking code submissions, routing projects to judges, and scoring based on innovation & design.",
    icon: FileText,
    color: "from-pink-500 to-red-500",
    tasks: [
      { id: "s1", text: "Lock devpost and github submissions", done: false },
      { id: "s2", text: "Auto-assign judging assignments using scoring algorithm", done: false },
      { id: "s3", text: "Submit final peer review scoring rubrics", done: false },
      { id: "s4", text: "Aggregate scoreboard & flag anomaly ratings", done: false }
    ],
    resources: [
      { name: "Judging_Rubric_v1.0.pdf", type: "PDF", size: "1.1 MB" },
      { name: "Devpost submission tutorial", type: "Video Link", size: "4 mins" }
    ]
  },
  {
    id: 5,
    name: "Winners Showcase & Closure",
    status: "upcoming",
    description: "Stellar closing ceremony, live winner project demos, distributing prizes, and sponsor matching.",
    icon: Award,
    color: "from-emerald-500 to-teal-500",
    tasks: [
      { id: "w1", text: "Host live final 5 project pitches", done: false },
      { id: "w2", text: "Announce gold, silver, bronze and sponsor track winners", done: false },
      { id: "w3", text: "Send digital participant completion badges (NFTs)", done: false },
      { id: "w4", text: "Publish post-event summary newsletter and feedback loop", done: false }
    ],
    resources: [
      { name: "Prizes_Claim_Instructions.pdf", type: "PDF", size: "850 KB" }
    ]
  }
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
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text py-20 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-border pb-8">
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold text-sm tracking-wide uppercase">
              <Shield className="w-4 h-4" />
              Eventra Organizer Hub
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mt-2 bg-clip-text text-transparent bg-gradient-to-r from-text to-primary">
              Hackathon Lifecycle
            </h1>
            <p className="text-text-light mt-2 max-w-xl text-base">
              Track the current execution stage, organize phase tasks, fetch resources, and simulate real-time workflow phases below.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOrganizerMode(!isOrganizerMode)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 border shadow-sm ${
                isOrganizerMode
                  ? "bg-primary border-primary text-white hover:opacity-90"
                  : "bg-card-bg border-border text-text-light hover:bg-bg"
              }`}
            >
              <Settings className="w-4 h-4" />
              {isOrganizerMode ? "Exit Organizer Controls" : "Organizer Simulator Mode"}
            </button>
          </div>
        </div>

        {/* ORGANIZER SIMULATOR CONTROL DECK */}
        {isOrganizerMode && (
          <div className="p-6 rounded-2xl border border-primary/30 bg-primary/10 backdrop-blur-md transition-all">
            <div className="flex items-center gap-2 text-primary font-bold mb-4">
              <Settings className="w-5 h-5 animate-spin" style={{ animationDuration: "6s" }} />
              Organizer Phase Command Board
            </div>
            <p className="text-sm text-primary/80 mb-6">
              Simulate operational transition changes between phases to test real-time state updates across the participant portal.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {phasesList.map((phase, idx) => (
                <button
                  key={phase.id}
                  onClick={() => setGlobalActivePhase(idx)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    activePhaseIndex === idx
                      ? "bg-primary text-white border-primary shadow-glow-sm font-bold"
                      : "bg-card-bg border-border text-text-light hover:bg-bg"
                  }`}
                >
                  <div className="text-xs uppercase tracking-widest text-text-light/60 mb-1">
                    Phase {phase.id}
                  </div>
                  <div className="text-sm font-semibold truncate">{phase.name.split(" ")[0]}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* THE LIFECYCLE TIMELINE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {phasesList.map((phase, idx) => {
            const PhaseIcon = phase.icon;
            const isActive = activePhaseIndex === idx;
            const isCompleted = idx < activePhaseIndex;
            const isSelected = selectedPhaseId === phase.id;

            return (
              <button
                key={phase.id}
                onClick={() => setSelectedPhaseId(phase.id)}
                className={`relative p-5 rounded-2xl border text-left transition-all duration-300 ${
                  isSelected
                    ? "bg-card-bg border-primary shadow-xl ring-2 ring-primary/20"
                    : "bg-card-bg/60 border-border hover:border-primary/50 shadow-sm"
                }`}
                aria-current={isActive ? "step" : undefined}
              >
                {/* Active/Completed Indicators */}
                <div className="absolute top-4 right-4">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                  ) : isActive ? (
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/70 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                  ) : (
                    <Lock className="w-4 h-4 text-text-light" />
                  )}
                </div>

                <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${phase.color} text-white mb-4`}>
                  <PhaseIcon className="w-5 h-5" />
                </div>

                <h3 className="font-bold text-sm text-text-light uppercase tracking-widest">
                  Phase {phase.id}
                </h3>
                
                <h2 className="font-extrabold text-base tracking-tight mt-1 text-text">
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
                  <ChevronRight className="w-3 h-3 text-text-light" />
                </div>
              </button>
            );
          })}
        </div>

        {/* SELECTED PHASE WORKSPACE */}
        {selectedPhase && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: PHASE OVERVIEW & RESOURCES */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* DESCRIPTION BOARD */}
              <div className="bg-card-bg border border-border rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${selectedPhase.color} text-white`}>
                    <selectedPhase.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text-light uppercase tracking-wider">
                      Phase {selectedPhase.id}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-text mt-0.5">
                      {selectedPhase.name}
                    </h2>
                  </div>
                </div>

                <p className="text-text-light mt-5 leading-relaxed text-base">
                  {selectedPhase.description}
                </p>

                {/* Sub status bar */}
                <div className="mt-6 flex flex-wrap gap-4 items-center p-4 bg-bg/40 rounded-2xl border border-border">
                  <div className="flex items-center gap-2 text-sm text-text-light">
                    <Clock className="w-4 h-4 text-text-light/60" />
                    <strong>Timeline Status:</strong>
                    {selectedPhase.status === "completed" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        Finished
                      </span>
                    ) : selectedPhase.status === "active" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/15 text-primary">
                        Active Now
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-bg text-text-light">
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
              <div className="bg-card-bg border border-border rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-text border-b border-border pb-3">
                  📦 Phase Documents & Starter Kits
                </h3>
                <div className="mt-4 space-y-3">
                  {selectedPhase.resources && selectedPhase.resources.length > 0 ? (
                    selectedPhase.resources.map((res, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3.5 bg-bg hover:bg-card-bg rounded-2xl border border-border transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-text truncate max-w-xs sm:max-w-md">
                              {res.name}
                            </div>
                            <div className="text-xs text-text-light">
                              Format: {res.type} &bull; Size: {res.size}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-xl bg-bg hover:bg-card-bg border border-border text-xs font-bold text-primary shadow-sm"
                          aria-label={`Fetch ${res.name}`}
                        >
                          Fetch File
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 text-sm py-4 text-center">
                      No document downloads available for this phase.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: DYNAMIC COMPONENT ACTIONS / CHECKLIST */}
            <div className="space-y-6">
              
              {/* CHECKLIST */}
              <div className="bg-card-bg border border-border rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-text border-b border-border pb-3">
                  ✔️ Phase Task Checklist
                </h3>
                <p className="text-xs text-text-light mt-2 mb-4">
                  Check off finished milestones to maintain operational track records.
                </p>

                {isOrganizerMode && (
                  <form
                    onSubmit={handleAddTask}
                    className="flex gap-2 mb-5"
                  >
                    <input
                      type="text"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      placeholder="Add custom phase task..."
                      className="flex-1 min-w-0 px-3.5 py-2 rounded-xl border border-border bg-transparent text-sm text-text placeholder-text-light/60 focus:border-primary outline-none transition-colors"
                      maxLength={100}
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-primary hover:opacity-90 text-sm font-bold text-white shadow-sm transition shrink-0"
                      aria-label={`Add task to ${selectedPhase.name}`}
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
                      className={`flex w-full text-left items-start gap-3 p-3.5 rounded-2xl border transition-all ${
                        task.done
                          ? "bg-emerald-50/40 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300"
                          : "bg-bg border-border hover:border-primary/50 hover:bg-card-bg text-text"
                      }`}
                      aria-label={`${task.done ? "Mark incomplete" : "Mark complete"}: ${task.text}`}
                    >
                      <div className="mt-0.5">
                        {task.done ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-border hover:border-primary transition-colors" />
                        )}
                      </div>
                      <span className={`text-sm font-semibold leading-relaxed ${task.done ? "line-through opacity-70" : ""}`}>
                        {task.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ACTION CALLOUT CARD */}
              <div className="bg-gradient-to-br from-primary/30 to-secondary/20 rounded-3xl p-6 text-white border border-primary/20 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 opacity-10">
                  <Award className="w-48 h-48" />
                </div>
                <h3 className="text-xl font-black flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                  Fast Track Registration
                </h3>
                <p className="text-xs text-indigo-250 mt-2 leading-relaxed">
                  Join the current Hackathon as an active participant to start pitching dynamic concepts and secure your place.
                </p>
                <div className="mt-6 flex flex-col gap-2.5">
                  <Link
                    to="/host-hackathon"
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 px-5 py-3 text-sm font-bold shadow-sm transition"
                  >
                    Host Your Own
                    <ArrowRight className="w-4 h-4 text-slate-700" />
                  </Link>
                  <Link
                    to="/hackathons"
                    className="w-full inline-flex items-center justify-center rounded-2xl border border-primary/50 bg-transparent hover:bg-primary/10 text-white px-5 py-3 text-sm font-bold transition"
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
