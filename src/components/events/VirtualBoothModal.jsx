import { useState, useEffect, useRef } from "react";
import {
  X, Briefcase, Globe, Linkedin, Twitter, Github,
  Send, MessageSquare, ArrowLeft
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

  /* ---------------- Lead Capture ---------------- */
  const captureLead = (action) => {
    try {
      const existing = safeJsonParse(
        localStorage.getItem("eventra_sponsor_leads"),
        []
      );

      existing.push({
        name: user?.name || user?.email || "Guest",
        action,
        contact: user?.email || "unknown",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });

      localStorage.setItem(
        "eventra_sponsor_leads",
        JSON.stringify(existing)
      );
    } catch (e) {
      console.error("Lead capture failed", e);
    }
  };

  /* ---------------- Keyboard Close ---------------- */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  /* ---------------- Modal Init ---------------- */
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    setShowChat(false);
    setChatMessage("");
    setChatHistory([
      {
        id: 1,
        sender: "representative",
        text: `Hi! Welcome to the ${booth?.label || "Sponsor"} booth.`,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, booth]);

  /* ---------------- Auto Scroll Chat ---------------- */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  if (!isOpen || !booth) return null;

  /* ---------------- Send Message ---------------- */
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: chatMessage,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChatHistory((p) => [...p, userMsg]);
    setChatMessage("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      const replies = [
        "We’re hiring! Check our careers section.",
        "Feel free to reach out via email or LinkedIn.",
        "Our team works with React, Node.js, and TypeScript.",
      ];

      setChatHistory((p) => [
        ...p,
        {
          id: Date.now() + 1,
          sender: "representative",
          text: replies[Math.floor(Math.random() * replies.length)],
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }, 1200);
  };

  const jobList = booth?.sponsorJobs
    ? booth.sponsorJobs.split(",").map((j) => j.trim()).filter(Boolean)
    : [
        "Software Engineer Intern",
        "Frontend Engineer (React)",
        "Developer Advocate",
      ];

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div
        ref={modalRef}
        className="w-full max-w-2xl rounded-2xl bg-linear-to-b from-gray-900 to-slate-950 text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="relative h-32 bg-linear-to-r from-indigo-900/60 to-purple-900/60 p-6 flex items-end">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full"
          >
            <X size={18} />
          </button>

          <div className="absolute -bottom-8 left-6 w-20 h-20 bg-slate-950 border border-indigo-500/30 rounded-xl flex items-center justify-center">
            <span className="text-indigo-400 font-bold">
              {booth.label?.slice(0, 2).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 pt-12 pb-6">
          {!showChat ? (
            /* ================= INFO VIEW ================= */
            <div className="flex flex-col md:flex-row gap-6">

              {/* LEFT */}
              <div className="flex-1 space-y-4">
                <h2 className="text-2xl font-bold">{booth.label}</h2>

                <p className="text-sm text-gray-300">
                  {booth.sponsorDescription}
                </p>

                <div className="flex gap-3 text-gray-400">
                  {booth.sponsorWebsite && (
                    <a href={booth.sponsorWebsite} target="_blank" rel="noopener noreferrer" aria-label={`${booth.label} website`}><Globe size={16} /></a>
                  )}
                  {booth.sponsorLinkedin && (
                    <a href={booth.sponsorLinkedin} target="_blank" rel="noopener noreferrer" aria-label={`${booth.label} LinkedIn`}><Linkedin size={16} /></a>
                  )}
                  {booth.sponsorTwitter && (
                    <a href={booth.sponsorTwitter} target="_blank" rel="noopener noreferrer" aria-label={`${booth.label} Twitter`}><Twitter size={16} /></a>
                  )}
                  {booth.sponsorGithub && (
                    <a href={booth.sponsorGithub} target="_blank" rel="noopener noreferrer" aria-label={`${booth.label} GitHub`}><Github size={16} /></a>
                  )}
                </div>
              </div>

              {/* RIGHT */}
              <div className="w-full md:w-64 space-y-4">

                <div className="bg-slate-900/60 p-4 rounded-xl">
                  <h3 className="text-xs uppercase text-gray-400 flex items-center gap-1">
                    <Briefcase size={12} /> Careers
                  </h3>

                  <div className="mt-2 space-y-2">
                    {jobList.map((job, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-xs bg-white/5 p-2 rounded"
                      >
                        {job}
                        <button
                          onClick={() => {
                            captureLead(`Applied: ${job}`);
                            toast.success(`Applied for ${job}`);
                          }}
                          className="text-indigo-400"
                        >
                          Apply
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setShowChat(true)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl text-xs uppercase font-bold"
                >
                  <MessageSquare size={14} /> Chat
                </button>
              </div>
            </div>
          ) : (
            /* ================= CHAT VIEW ================= */
            <div className="flex flex-col bg-slate-950 border border-white/5 rounded-xl overflow-hidden">

              <div className="flex justify-between p-3 border-b border-white/5">
                <button onClick={() => setShowChat(false)}>
                  <ArrowLeft size={14} /> Back
                </button>
              </div>

              <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {chatHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${
                      msg.sender === "user" ? "justify-end" : ""
                    }`}
                  >
                    <div className="text-xs bg-white/5 p-2 rounded-xl">
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <p className="text-xs text-gray-400">Typing...</p>
                )}

                <div ref={chatEndRef} />
              </div>

              <form
                onSubmit={handleSendMessage}
                className="flex gap-2 p-3 border-t border-white/5"
              >
                <input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="flex-1 bg-slate-900 px-3 py-2 text-xs rounded"
                  placeholder="Type message..."
                />
                <button className="bg-indigo-600 px-3 rounded">
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

/* Wrapper */
export default function SafeVirtualBoothModal(props) {
  return (
    <ErrorBoundary level="feature" label="Virtual Booth Modal">
      <VirtualBoothModal {...props} />
    </ErrorBoundary>
  );
}