import React from "react";
import Link from "next/link";
import { Calendar, Laptop, Globe, Users, Rocket, ArrowRight } from "lucide-react";

export default function EventCategoryBreakdown() {
  return (
    <section className="py-20 bg-[#f4fbf7] border-b border-emerald-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-start justify-between gap-10">
          <div className="max-w-md space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              <span>Event Formats</span>
            </div>
            <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
              Varied formats suited for every learning objective
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Whether you want to learn a new framework, listen to industry pioneers, or network locally, Eventra lists verified sessions across multiple domains.
            </p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 pt-2"
            >
              <span>View all upcoming events</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
            
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-zinc-900 font-bold text-base">
                <Laptop className="w-4 h-4 text-blue-600" />
                <span>Hands-on Workshops</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Interactive live coding labs where instructors guide attendees through building full-stack applications or setting up cloud infrastructure.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-zinc-900 font-bold text-base">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Keynotes & Tech Talks</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Streamed presentations from senior engineers and open-source creators discussing software architecture, security, and AI developments.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-zinc-900 font-bold text-base">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Community Meetups</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Informal local or regional gatherings focused on peer-to-peer discussions, lightning talks, and professional networking.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-zinc-900 font-bold text-base">
                <Rocket className="w-4 h-4 text-blue-600" />
                <span>Product & Tool Demos</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Live demonstrations showcasing new open-source libraries, developer tooling, and API integrations with Q&A sessions.
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
