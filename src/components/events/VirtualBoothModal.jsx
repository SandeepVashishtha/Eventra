import { useState, useEffect, useRef } from "react";
import {
  X, Briefcase, Mail, Globe, Linkedin, Twitter, Github,
  Send, User, MessageSquare, ArrowLeft
} from "lucide-react";
import { toast } from "react-toastify";

import ErrorBoundary from "../common/ErrorBoundary";

const VirtualBoothModal = ({ isOpen, onClose, booth }) => {
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const modalRef = useRef(null);
  const chatEndRef = useRef(null);

  const captureLead = (action) => {
    try {
      const existingLeadsStr = localStorage.getItem("eventra_sponsor_leads");
      const existingLeads = existingLeadsStr ? JSON.parse(existingLeadsStr) : [];
      
      const newLead = {
        name: "Test Attendee",
        action: action,
        contact: "attendee@example.com",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

    const focusableSelector = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
    
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
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
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
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
        "Our tech stack is primarily React, Node.js, and TypeScript. Let me know if you have any questions about our systems!"
      ];
      const randomResponse = repResponses[Math.floor(Math.random() * repResponses.length)];
      
      setChatHistory((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "representative",
          text: randomResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1500);
  };

  // Parse jobs
  const jobList = booth.sponsorJobs
    ? booth.sponsorJobs.split(",").map(job => job.trim()).filter(Boolean)
    : ["Software Engineer Intern", "Frontend Engineer (React)", "Developer Advocate"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in transition-all">
      {/* Modal Container */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booth-modal-title"
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-gray-900 to-slate-950 text-white shadow-2xl transition-all duration-300 transform scale-100 flex flex-col max-h-[90vh]"
      >
        {/* Header / Banner */}
        <div className="relative h-32 bg-gradient-to-r from-indigo-900/60 to-purple-900/60 p-6 flex items-end">
          <div className="absolute inset-0 bg-grid-white/[0.02]" />
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Logo Badge */}
          <div className="absolute -bottom-8 left-6 w-20 h-20 rounded-xl bg-slate-950 border-2 border-indigo-500/30 flex items-center justify-center overflow-hidden shadow-lg p-2 bg-gradient-to-tr from-slate-900 to-indigo-950">
            {booth.sponsorLogo ? (
              <img
                src={booth.sponsorLogo}
                alt={`${booth.label} logo`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80"; // Premium abstract pattern fallback
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
        <div className="flex-1 overflow-y-auto px-6 pt-12 pb-6 flex flex-col">
          {!showChat ? (
            /* Information View */
            <div className="flex-1 flex flex-col md:flex-row gap-6">
              {/* Left Column: Sponsor Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 id="booth-modal-title" className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {booth.label}
                    </h2>
                    <span className="px-2 py-0.5 text-[10px] font-bold tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full uppercase">
                      Sponsor
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                    <Mail size={12} className="text-indigo-400" />
                    <span>Contact: {booth.sponsorContact || "info@sponsor.com"}</span>
                  </p>
                </div>

                <div className="text-sm text-gray-300 leading-relaxed bg-white/5 border border-white/5 p-4 rounded-xl">
                  {booth.sponsorDescription || `Welcome to the ${booth.label} booth! We are thrilled to partner with Eventra to support developer innovation, local hackathons, and technology builders worldwide. Drop by our chat or look at our career listings below!`}
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-3 pt-2">
                  <a
                    href="https://example.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg border border-white/5 hover:border-indigo-500/20 transition-all"
                    title="Website"
                  >
                    <Globe size={16} />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg border border-white/5 hover:border-indigo-500/20 transition-all"
                    title="LinkedIn"
                  >
                    <Linkedin size={16} />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg border border-white/5 hover:border-indigo-500/20 transition-all"
                    title="Twitter"
                  >
                    <Twitter size={16} />
                  </a>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg border border-white/5 hover:border-indigo-500/20 transition-all"
                    title="GitHub"
                  >
                    <Github size={16} />
                  </a>
                </div>
              </div>

              {/* Right Column: Jobs & Representatives */}
              <div className="w-full md:w-64 space-y-4">
                {/* Jobs Section */}
                <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Briefcase size={12} className="text-indigo-400" />
                    <span>Careers / Openings</span>
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {jobList.map((job, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg text-xs font-semibold text-gray-200 transition-colors flex items-center justify-between"
                      >
                        <span className="truncate">{job}</span>
                        <button 
                          onClick={() => {
                            captureLead(`Applied for ${job}`);
                            toast.success(`Application sent to ${booth.label} for ${job}!`);
                          }}
                          className="text-[9px] text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors border-none"
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
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare size={14} />
                  <span>Talk to Representative</span>
                </button>
              </div>
            </div>
          ) : (
            /* Chat View */
            <div className="flex-1 flex flex-col bg-slate-950/80 border border-white/5 rounded-xl overflow-hidden min-h-[300px]">
              {/* Chat Header */}
              <div className="bg-white/5 px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <button
                  onClick={() => setShowChat(false)}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1 bg-transparent border-none cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Booth</span>
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-gray-300">Live Rep (Online)</span>
                </div>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[350px]">
                {chatHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-[85%] ${
                      msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                      msg.sender === "user" 
                        ? "bg-purple-950 border-purple-500/30 text-purple-400" 
                        : "bg-indigo-950 border-indigo-500/30 text-indigo-400"
                    }`}>
                      <User size={14} />
                    </div>
                    {/* Balloon */}
                    <div className="space-y-1">
                      <div className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-purple-600 text-white rounded-tr-none"
                          : "bg-slate-900 text-gray-200 border border-white/5 rounded-tl-none"
                      }`}>
                        {msg.text}
                      </div>
                      <div className={`text-[9px] text-gray-500 ${msg.sender === "user" ? "text-right" : ""}`}>
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                      <User size={14} />
                    </div>
                    <div className="px-4 py-2.5 bg-slate-900 border border-white/5 rounded-2xl rounded-tl-none text-xs text-gray-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white/5 border-t border-white/5 flex gap-2">
                <input
                  type="text"
                  className="flex-1 bg-slate-900 border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-lg px-4 py-2 text-xs text-white outline-none transition-all"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type a message to the representative..."
                />
                <button
                  type="submit"
                  aria-label="Send message"
                  className="p-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-pointer"
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
