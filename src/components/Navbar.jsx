"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  Bookmark,
  Plus, 
  User, 
  LogOut,
  X,
  ArrowUpRight
} from "lucide-react";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [bookmarkCount, setBookmarkCount] = useState(0);

  const [authModalState, setAuthModalState] = useState({
    isOpen: false,
    mode: "signin"
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
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

        // Count saved bookmarks if any
        try {
          const saved = JSON.parse(localStorage.getItem("eventra_bookmarks") || "[]");
          setBookmarkCount(Array.isArray(saved) ? saved.length : 0);
        } catch {
          setBookmarkCount(0);
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

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 border-b ${
          isScrolled
            ? "bg-[#fafafa]/90 backdrop-blur-md border-neutral-200 shadow-2xs"
            : "bg-[#fafafa] border-neutral-200/80"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16">
          <div className="relative h-full flex items-center justify-between">
            
            {/* Left: Clean Navigation Links */}
            <nav className="hidden md:flex items-center gap-7">
              <Link
                href="/events"
                className={`text-sm font-medium transition-colors ${
                  pathname?.startsWith("/events")
                    ? "text-neutral-950 font-semibold"
                    : "text-neutral-600 hover:text-neutral-950"
                }`}
              >
                Events
              </Link>

              <Link
                href="/hackathons"
                className={`text-sm font-medium transition-colors ${
                  pathname?.startsWith("/hackathons")
                    ? "text-neutral-950 font-semibold"
                    : "text-neutral-600 hover:text-neutral-950"
                }`}
              >
                Hackathons
              </Link>

              <Link
                href="/projects"
                className={`text-sm font-medium transition-colors ${
                  pathname?.startsWith("/projects")
                    ? "text-neutral-950 font-semibold"
                    : "text-neutral-600 hover:text-neutral-950"
                }`}
              >
                Projects
              </Link>
            </nav>

            {/* Center: Brand Name & Logo */}
            <div className="flex items-center md:absolute md:left-1/2 md:-translate-x-1/2">
              <Link
                href="/"
                className="flex items-center gap-2 group text-neutral-950"
              >
                {/* <div className="w-6 h-6 rounded-md bg-neutral-950 text-white flex items-center justify-center p-1 transition-transform group-hover:scale-105">
                  <Image
                    src="/logo_transparent.png"
                    alt="Eventra Logo"
                    width={20}
                    height={20}
                    className="w-full h-full object-contain invert brightness-0"
                  />
                </div> */}
                <span className="font-semibold text-base sm:text-lg tracking-tight text-neutral-950">
                  Eventra 
                </span>
              </Link>
            </div>

            {/* Right: Actions & Menu */}
            <div className="flex items-center gap-4 sm:gap-5">
              
              <Link
                href="/submit-project"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-neutral-600 hover:text-neutral-950 transition-colors"
              >
                <span>Submit</span>
                <Plus className="w-3.5 h-3.5 text-neutral-400" />
              </Link>

              {/* Bookmarks link */}
              <Link
                href="/dashboard?tab=bookmarks"
                className="hidden lg:inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-950 transition-colors"
                title="Saved Items"
              >
                <Bookmark className="w-4 h-4 text-neutral-500" />
                <span>Bookmarks</span>
                {bookmarkCount > 0 && (
                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-full bg-neutral-200 text-neutral-800">
                    {bookmarkCount}
                  </span>
                )}
              </Link>

              {/* Auth actions */}
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{currentUser?.firstName || "Account"}</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="hidden sm:inline-flex text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-neutral-700 hover:text-neutral-950 transition-colors"
                  >
                    Sign in
                  </Link>

                  <Link
                    href="/signup"
                    className="hidden sm:inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-full transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Minimal 2-bar hamburger icon (exact minimal.gallery style) */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 -mr-2 text-neutral-700 hover:text-neutral-950 rounded-lg transition-colors cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <div className="w-5 h-4 flex flex-col justify-between items-end">
                    <span className="w-5 h-[1.5px] bg-neutral-900 rounded-full"></span>
                    <span className="w-3.5 h-[1.5px] bg-neutral-900 rounded-full"></span>
                  </div>
                )}
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* Minimal Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-neutral-950/20 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-sm bg-white p-6 shadow-2xl flex flex-col justify-between border-l border-neutral-200">
              
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-neutral-100">
                  <span className="text-sm font-semibold text-neutral-950">Navigation</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 text-neutral-400 hover:text-neutral-900 rounded-md transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="py-6 space-y-4">
                  <div className="space-y-3">
                    <Link
                      href="/events"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between text-base font-medium text-neutral-800 hover:text-neutral-950"
                    >
                      <span>Events</span>
                      <ArrowUpRight className="w-4 h-4 text-neutral-400" />
                    </Link>

                    <Link
                      href="/hackathons"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between text-base font-medium text-neutral-800 hover:text-neutral-950"
                    >
                      <span>Hackathons</span>
                      <ArrowUpRight className="w-4 h-4 text-neutral-400" />
                    </Link>

                    <Link
                      href="/projects"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between text-base font-medium text-neutral-800 hover:text-neutral-950"
                    >
                      <span>Projects</span>
                      <ArrowUpRight className="w-4 h-4 text-neutral-400" />
                    </Link>

                    <Link
                      href="/submit-project"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between text-base font-medium text-neutral-800 hover:text-neutral-950"
                    >
                      <span>Submit Opportunity</span>
                      <Plus className="w-4 h-4 text-neutral-400" />
                    </Link>
                  </div>

                  <div className="pt-6 border-t border-neutral-100 space-y-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                      Platform
                    </span>
                    <div className="space-y-2 text-sm text-neutral-600">
                      <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-neutral-950">About Eventra</Link>
                      <Link href="/resources" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-neutral-950">Resources & Docs</Link>
                      <Link href="/help" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-neutral-950">Help & Support</Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-100">
                {isLoggedIn ? (
                  <div className="space-y-3">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center py-2.5 px-4 rounded-full text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800"
                    >
                      Go to Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-center text-xs font-medium text-neutral-500 hover:text-neutral-900"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center py-2.5 px-4 rounded-full text-xs font-semibold border border-neutral-300 text-neutral-800 hover:bg-neutral-50"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center py-2.5 px-4 rounded-full text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800"
                    >
                      Get Started
                    </Link>
                  </div>
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
