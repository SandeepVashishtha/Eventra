"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Trophy, 
  Search, 
  MapPin, 
  Award, 
  Filter, 
  RefreshCw, 
  Sparkles, 
  ArrowRight, 
  PlusCircle,
  X
} from "lucide-react";
import { getHackathons } from "@/lib/api";
import HackathonCard from "@/components/ui/HackathonCard";
import DetailDrawer from "@/components/ui/DetailDrawer";
import { CardSkeleton } from "@/components/ui/Skeleton";

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMode, setSelectedMode] = useState("all");
  const [selectedHackathon, setSelectedHackathon] = useState(null);

  const fetchHackathonsData = async () => {
    setLoading(true);
    try {
      const data = await getHackathons();
      setHackathons(data || []);
    } catch (err) {
      console.warn("Failed to fetch hackathons", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathonsData();
  }, []);

  const filteredHackathons = hackathons.filter((h) => {
    const matchesSearch =
      (h.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.organizer || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMode =
      selectedMode === "all" ||
      (h.mode || "").toLowerCase().includes(selectedMode.toLowerCase());

    return matchesSearch && matchesMode;
  });

  const featuredHackathon = hackathons[0];

  return (
    <main className="min-h-screen bg-[#f4fbf7] text-zinc-900 font-sans py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/70 border border-amber-200 text-amber-900 text-xs font-semibold">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>Global Developer Hackathons</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 leading-tight">
            Build, Compete & Win Hackathons
          </h1>

          <p className="text-base text-zinc-600 leading-relaxed font-normal">
            Join global coding sprints, campus competitions, and open-source challenges. Showcase your projects to judges and win grant funding.
          </p>

          <div className="pt-2 flex justify-center">
            <Link
              href="/host-hackathon"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-full shadow-md shadow-amber-200 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Organize a Hackathon</span>
            </Link>
          </div>
        </div>

        {featuredHackathon && !loading && (
          <div className="bg-white border border-emerald-900/10 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Featured Hackathon</span>
                  </span>
                  {featuredHackathon.prizePool && (
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      {featuredHackathon.prizePool}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-extrabold text-zinc-900">
                  {featuredHackathon.title}
                </h2>

                <p className="text-sm text-zinc-600 leading-relaxed">
                  {featuredHackathon.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600 font-medium pt-2">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{featuredHackathon.organizer || "Eventra Partner"}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <span>{featuredHackathon.location || "Online"}</span>
                  </span>
                </div>
              </div>

              <div className="w-full lg:w-auto">
                <button
                  onClick={() => setSelectedHackathon(featuredHackathon)}
                  className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-2xl shadow-md shadow-amber-200 transition-all cursor-pointer"
                >
                  <span>Quick View Hackathon</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-5 rounded-2xl border border-emerald-900/10 shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search hackathons by keyword, theme, or organizer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 placeholder-zinc-400 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                  aria-label="Clear search input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="w-full md:w-56 px-3.5 py-2.5 text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-800 cursor-pointer"
            >
              <option value="all">All Modes (Online & Hybrid)</option>
              <option value="online">Online Hackathons</option>
              <option value="in-person">In-Person Sprints</option>
              <option value="hybrid">Hybrid / Campus</option>
            </select>

            <button
              onClick={fetchHackathonsData}
              className="p-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl transition-colors cursor-pointer"
              title="Refresh hackathons list"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium pt-1 border-t border-zinc-100">
            <span>Showing {filteredHackathons.length} active hackathons</span>
            {searchQuery || selectedMode !== "all" ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedMode("all");
                }}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300 transition duration-300 shadow-sm cursor-pointer"
              >
                Reset Filters
              </button>
            ) : null}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredHackathons.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-emerald-900/10 space-y-3">
            <Filter className="w-10 h-10 text-zinc-300 mx-auto" />
            <h3 className="text-lg font-bold text-zinc-800">No hackathons found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              No active hackathons match your current search query. Try clearing your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredHackathons.map((hackathon) => (
              <HackathonCard
                key={`hackathon-${hackathon.id}`}
                hackathon={hackathon}
                onClick={(data) => setSelectedHackathon(data)}
              />
            ))}
          </div>
        )}
      </div>

      <DetailDrawer
        isOpen={Boolean(selectedHackathon)}
        onClose={() => setSelectedHackathon(null)}
        type="hackathon"
        data={selectedHackathon}
      />
    </main>
  );
}
