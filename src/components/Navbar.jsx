"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  Trophy, 
  FolderKanban, 
  Menu, 
  X, 
  ChevronDown,
  Globe,
  Search,
  BookOpen,
  Users,
  HelpCircle,
  Calendar,
  Sparkles,
  User,
  LogOut
} from "lucide-react";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [language, setLanguage] = useState("English");
  const [isLangOpen, setIsLangOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [authModalState, setAuthModalState] = useState({
    isOpen: false,
    mode: "signin"
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("eventra_token");
        const rawUser = localStorage.getItem("eventra_user");
        if (token || rawUser) {
          setIsLoggedIn(true);
          if (rawUser) {
            try {
              setCurrentUser(JSON.parse(rawUser));
            } catch (e) {}
          }
        } else {
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      }
    };

    checkAuth();
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("eventra_token");
      localStorage.removeItem("eventra_user");
    }
    setIsLoggedIn(false);
    setCurrentUser(null);
    window.location.href = "/login";
  };

  const openAuth = (mode) => {
    setAuthModalState({ isOpen: true, mode });
    setIsMobileMenuOpen(false);
  };

  const miscLinks = [
    { name: "Community Hub", href: "/community", icon: Users, desc: "Connect with event organizers & builders" },
    { name: "Resources & Docs", href: "/resources", icon: BookOpen, desc: "Guides, templates, and event toolkits" },
    { name: "Help & Support", href: "/help", icon: HelpCircle, desc: "FAQs, ticket submission, and live chat" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 border-b ${
          isScrolled
            ? "bg-[#f4fbf7]/90 backdrop-blur-md border-emerald-900/10 shadow-2xs py-3"
            : "bg-[#f4fbf7] border-emerald-900/10 py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between">
            
            {/* Left Brand Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
                  <Image
                    src="/logo_transparent.png"
                    alt="Eventra Logo"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-black text-xl tracking-tight text-zinc-900">
                  Eventra
                </span>
              </Link>
            </div>

            {/* Main Navigation Links (Centered) */}
            <nav className="hidden md:flex items-center space-x-1 absolute left-1/2 -translate-x-1/2">
              <Link
                href="/events"
                className={`flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
                  pathname?.startsWith("/events")
                    ? "bg-emerald-100/80 text-emerald-900"
                    : "text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-[#00b887]" />
                <span>EVENTS</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </Link>

              <Link
                href="/hackathons"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
                  pathname?.startsWith("/hackathons")
                    ? "bg-amber-100/80 text-amber-900"
                    : "text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                <span>HACKATHONS</span>
              </Link>

              <Link
                href="/projects"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
                  pathname?.startsWith("/projects")
                    ? "bg-emerald-100/80 text-emerald-900"
                    : "text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                <FolderKanban className="w-3.5 h-3.5 text-emerald-600" />
                <span>PROJECTS</span>
              </Link>
            </nav>

            {/* Right Action Bar */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              
              {/* Language Selector Dropdown */}
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 bg-white hover:bg-zinc-100 text-xs font-medium text-zinc-700 transition-colors cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{language}</span>
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </button>

                {isLangOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white border border-zinc-200 rounded-xl shadow-lg p-1 z-50 text-xs">
                    {["English", "Spanish", "French", "German"].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang);
                          setIsLangOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-zinc-100 text-zinc-700 cursor-pointer"
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Conditional Auth Buttons */}
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/90 border border-emerald-300 text-emerald-950 text-xs font-extrabold hover:bg-emerald-200 transition-all shadow-2xs"
                  >
                    <User className="w-3.5 h-3.5 text-[#00b887]" />
                    <span>{currentUser?.firstName || "Dashboard"}</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden sm:inline-flex items-center text-sm font-semibold text-zinc-800 hover:text-[#00b887] transition-colors"
                  >
                    Sign In
                  </Link>

                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-5 py-2 text-sm font-bold text-white bg-[#00b887] hover:bg-[#049d73] active:scale-95 rounded-full shadow-md shadow-emerald-200 transition-all cursor-pointer"
                  >
                    Get Started
                  </Link>
                </>
              )}

              {/* Hamburger Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors focus:outline-none cursor-pointer"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-zinc-200">
              
              <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <Image
                    src="/logo_transparent.png"
                    alt="Eventra Logo"
                    width={28}
                    height={28}
                    className="w-7 h-7 object-contain"
                  />
                  <span className="font-extrabold text-lg text-zinc-900">Eventra Menu</span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-200/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">
                    Main Navigation
                  </h4>
                  <div className="space-y-1">
                    <Link
                      href="/events"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-100 transition-colors font-medium text-zinc-900"
                    >
                      <Calendar className="w-5 h-5 text-[#00b887]" />
                      <span>Events</span>
                    </Link>
                    <Link
                      href="/hackathons"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-100 transition-colors font-medium text-zinc-900"
                    >
                      <Trophy className="w-5 h-5 text-amber-500" />
                      <span>Hackathons</span>
                    </Link>
                    <Link
                      href="/projects"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-100 transition-colors font-medium text-zinc-900"
                    >
                      <FolderKanban className="w-5 h-5 text-emerald-500" />
                      <span>Projects</span>
                    </Link>
                  </div>
                </div>

                {isLoggedIn && (
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">
                      Account Session
                    </h4>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 font-bold text-emerald-950"
                    >
                      <User className="w-5 h-5 text-[#00b887]" />
                      <span>My Dashboard ({currentUser?.firstName || "User"})</span>
                    </Link>
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-zinc-100 bg-zinc-50/80 space-y-2">
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 px-4 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-center w-full py-2.5 px-4 text-sm font-semibold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-center w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#00b887] hover:bg-[#049d73] rounded-full shadow-sm transition-colors cursor-pointer"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={authModalState.isOpen}
        mode={authModalState.mode}
        onClose={() => setAuthModalState({ ...authModalState, isOpen: false })}
      />
    </>
  );
}
