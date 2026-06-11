import { useState, useEffect, useRef } from "react";
import {
  Users,
  CheckCircle2,
  Pin,
  MessageSquare,
  Trash2,
  Send,
  User,
  Sparkles,
  X,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-toastify";
import InteractiveWhiteboard from "./InteractiveWhiteboard";
import { logger } from "../../utils/logger";

// Initial constants removed to support real-time sync database values

const TEAM_MEMBERS = [
  { name: "Sricharan (You)", role: "Frontend Developer", status: "online" },
  { name: "Alex Rivera", role: "Backend Developer", status: "online" },
  { name: "Sophia Chen", role: "UI/UX Designer", status: "online" },
  { name: "Marcus Dupont", role: "Product Manager", status: "away" },
];

const TeamWorkspace = () => {
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' | 'whiteboard'

  // Checklist & Pins state
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [pins, setPins] = useState([]);
  const [newPinText, setNewPinText] = useState("");
  const [newPinTag, setNewPinTag] = useState("Announcement");

  // Chat Drawer State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  // Connection System (SSE with Polling Fallback)
  const [connectionStatus, setConnectionStatus] = useState("connecting"); // 'connecting' | 'sse' | 'polling_fallback'
  const [pollingLogs, setPollingLogs] = useState([]);
  const chatEndRef = useRef(null);

  // SSE Simulator & Fallback Hook
  useEffect(() => {
    let sseSource = null;
    let fallbackInterval = null;
    let idleTimeout = null;

    setConnectionStatus("connecting");
    const logPrefix = "[TeamSync]";

    function triggerPollingFallback() {
      setPollingLogs((prev) => [
        ...prev,
        "SSE connection error. Started HTTP short-polling fallback stream every 4s.",
      ]);

      const fetchState = async () => {
        try {
          const response = await fetch("/api/hackathons/team/sync", {
            method: "POST",
          });
          if (response.ok) {
            const data = await response.json();
            setTasks(data.tasks || []);
            setPins(data.pins || []);
            setChatHistory(data.chat || []);
            setPollingLogs((prev) => [
              ...prev,
              `[HTTP-Poll] Checking for team changes... Status: 200 OK`,
            ]);
          } else {
            setPollingLogs((prev) => [
              ...prev,
              `[HTTP-Poll] Fetch failed with status ${response.status}`,
            ]);
          }
        } catch (err) {
          setPollingLogs((prev) => [
            ...prev,
            `[HTTP-Poll] Fetch network error: ${err.message}`,
          ]);
        }
      };

      fetchState();
      fallbackInterval = setInterval(fetchState, 4000);
    }

    const connectStream = () => {
      setConnectionStatus("connecting");
      try {
        logger.info(`${logPrefix} Establishing real-time Server-Sent Events stream...`);
        sseSource = new EventSource("/api/hackathons/team/sync");

        sseSource.onopen = () => {
          setConnectionStatus("sse");
          logger.info(`${logPrefix} Connection opened. Realtime SSE stream active.`);
        };

        sseSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "init") {
              setTasks(data.tasks || []);
              setPins(data.pins || []);
              setChatHistory(data.chat || []);
            } else if (data.type === "tasks") {
              setTasks(data.tasks || []);
            } else if (data.type === "pins") {
              setPins(data.pins || []);
            } else if (data.type === "chat") {
              setChatHistory(data.chat || []);
            }
          } catch (e) {
            logger.error("Failed to parse SSE payload", e);
          }
        };

        sseSource.onerror = () => {
          logger.warn(
            `${logPrefix} Server-Sent Events stream interrupted. Fallback to short-polling activated.`
          );
          setConnectionStatus("polling_fallback");
          if (sseSource) sseSource.close();
          triggerPollingFallback();
        };
      } catch (e) {
        logger.error(`${logPrefix} SSE not supported by browser. Falling back to HTTP polling.`, e);
        setConnectionStatus("polling_fallback");
        triggerPollingFallback();
      }
    };

    const disconnectStream = () => {
      if (sseSource) {
        sseSource.close();
        sseSource = null;
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
        fallbackInterval = null;
      }
      setConnectionStatus("idle");
    };

    connectStream();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Close connections after 60 seconds of inactivity
        idleTimeout = setTimeout(() => {
          logger.info(`${logPrefix} Tab idle. Closing real-time connections.`);
          disconnectStream();
        }, 60000);
      } else {
        if (idleTimeout) {
          clearTimeout(idleTimeout);
          idleTimeout = null;
        }
        // Reconnect if it was closed
        if (!sseSource && !fallbackInterval) {
          logger.info(`${logPrefix} Tab active. Reconnecting real-time stream.`);
          connectStream();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      disconnectStream();
      if (idleTimeout) clearTimeout(idleTimeout);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, isChatOpen]);

  // Tasks Checklist handlers
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    try {
      const response = await fetch("/api/hackathons/team/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", text: newTaskText.trim() }),
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
        setNewTaskText("");
        toast.success("Task added to team checklist.");
      } else {
        toast.error("Failed to add task.");
      }
    } catch (err) {
      toast.error(`Network error: ${err.message}`);
    }
  };

  const handleToggleTask = async (id) => {
    try {
      const response = await fetch("/api/hackathons/team/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", id }),
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      } else {
        toast.error("Failed to toggle task.");
      }
    } catch (err) {
      toast.error(`Network error: ${err.message}`);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const response = await fetch("/api/hackathons/team/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
        toast.info("Task removed from checklist.");
      } else {
        toast.error("Failed to delete task.");
      }
    } catch (err) {
      toast.error(`Network error: ${err.message}`);
    }
  };

  // Pins / Announcements handlers
  const handleAddPin = async (e) => {
    e.preventDefault();
    if (!newPinText.trim()) return;

    try {
      const response = await fetch("/api/hackathons/team/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          text: newPinText.trim(),
          tag: newPinTag,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setPins(data.pins || []);
        setNewPinText("");
        toast.success("Announcement pinned to workspace!");
      } else {
        toast.error("Failed to pin announcement.");
      }
    } catch (err) {
      toast.error(`Network error: ${err.message}`);
    }
  };

  const handleDeletePin = async (id) => {
    try {
      const response = await fetch("/api/hackathons/team/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      if (response.ok) {
        const data = await response.json();
        setPins(data.pins || []);
        toast.info("Announcement unpinned.");
      } else {
        toast.error("Failed to unpin announcement.");
      }
    } catch (err) {
      toast.error(`Network error: ${err.message}`);
    }
  };

  // Chat message sending
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const messageText = chatMessage.trim();
    setChatMessage("");

    try {
      const response = await fetch("/api/hackathons/team/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: messageText, sender: "Sricharan (You)" }),
      });
      if (response.ok) {
        const data = await response.json();
        setChatHistory(data.chat || []);
      } else {
        toast.error("Failed to send message.");
      }
    } catch (err) {
      toast.error(`Network error: ${err.message}`);
    }
  };

  return (
    <div className="relative flex flex-col overflow-hidden rounded-3xl border border-slate-800 bg-[#0b0c16] text-white shadow-2xl">
      {/* Workspace Header Panel */}
      <div className="z-10 flex flex-col gap-4 border-b border-slate-800 bg-slate-900/80 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3 text-indigo-400">
            <Users size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight">
                Active Hacking Collaboration Suite
              </h2>
              <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black tracking-widest text-emerald-400 uppercase">
                Active Room
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-400">
              Manage tasks, share announcements, brainstorm on the canvas, and chat in real-time.
            </p>
          </div>
        </div>

        {/* Real-time Connection status Pill */}
        <div className="flex items-center gap-3 self-start md:self-center">
          {connectionStatus === "connecting" && (
            <div className="flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-bold tracking-wider text-amber-400 uppercase">
              <RefreshCw size={12} className="animate-spin" />
              <span>Connecting Stream...</span>
            </div>
          )}
          {connectionStatus === "sse" && (
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-bold tracking-wider text-emerald-400 uppercase">
              <Sparkles size={12} />
              <span>SSE Realtime Stream</span>
            </div>
          )}
          {connectionStatus === "polling_fallback" && (
            <div
              className="flex items-center gap-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3 py-1 text-xs font-bold tracking-wider text-indigo-400 uppercase"
              title="Server Sent Events failed. Polling actively every 4s."
            >
              <AlertTriangle size={12} className="text-indigo-400" />
              <span>HTTP Polling Fallback</span>
            </div>
          )}

          {/* Chat Drawer Toggle */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/10 transition hover:bg-indigo-700"
          >
            <MessageSquare size={14} />
            <span>Team Chat ({chatHistory.length})</span>
          </button>
        </div>
      </div>

      {/* Tabs Subheader */}
      <div className="flex items-center gap-4 border-b border-slate-800/80 bg-slate-950 px-6 py-1">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "dashboard"
              ? "border-indigo-500 text-indigo-400 font-extrabold"
              : "border-transparent text-gray-500 hover:text-white"
          }`}
        >
          Project Dashboard
        </button>
        <button
          onClick={() => setActiveTab("whiteboard")}
          className={`py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "whiteboard"
              ? "border-indigo-500 text-indigo-400 font-extrabold"
              : "border-transparent text-gray-500 hover:text-white"
          }`}
        >
          Interactive Canvas
        </button>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 p-6">
        {activeTab === "dashboard" ? (
          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
            {/* Left/Middle Column: Operational Checklist & Logs */}
            <div className="flex flex-col justify-between space-y-6 lg:col-span-2">
              {/* Checklist */}
              <div className="rounded-3xl border border-slate-800/60 bg-slate-900/40 p-5 shadow-sm md:p-6">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold tracking-widest text-gray-300 uppercase">
                  <CheckCircle2 size={16} className="text-indigo-400" />
                  <span>Interactive Phase Milestone Checklist</span>
                </h3>

                {/* Add task form */}
                <form onSubmit={handleAddTask} className="mb-5 flex gap-2">
                  <input
                    type="text"
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-500 transition-all outline-none hover:border-slate-700 focus:border-indigo-500"
                    placeholder="Create a new collaborative team task..."
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    maxLength={100}
                  />
                  <button
                    type="submit"
                    className="shrink-0 cursor-pointer rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold tracking-wider text-white uppercase transition-all hover:bg-indigo-700"
                  >
                    Add Milestone
                  </button>
                </form>

                {/* Task list render */}
                <div className="max-h-[220px] space-y-2.5 overflow-y-auto pr-1">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-3.5 bg-slate-950 border rounded-2xl transition-all ${
                        task.done
                          ? "border-emerald-500/10 bg-emerald-500/[0.01] text-emerald-400"
                          : "border-slate-800 text-gray-300 hover:border-slate-700"
                      }`}
                    >
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className="flex flex-1 cursor-pointer items-start gap-3 text-left"
                      >
                        <div className="mt-0.5 shrink-0">
                          {task.done ? (
                            <CheckCircle2
                              size={18}
                              className="fill-emerald-950/30 text-emerald-500"
                            />
                          ) : (
                            <div className="h-[18px] w-[18px] rounded-full border-2 border-slate-700 transition-colors hover:border-indigo-500" />
                          )}
                        </div>
                        <span
                          className={`text-xs font-semibold leading-relaxed ${task.done ? "line-through opacity-50" : ""}`}
                        >
                          {task.text}
                        </span>
                      </button>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="cursor-pointer rounded-lg p-1 text-gray-500 transition-all hover:bg-white/5 hover:text-red-400"
                        title="Delete Milestone"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time Fallback Logs Console */}
              {connectionStatus === "polling_fallback" && pollingLogs.length > 0 && (
                <div className="mt-6 rounded-2xl border border-slate-800 bg-black/90 p-4">
                  <div className="mb-2 flex items-center justify-between text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
                    <span>Synchronizer Fallback Console Logs</span>
                    <span className="font-mono text-gray-600">
                      Status: Connected via short-polling
                    </span>
                  </div>
                  <div className="max-h-24 space-y-1 overflow-y-auto pr-1 font-mono text-[9px] text-gray-500">
                    {pollingLogs.slice(-6).map((log, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="shrink-0 text-indigo-600/70">⚡</span>
                        <span className="break-all">{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Pinned Announcements & Team info */}
            <div className="space-y-6">
              {/* Pins announcements list */}
              <div className="rounded-3xl border border-slate-800/60 bg-slate-900/40 p-5 shadow-sm md:p-6">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold tracking-widest text-gray-300 uppercase">
                  <Pin size={16} className="text-indigo-400" />
                  <span>Pinned Team Announcements</span>
                </h3>

                {/* Add Pin Form */}
                <form onSubmit={handleAddPin} className="mb-4 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 transition-all outline-none hover:border-slate-700 focus:border-indigo-500"
                      placeholder="Pin an update to the dashboard..."
                      value={newPinText}
                      onChange={(e) => setNewPinText(e.target.value)}
                      maxLength={120}
                    />
                    <select
                      className="cursor-pointer rounded-xl border border-slate-800 bg-slate-950 px-2 py-2 text-xs text-indigo-400 outline-none"
                      value={newPinTag}
                      onChange={(e) => setNewPinTag(e.target.value)}
                    >
                      <option>Announcement</option>
                      <option>Deadline</option>
                      <option>Mentor Note</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="bg-indigo-650/15 hover:bg-indigo-650/30 w-full cursor-pointer rounded-xl border border-indigo-500/20 py-2 text-xs font-bold tracking-wider text-indigo-400 uppercase transition-all"
                  >
                    Pin Announcement
                  </button>
                </form>

                {/* Pins render */}
                <div className="max-h-[220px] space-y-3 overflow-y-auto pr-1">
                  {pins.map((pin) => (
                    <div
                      key={pin.id}
                      className="group relative flex flex-col rounded-2xl border border-slate-800/80 bg-slate-950 p-3.5"
                    >
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="rounded border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[8px] font-black tracking-widest text-indigo-400 uppercase">
                          {pin.tag}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-gray-600">{pin.time}</span>
                          <button
                            onClick={() => handleDeletePin(pin.id)}
                            className="cursor-pointer rounded p-0.5 text-gray-600 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
                            title="Unpin Announcement"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed font-medium text-gray-300">
                        {pin.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assembled Team Members */}
              <div className="rounded-3xl border border-slate-800/60 bg-slate-900/40 p-5 shadow-sm">
                <h4 className="mb-3 text-xs font-black tracking-widest text-gray-500 uppercase">
                  Hackathon Squad
                </h4>
                <div className="space-y-2">
                  {TEAM_MEMBERS.map((member, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-white/[0.02] bg-slate-950/60 p-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-indigo-500/20 bg-slate-900 text-xs font-bold text-indigo-400">
                          <User size={12} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-200">{member.name}</div>
                          <div className="text-[9px] text-gray-500">{member.role}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${member.status === "online" ? "bg-emerald-500" : "bg-amber-500"}`}
                        />
                        <span className="text-[9px] text-gray-500 capitalize">{member.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Interactive Whiteboard Tab */
          <div className="relative h-[550px]">
            <InteractiveWhiteboard />
          </div>
        )}
      </div>

      {/* Slide-out Team Chat Drawer (Framer-Motion style CSS) */}
      {isChatOpen && (
        <div className="animate-fade-in fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-all duration-350">
          {/* Backdrop closer */}
          <div className="absolute inset-0 cursor-default" onClick={() => setIsChatOpen(false)} />

          {/* Drawer Panel Container */}
          <div className="animate-slide-in relative z-10 flex h-full w-full max-w-md flex-col border-l border-slate-800 bg-[#07080e] shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="text-indigo-400" size={18} />
                <div>
                  <h3 className="text-sm font-black text-white">Live Team Channel</h3>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">
                      SSE Fallback Enabled
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="cursor-pointer rounded-full border-none bg-transparent p-2 text-gray-400 transition-all hover:bg-white/10 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Chat History Panel */}
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {chatHistory.map((msg, i) => {
                const isMe = msg.sender.includes("You");
                return (
                  <div
                    key={i}
                    className={`flex gap-3 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : ""}`}
                  >
                    {/* Member Avatar */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                        isMe
                          ? "bg-purple-950 border-purple-500/20 text-purple-400"
                          : "bg-indigo-950 border-indigo-500/20 text-indigo-400"
                      }`}
                    >
                      <User size={12} />
                    </div>
                    {/* Speech Balloon */}
                    <div className="space-y-1">
                      {!isMe && (
                        <div className="ml-1 text-[9px] font-bold text-gray-500">{msg.sender}</div>
                      )}
                      <div
                        className={`px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? "bg-indigo-650 text-white rounded-tr-none"
                            : "bg-slate-900 text-gray-250 border border-slate-800/80 rounded-tl-none"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <div
                        className={`text-[8px] text-gray-600 ${isMe ? "text-right mr-1" : "ml-1"}`}
                      >
                        {msg.time}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Send Form */}
            <form
              onSubmit={handleSendMessage}
              className="flex gap-2 border-t border-slate-800 bg-slate-900 p-4"
            >
              <input
                type="text"
                className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-500 transition-all outline-none hover:border-slate-700 focus:border-indigo-500"
                placeholder="Type a team message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
              />
              <button
                type="submit"
                className="flex shrink-0 cursor-pointer items-center justify-center rounded-xl bg-indigo-600 p-2.5 text-white transition-all hover:bg-indigo-700"
                aria-label="Send Message"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamWorkspace;
