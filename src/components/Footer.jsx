"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ChevronUp, 
  ArrowUpRight,
  Bookmark,
  Plus
} from "lucide-react";

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#fafafa] border-t border-neutral-200/80 text-neutral-600 font-sans pt-14 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12">
          
          {/* Col 1: Brand / Description */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 text-neutral-950 font-semibold text-base">
              <div className="w-5 h-5 rounded bg-neutral-950 text-white flex items-center justify-center p-0.5">
                <Image
                  src="/logo_transparent.png"
                  alt="Eventra Logo"
                  width={16}
                  height={16}
                  className="w-full h-full object-contain invert brightness-0"
                />
              </div>
              <span>Eventra</span>
            </Link>

            <p className="text-xs text-neutral-500 leading-relaxed max-w-sm">
              Hand-picked directory of tech workshops, developer hackathons, and open-source project showcases. Curated daily for the global engineering community.
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs text-neutral-500 font-mono">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-neutral-950 transition-colors">GitHub</a>
              <span>·</span>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-neutral-950 transition-colors">X / Twitter</a>
              <span>·</span>
              <a href="https://discord.com" target="_blank" rel="noreferrer" className="hover:text-neutral-950 transition-colors">Discord</a>
            </div>
          </div>

          {/* Col 2: Directory */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Directory
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/events" className="hover:text-neutral-950 transition-colors">
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link href="/hackathons" className="hover:text-neutral-950 transition-colors">
                  Active Hackathons
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-neutral-950 transition-colors">
                  Showcase Projects
                </Link>
              </li>
              <li>
                <Link href="/submit-project" className="hover:text-neutral-950 transition-colors">
                  Submit Listing
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-neutral-950 transition-colors">
                  About Eventra
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-neutral-950 transition-colors">
                  Community Hub
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-neutral-950 transition-colors">
                  Organizer Guides
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-neutral-950 transition-colors">
                  Help &amp; FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Account / Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Account
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/login" className="hover:text-neutral-950 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-neutral-950 transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/dashboard?tab=bookmarks" className="hover:text-neutral-950 transition-colors">
                  Saved Bookmarks
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-neutral-950 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-neutral-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div>
            © {new Date().getFullYear()} Eventra. For the love of beautiful and functional software.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-neutral-600 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-neutral-600 transition-colors">Privacy</Link>
            <Link href="/cookies" className="hover:text-neutral-600 transition-colors">Cookies</Link>
          </div>
        </div>

      </div>

      {/* Clean minimal scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-lg hover:bg-neutral-800 transition-all cursor-pointer"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      )}
    </footer>
  );
}
