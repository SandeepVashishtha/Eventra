"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Home, 
  Calendar, 
  Trophy, 
  FolderKanban, 
  Info, 
  PlusCircle, 
  Users, 
  Code2, 
  BookOpen, 
  Award, 
  FileText, 
  HelpCircle, 
  MessageSquare, 
  Mail, 
  CheckCircle2, 
  Lock, 
  Clock, 
  Eye, 
  Activity, 
  ChevronUp, 
  Bot 
} from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [timeState, setTimeState] = useState({
    formattedTime: "",
    formattedDate: ""
  });

  const [liveVisitors, setLiveVisitors] = useState(1);
  const [totalVisitors, setTotalVisitors] = useState(0);

  // Update live clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeState({
        formattedTime: now.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        }),
        formattedDate: now.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric"
        })
      });
    };

    updateClock();
    const clockInterval = setInterval(updateClock, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Real-time visitor tracking
  useEffect(() => {
    if (typeof window === "undefined") return;

    const STORAGE_KEY = "eventra_total_visits";
    const storedVisits = localStorage.getItem(STORAGE_KEY);
    let count = storedVisits ? parseInt(storedVisits, 10) : 0;
    
    if (!sessionStorage.getItem("eventra_session_logged")) {
      count += 1;
      localStorage.setItem(STORAGE_KEY, count.toString());
      sessionStorage.setItem("eventra_session_logged", "true");
    }
    setTotalVisitors(count || 1);

    const CHANNEL_NAME = "eventra_active_visitors_channel";
    const tabId = "tab_" + Math.random().toString(36).substring(2, 9);
    const activeTabs = new Map();

    activeTabs.set(tabId, Date.now());

    let channel = null;
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
    } catch {
      channel = null;
    }

    const cleanStaleTabs = () => {
      const now = Date.now();
      activeTabs.forEach((timestamp, id) => {
        if (now - timestamp > 5000) {
          activeTabs.delete(id);
        }
      });
      setLiveVisitors(Math.max(1, activeTabs.size));
    };

    const broadcastPing = () => {
      activeTabs.set(tabId, Date.now());
      if (channel) {
        channel.postMessage({ type: "HEARTBEAT", tabId, timestamp: Date.now() });
      }
      cleanStaleTabs();
    };

    if (channel) {
      channel.onmessage = (event) => {
        const { type, tabId: senderTabId, timestamp } = event.data || {};
        if (type === "HEARTBEAT" && senderTabId) {
          activeTabs.set(senderTabId, timestamp || Date.now());
          cleanStaleTabs();
        } else if (type === "TAB_CLOSED" && senderTabId) {
          activeTabs.delete(senderTabId);
          cleanStaleTabs();
        }
      };

      channel.postMessage({ type: "HEARTBEAT", tabId, timestamp: Date.now() });
    }

    const pingInterval = setInterval(broadcastPing, 2000);

    const handleBeforeUnload = () => {
      if (channel) {
        channel.postMessage({ type: "TAB_CLOSED", tabId });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(pingInterval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (channel) {
        channel.postMessage({ type: "TAB_CLOSED", tabId });
        channel.close();
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="relative bg-[#f4fbf7] border-t border-emerald-200/60 text-zinc-700 font-sans pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12">
          
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="flex items-center gap-3">
              <Link href="/" className="text-2xl font-black tracking-tight text-zinc-900 flex items-center gap-2.5">
                <Image
                  src="/logo_transparent.png"
                  alt="Eventra Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                />
                <span>Eventra</span>
              </Link>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Code2 className="w-3 h-3 text-indigo-500" />
                <span>Open Source</span>
              </span>
            </div>

            <p className="text-sm text-zinc-600 leading-relaxed font-normal max-w-sm">
              Open-source event management for communities worldwide.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-800 transition-colors border border-zinc-200/80"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span>GitHub</span>
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-800 transition-colors border border-zinc-200/80"
              >
                <svg className="w-3.5 h-3.5 fill-current text-[#0A66C2]" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.64a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z"/>
                </svg>
                <span>LinkedIn</span>
              </a>

              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-800 transition-colors border border-zinc-200/80"
              >
                <svg className="w-3.5 h-3.5 fill-current text-[#5865F2]" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span>Discord</span>
              </a>
            </div>

            <div className="pt-4 space-y-3">
              <h3 className="text-xl font-bold text-indigo-600 tracking-tight">
                Subscribe to our newsletter
              </h3>
              <p className="text-xs text-zinc-500">
                Get the latest updates, event tips, and community news.
              </p>

              {subscribed ? (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Thank you! You are subscribed to Eventra newsletter.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-3 max-w-sm">
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-4 top-3.5 text-zinc-400" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-zinc-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-zinc-900 placeholder-zinc-400 shadow-xs transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-sm rounded-full shadow-md shadow-indigo-200 transition-all cursor-pointer"
                  >
                    Subscribe
                  </button>
                </form>
              )}

              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 pt-1">
                <Lock className="w-3 h-3 text-amber-500" />
                <span>We respect your privacy. Unsubscribe at any time.</span>
              </div>
            </div>

          </div>

          {/* Right Columns */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold text-zinc-900 uppercase tracking-widest">
                QUICK LINKS
              </h4>
              <ul className="space-y-3 text-sm font-medium">
                <li>
                  <Link href="/" className="flex items-center gap-2 text-zinc-600 hover:text-indigo-600 transition-colors">
                    <Home className="w-4 h-4 text-zinc-400" />
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <Link href="/events" className="flex items-center gap-2 text-zinc-600 hover:text-indigo-600 transition-colors">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <span>Events</span>
                  </Link>
                </li>
                <li>
                  <Link href="/hackathons" className="flex items-center gap-2 text-zinc-600 hover:text-indigo-600 transition-colors">
                    <Trophy className="w-4 h-4 text-zinc-400" />
                    <span>Hackathons</span>
                  </Link>
                </li>
                <li>
                  <Link href="/projects" className="flex items-center gap-2 text-zinc-600 hover:text-indigo-600 transition-colors">
                    <FolderKanban className="w-4 h-4 text-zinc-400" />
                    <span>Projects</span>
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="flex items-center gap-2 text-zinc-600 hover:text-indigo-600 transition-colors">
                    <Info className="w-4 h-4 text-zinc-400" />
                    <span>About</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-extrabold text-zinc-900 uppercase tracking-widest">
                COMMUNITY
              </h4>
              <ul className="space-y-3 text-sm font-medium">
                <li>
                  <Link href="/host" className="flex items-center gap-2 text-zinc-600 hover:text-indigo-600 transition-colors">
                    <PlusCircle className="w-4 h-4 text-zinc-400" />
                    <span>Create Event</span>
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="flex items-center gap-2 text-zinc-600 hover:text-indigo-600 transition-colors">
                    <Users className="w-4 h-4 text-zinc-400" />
                    <span>Community Events</span>
                  </Link>
                </li>
                <li>
                  <Link href="/contributors" className="flex items-center gap-2 text-zinc-600 hover:text-indigo-600 transition-colors">
                    <Code2 className="w-4 h-4 text-zinc-400" />
                    <span>Contributors</span>
                  </Link>
                </li>
                <li>
                  <Link href="/guide" className="flex items-center gap-2 text-zinc-600 hover:text-indigo-600 transition-colors">
                    <BookOpen className="w-4 h-4 text-zinc-400" />
                    <span>Contributors Guide</span>
                  </Link>
                </li>
                <li>
                  <Link href="/leaderboard" className="flex items-center gap-2 text-zinc-600 hover:text-indigo-600 transition-colors">
                    <Award className="w-4 h-4 text-zinc-400" />
                    <span>Leaderboard</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-extrabold text-zinc-900 uppercase tracking-widest">
                SUPPORT
              </h4>
              <ul className="space-y-3 text-sm font-medium">
                <li>
                  <Link href="/docs" className="flex items-center gap-2 text-zinc-600 hover:text-indigo-600 transition-colors">
                    <FileText className="w-4 h-4 text-zinc-400" />
                    <span>Documentation</span>
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="flex items-center gap-2 text-zinc-600 hover:text-indigo-600 transition-colors">
                    <HelpCircle className="w-4 h-4 text-zinc-400" />
                    <span>Help Center</span>
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="flex items-center gap-2 text-zinc-600 hover:text-indigo-600 transition-colors">
                    <HelpCircle className="w-4 h-4 text-zinc-400" />
                    <span>FAQ</span>
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="flex items-center gap-2 text-zinc-600 hover:text-indigo-600 transition-colors">
                    <Mail className="w-4 h-4 text-zinc-400" />
                    <span>Contact Us</span>
                  </Link>
                </li>
                <li>
                  <Link href="/feedback" className="flex items-center gap-2 text-zinc-600 hover:text-indigo-600 transition-colors">
                    <MessageSquare className="w-4 h-4 text-zinc-400" />
                    <span>Feedback</span>
                  </Link>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Live Visitor & Time Integrated Banner Strip */}
        <div className="my-6 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-zinc-200 shadow-2xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-zinc-700">Live Active Visitors:</span>
              <span className="font-mono font-bold text-emerald-600 text-sm">{liveVisitors}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-zinc-200 text-zinc-600 shadow-2xs">
              <Eye className="w-3.5 h-3.5 text-indigo-500" />
              <span>Total Visits:</span>
              <span className="font-mono font-bold text-zinc-900">{totalVisitors.toLocaleString()}</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>All Systems Operational</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-zinc-200 shadow-2xs text-zinc-700 font-mono">
            <Clock className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span className="font-bold text-zinc-900">{timeState.formattedTime || "12:00:00 PM"}</span>
            <span className="text-zinc-300">|</span>
            <span className="text-zinc-500 font-sans text-xs">{timeState.formattedDate}</span>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-medium">
          <div>
            © {new Date().getFullYear()} Eventra. All rights reserved.
          </div>

          <div className="flex items-center space-x-3 text-zinc-600">
            <span>10K+ Users</span>
            <span>•</span>
            <span>500+ Events</span>
            <span>•</span>
            <span>Privacy Focused</span>
          </div>

          <div className="flex items-center space-x-3 divide-x divide-zinc-200">
            <Link href="/privacy" className="hover:text-zinc-900 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="pl-3 hover:text-zinc-900 transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="pl-3 hover:text-zinc-900 transition-colors">
              Cookie Policy
            </Link>
            <Link href="/api" className="pl-3 hover:text-zinc-900 transition-colors">
              API Docs
            </Link>
          </div>
        </div>

      </div>

      {/* Floating Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 hover:scale-110 active:scale-95 transition-all cursor-pointer"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={() => alert("Eventra AI Assistant - How can I help you find events or hackathons?")}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer ring-4 ring-purple-100"
          aria-label="Eventra AI Assistant"
        >
          <Bot className="w-6 h-6" />
        </button>
      </div>

    </footer>
  );
}
