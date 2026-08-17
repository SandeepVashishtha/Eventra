import React from "react";
import Link from "next/link";
import { Trophy, Cpu, Layers, Terminal, BookOpen, ArrowRight } from "lucide-react";

export default function HackathonCategoryBreakdown() {
  return (
    <section className="py-20 bg-[#f4fbf7] border-b border-emerald-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-start justify-between gap-10">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1 order-2 md:order-1">
            
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-zinc-900 font-bold text-base">
                <Cpu className="w-4 h-4 text-amber-600" />
                <span>AI & Intelligent Agents</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Challenges centered around constructing autonomous agents, LLM tooling, prompt engineering workflows, and machine learning models.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-zinc-900 font-bold text-base">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>Full-Stack & Cloud Apps</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Fast-paced builds focusing on modern web frameworks, API design, database schemas, and microservice deployment.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-zinc-900 font-bold text-base">
                <Terminal className="w-4 h-4 text-amber-600" />
                <span>Open Source Contributions</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Hackathons dedicated to resolving open issues, writing documentation, or creating plugins for established open-source projects.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-zinc-900 font-bold text-base">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>University & Beginner Tracks</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Student-focused events with dedicated mentor office hours, introductory workshops, and beginner-friendly evaluation criteria.
              </p>
            </div>

          </div>

          <div className="max-w-md space-y-4 order-1 md:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-semibold">
              <Trophy className="w-3.5 h-3.5" />
              <span>Hackathon Tracks</span>
            </div>
            <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
              Build software solutions under dedicated tracks
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Hackathons on Eventra span online weekend sprints, multi-week global competitions, and campus hackathons.
            </p>
            <Link
              href="/hackathons"
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 pt-2"
            >
              <span>Browse active hackathons</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
