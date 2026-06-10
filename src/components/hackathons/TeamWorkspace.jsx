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
    <div className="bg-[#0b0c16] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative text-white">
      {/* Workspace Header Panel */}
      <div className="bg-slate-900/80 px-6 py-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4 z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Users size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight">
                Active Hacking Collaboration Suite
              </h2>
              <span className="px-2 py-0.5 text-[9px] font-black tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded uppercase">
                Active Room
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Manage tasks, share announcements, brainstorm on the canvas, and chat in real-time.
            </p>
          </div>
        </div>

        {/* Real-time Connection status Pill */}
        <div className="flex items-center gap-3 self-start md:self-center">
          {connectionStatus === "connecting" && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/25 rounded-full text-xs text-amber-400 font-bold uppercase tracking-wider">
              <RefreshCw size={12} className="animate-spin" />
              <span>Connecting Stream...</span>
            </div>
          )}
          {connectionStatus === "sse" && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-xs text-emerald-400 font-bold uppercase tracking-wider">
              <Sparkles size={12} />
              <span>SSE Realtime Stream</span>
            </div>
          )}
          {connectionStatus === "polling_fallback" && (
            <div
              className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/25 rounded-full text-xs text-indigo-400 font-bold uppercase tracking-wider"
              title="Server Sent Events failed. Polling actively every 4s."
            >
              <AlertTriangle size={12} className="text-indigo-400" />
              <span>HTTP Polling Fallback</span>
            </div>
          )}

          {/* Chat Drawer Toggle */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-500/10 cursor-pointer"
          >
            <MessageSquare size={14} />
            <span>Team Chat ({chatHistory.length})</span>
          </button>
        </div>
      </div>

      {/* Tabs Subheader */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-6 py-1 flex items-center gap-4">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Left/Middle Column: Operational Checklist & Logs */}
            <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
              {/* Checklist */}
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-5 md:p-6 shadow-sm">
                <h3 className="text-sm font-extrabold text-gray-300 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <CheckCircle2 size={16} className="text-indigo-400" />
                  <span>Interactive Phase Milestone Checklist</span>
                </h3>

                {/* Add task form */}
                <form onSubmit={handleAddTask} className="flex gap-2 mb-5">
                  <input
                    type="text"
                    className="flex-1 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all placeholder-slate-500"
                    placeholder="Create a new collaborative team task..."
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    maxLength={100}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shrink-0 cursor-pointer"
                  >
                    Add Milestone
                  </button>
                </form>

                {/* Task list render */}
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
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
                        className="flex items-start gap-3 flex-1 text-left cursor-pointer"
                      >
                        <div className="mt-0.5 shrink-0">
                          {task.done ? (
                            <CheckCircle2
                              size={18}
                              className="text-emerald-500 fill-emerald-950/30"
                            />
                          ) : (
                            <div className="w-[18px] h-[18px] rounded-full border-2 border-slate-700 hover:border-indigo-500 transition-colors" />
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
                        className="p-1 text-gray-500 hover:text-red-400 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
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
                <div className="bg-black/90 border border-slate-800 rounded-2xl p-4 mt-6">
                  <div className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase mb-2 flex items-center justify-between">
                    <span>Synchronizer Fallback Console Logs</span>
                    <span className="text-gray-600 font-mono">
                      Status: Connected via short-polling
                    </span>
                  </div>
                  <div className="font-mono text-[9px] text-gray-500 space-y-1 max-h-24 overflow-y-auto pr-1">
                    {pollingLogs.slice(-6).map((log, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-indigo-600/70 shrink-0">⚡</span>
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
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-5 md:p-6 shadow-sm">
                <h3 className="text-sm font-extrabold text-gray-300 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Pin size={16} className="text-indigo-400" />
                  <span>Pinned Team Announcements</span>
                </h3>

                {/* Add Pin Form */}
                <form onSubmit={handleAddPin} className="space-y-2 mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition-all placeholder-slate-500"
                      placeholder="Pin an update to the dashboard..."
                      value={newPinText}
                      onChange={(e) => setNewPinText(e.target.value)}
                      maxLength={120}
                    />
                    <select
                      className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-indigo-400 outline-none cursor-pointer"
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
                    className="w-full py-2 bg-indigo-650/15 hover:bg-indigo-650/30 border border-indigo-500/20 text-indigo-400 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Pin Announcement
                  </button>
                </form>

                {/* Pins render */}
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {pins.map((pin) => (
                    <div
                      key={pin.id}
                      className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-2xl flex flex-col relative group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="px-2 py-0.5 text-[8px] font-black tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded uppercase">
                          {pin.tag}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-gray-600">{pin.time}</span>
                          <button
                            onClick={() => handleDeletePin(pin.id)}
                            className="p-0.5 text-gray-600 hover:text-red-400 rounded transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Unpin Announcement"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs font-medium text-gray-300 leading-relaxed">
                        {pin.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assembled Team Members */}
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-5 shadow-sm">
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">
                  Hackathon Squad
                </h4>
                <div className="space-y-2">
                  {TEAM_MEMBERS.map((member, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 bg-slate-950/60 rounded-xl border border-white/[0.02]"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-900 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
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
          <div className="h-[550px] relative">
            <InteractiveWhiteboard />
          </div>
        )}
      </div>

      {/* Slide-out Team Chat Drawer (Framer-Motion style CSS) */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-all duration-350 animate-fade-in">
          {/* Backdrop closer */}
          <div className="absolute inset-0 cursor-default" onClick={() => setIsChatOpen(false)} />

          {/* Drawer Panel Container */}
          <div className="relative w-full max-w-md h-full bg-[#07080e] border-l border-slate-800 shadow-2xl flex flex-col z-10 animate-slide-in">
            {/* Drawer Header */}
            <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="text-indigo-400" size={18} />
                <div>
                  <h3 className="text-sm font-black text-white">Live Team Channel</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                      SSE Fallback Enabled
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer bg-transparent border-none"
              >
                <X size={16} />
              </button>
            </div>

            {/* Chat History Panel */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                        <div className="text-[9px] text-gray-500 font-bold ml-1">{msg.sender}</div>
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
              className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2"
            >
              <input
                type="text"
                className="flex-1 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all placeholder-slate-500"
                placeholder="Type a team message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
              />
              <button
                type="submit"
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shrink-0 cursor-pointer flex items-center justify-center"
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
