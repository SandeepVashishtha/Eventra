import { useState, useEffect, useRef } from "react";
import {
  X,
  Briefcase,
  Mail,
  Globe,
  Linkedin,
  Twitter,
  Github,
  Send,
  User,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-toastify";
import { safeJsonParse } from "../../utils/safeJsonParse";
import { useAuth } from "../../context/AuthContext";

import ErrorBoundary from "../common/ErrorBoundary";

const VirtualBoothModal = ({ isOpen, onClose, booth }) => {
  const { user } = useAuth();
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const modalRef = useRef(null);
  const chatEndRef = useRef(null);

  const captureLead = (action) => {
    try {
      const existingLeadsStr = localStorage.getItem("eventra_sponsor_leads");
      const existingLeads = existingLeadsStr ? safeJsonParse(existingLeadsStr, []) : [];

      const newLead = {
        name: user?.name || user?.email || "Guest",
        action: action,
        contact: user?.email || "unknown",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      existingLeads.push(newLead);
      localStorage.setItem("eventra_sponsor_leads", JSON.stringify(existingLeads));
    } catch (e) {
      console.error("Failed to capture lead", e);
    }
  };

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Trap focus inside modal when open
  useEffect(() => {
    if (!isOpen) return;

    const focusableSelector =
      'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';

    const timer = setTimeout(() => {
      if (modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(focusableSelector);
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key !== "Tab" || !modalRef.current) return;

      const focusableElements = Array.from(modalRef.current.querySelectorAll(focusableSelector));
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Lock focus when modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setShowChat(false);
      setChatHistory([
        {
          id: 1,
          sender: "representative",
          text: `Hi there! Thanks for visiting the ${booth?.label || "Sponsor"} booth. How can I help you today?`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, booth]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, isTyping]);

  if (!isOpen || !booth) return null;

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    if (chatHistory.length === 1) {
      captureLead("Initiated Chat");
    }

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: chatMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setChatMessage("");
    setIsTyping(true);

    // Simulate representative response
    setTimeout(() => {
      setIsTyping(false);
      const repResponses = [
        "That's a great question! We are actually hiring for multiple developer roles currently. Have you checked out our active job openings in the Jobs tab?",
        "Awesome! Our team is focused heavily on building scalable developer tools. I'd love to connect you with our engineering lead.",
        "Thanks for reaching out! You can submit your resume directly to our jobs page or send it to my email listed under contacts.",
        "Our tech stack is primarily React, Node.js, and TypeScript. Let me know if you have any questions about our systems!",
      ];
      const randomResponse = repResponses[Math.floor(Math.random() * repResponses.length)];

      setChatHistory((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "representative",
          text: randomResponse,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 1500);
  };

  // Parse jobs
  const jobList = booth.sponsorJobs
    ? booth.sponsorJobs
        .split(",")
        .map((job) => job.trim())
        .filter(Boolean)
    : ["Software Engineer Intern", "Frontend Engineer (React)", "Developer Advocate"];

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md transition-all">
      {/* Modal Container */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booth-modal-title"
        className="relative flex max-h-[90vh] w-full max-w-2xl scale-100 transform flex-col overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-gray-900 to-slate-950 text-white shadow-2xl transition-all duration-300"
      >
        {/* Header / Banner */}
        <div className="relative flex h-32 items-end bg-gradient-to-r from-indigo-900/60 to-purple-900/60 p-6">
          <div className="bg-grid-white/[0.02] absolute inset-0" />
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 cursor-pointer rounded-full p-2 text-gray-400 transition-all hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>

          {/* Logo Badge */}
          <div className="absolute -bottom-8 left-6 flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border-2 border-indigo-500/30 bg-slate-950 bg-gradient-to-tr from-slate-900 to-indigo-950 p-2 shadow-lg">
            {booth.sponsorLogo ? (
              <img
                src={booth.sponsorLogo}
                alt={`${booth.label} logo`}
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80"; // Premium abstract pattern fallback
                }}
              />
            ) : (
              <div className="text-xl font-bold text-indigo-400">
                {booth.label?.substring(0, 2).toUpperCase() || "SP"}
              </div>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex flex-1 flex-col overflow-y-auto px-6 pt-12 pb-6">
          {!showChat ? (
            /* Information View */
            <div className="flex flex-1 flex-col gap-6 md:flex-row">
              {/* Left Column: Sponsor Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2
                      id="booth-modal-title"
                      className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-2xl font-bold tracking-tight text-transparent"
                    >
                      {booth.label}
                    </h2>
                    <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
                      Sponsor
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                    <Mail size={12} className="text-indigo-400" />
                    <span>Contact: {booth.sponsorContact || "info@sponsor.com"}</span>
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/5 p-4 text-sm leading-relaxed text-gray-300">
                  {booth.sponsorDescription ||
                    `Welcome to the ${booth.label} booth! We are thrilled to partner with Eventra to support developer innovation, local hackathons, and technology builders worldwide. Drop by our chat or look at our career listings below!`}
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-3 pt-2">
                  <a
                    href="https://example.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-white/5 p-2.5 text-gray-400 transition-all hover:border-indigo-500/20 hover:bg-indigo-500/10 hover:text-indigo-400"
                    title="Website"
                  >
                    <Globe size={16} />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-white/5 p-2.5 text-gray-400 transition-all hover:border-indigo-500/20 hover:bg-indigo-500/10 hover:text-indigo-400"
                    title="LinkedIn"
                  >
                    <Linkedin size={16} />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-white/5 p-2.5 text-gray-400 transition-all hover:border-indigo-500/20 hover:bg-indigo-500/10 hover:text-indigo-400"
                    title="Twitter"
                  >
                    <Twitter size={16} />
                  </a>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-white/5 p-2.5 text-gray-400 transition-all hover:border-indigo-500/20 hover:bg-indigo-500/10 hover:text-indigo-400"
                    title="GitHub"
                  >
                    <Github size={16} />
                  </a>
                </div>
              </div>

              {/* Right Column: Jobs & Representatives */}
              <div className="w-full space-y-4 md:w-64">
                {/* Jobs Section */}
                <div className="space-y-3 rounded-xl border border-white/5 bg-slate-900/60 p-4">
                  <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-widest text-gray-400 uppercase">
                    <Briefcase size={12} className="text-indigo-400" />
                    <span>Careers / Openings</span>
                  </h3>
                  <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                    {jobList.map((job, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-2 text-xs font-semibold text-gray-200 transition-colors hover:border-white/10 hover:bg-white/10"
                      >
                        <span className="truncate">{job}</span>
                        <button
                          onClick={() => {
                            captureLead(`Applied for ${job}`);
                            toast.success(`Application sent to ${booth.label} for ${job}!`);
                          }}
                          className="cursor-pointer rounded border-none bg-indigo-500/10 px-1.5 py-0.5 text-[9px] text-indigo-400 transition-colors hover:bg-indigo-500/20"
                        >
                          Apply
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Talk to Representative Button */}
                <button
                  onClick={() => setShowChat(true)}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-xs font-bold tracking-wider text-white uppercase shadow-md transition-all hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg active:scale-[0.98]"
                >
                  <MessageSquare size={14} />
                  <span>Talk to Representative</span>
                </button>
              </div>
            </div>
          ) : (
            /* Chat View */
            <div className="flex min-h-[300px] flex-1 flex-col overflow-hidden rounded-xl border border-white/5 bg-slate-950/80">
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-4 py-3">
                <button
                  onClick={() => setShowChat(false)}
                  className="flex cursor-pointer items-center gap-1 border-none bg-transparent text-xs text-gray-400 hover:text-white"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Booth</span>
                </button>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-gray-300">Live Rep (Online)</span>
                </div>
              </div>

              {/* Message History */}
              <div className="max-h-[350px] flex-1 space-y-4 overflow-y-auto p-4">
                {chatHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex max-w-[85%] gap-3 ${
                      msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                        msg.sender === "user"
                          ? "border-purple-500/30 bg-purple-950 text-purple-400"
                          : "border-indigo-500/30 bg-indigo-950 text-indigo-400"
                      }`}
                    >
                      <User size={14} />
                    </div>
                    {/* Balloon */}
                    <div className="space-y-1">
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                          msg.sender === "user"
                            ? "rounded-tr-none bg-purple-600 text-white"
                            : "rounded-tl-none border border-white/5 bg-slate-900 text-gray-200"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <div
                        className={`text-[9px] text-gray-500 ${msg.sender === "user" ? "text-right" : ""}`}
                      >
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex max-w-[85%] gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-950 text-indigo-400">
                      <User size={14} />
                    </div>
                    <div className="flex items-center gap-1 rounded-2xl rounded-tl-none border border-white/5 bg-slate-900 px-4 py-2.5 text-xs text-gray-400">
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <form
                onSubmit={handleSendMessage}
                className="flex gap-2 border-t border-white/5 bg-white/5 p-3"
              >
                <input
                  type="text"
                  className="flex-1 rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-xs text-white transition-all outline-none hover:border-white/20 focus:border-indigo-500"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type a message to the representative..."
                />
                <button
                  type="submit"
                  aria-label="Send message"
                  className="flex shrink-0 cursor-pointer items-center justify-center rounded-lg bg-indigo-500 p-2.5 text-white transition-colors hover:bg-indigo-600"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function SafeVirtualBoothModal(props) {
  return (
    <ErrorBoundary level="feature" label="Virtual Booth Modal">
      <VirtualBoothModal {...props} />
    </ErrorBoundary>
  );
}
