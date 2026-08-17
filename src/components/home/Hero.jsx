import React from "react";
import Link from "next/link";
import { Code2, Trophy, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-16 lg:pt-24 lg:pb-24 border-b border-emerald-900/10 bg-gradient-to-b from-emerald-100/40 via-[#f4fbf7] to-[#f4fbf7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/60 border border-emerald-200 text-emerald-900 text-xs font-medium">
            <Code2 className="w-3.5 h-3.5 text-[#00b887]" />
            <span>Unified Developer Event Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.15]">
            Discover events, participate in hackathons, and showcase projects.
          </h1>

          <p className="text-lg text-zinc-600 leading-relaxed max-w-2xl mx-auto font-normal">
            Eventra brings together developers, university chapters, and tech organizations to discover upcoming workshops, build in competitive hackathons, and share open-source work.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/events"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#00b887] hover:bg-[#049d73] text-white font-semibold text-sm rounded-full shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2"
            >
              <span>Browse All Events</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/hackathons"
              className="w-full sm:w-auto px-6 py-3.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 font-semibold text-sm rounded-full shadow-2xs transition-all flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4 text-zinc-600" />
              <span>Explore Hackathons</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
