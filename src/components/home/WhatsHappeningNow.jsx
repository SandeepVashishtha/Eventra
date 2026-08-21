"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Grid3X3, 
  LayoutGrid, 
  Sparkles, 
  SlidersHorizontal,
  ArrowRight,
  RefreshCw,
  Search
} from "lucide-react";
import { getEvents, getHackathons, getProjects } from "@/lib/api";
import EventCard from "@/components/ui/EventCard";
import HackathonCard from "@/components/ui/HackathonCard";
import ProjectCard from "@/components/ui/ProjectCard";
import DetailDrawer from "@/components/ui/DetailDrawer";
import { CardSkeleton } from "@/components/ui/Skeleton";

export default function WhatsHappeningNow({ searchQuery = "" }) {
  const [activeTag, setActiveTag] = useState("all");
  const [loading, setLoading] = useState(true);
  const [viewColumns, setViewColumns] = useState(3); // 3 or 4 columns
  
  const [events, setEvents] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [projects, setProjects] = useState([]);

  const [drawerState, setDrawerState] = useState({
    isOpen: false,
    type: "event",
    data: null
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsData, hackathonsData, projectsData] = await Promise.all([
        getEvents(),
        getHackathons(),
        getProjects()
      ]);
      setEvents(eventsData || []);
      setHackathons(hackathonsData || []);
      setProjects(projectsData || []);
    } catch (error) {
      console.warn("Failed to fetch live directory data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter items based on activeTag and searchQuery
  const query = searchQuery.toLowerCase().trim();

  const matchesQuery = (item) => {
    if (!query) return true;
    const title = (item.title || "").toLowerCase();
    const desc = (item.description || "").toLowerCase();
    const cat = (item.category || item.mode || item.location || "").toLowerCase();
    return title.includes(query) || desc.includes(query) || cat.includes(query);
  };

  const getFilteredItems = () => {
    const all = [];

    // Events
    if (activeTag === "all" || activeTag === "events" || activeTag === "virtual" || activeTag === "in-person" || activeTag === "workshops") {
      events.forEach((ev) => {
        let matchTag = true;
        if (activeTag === "virtual") matchTag = (ev.location || "").toLowerCase().includes("online") || (ev.location || "").toLowerCase().includes("virtual");
        if (activeTag === "in-person") matchTag = !(ev.location || "").toLowerCase().includes("online") && !(ev.location || "").toLowerCase().includes("virtual");
        if (matchTag && matchesQuery(ev)) {
          all.push({ type: "event", data: ev, id: `ev-${ev.id}` });
        }
      });
    }

    // Hackathons
    if (activeTag === "all" || activeTag === "hackathons" || activeTag === "prizes" || activeTag === "ai" || activeTag === "web3") {
      hackathons.forEach((hk) => {
        let matchTag = true;
        if (activeTag === "prizes") matchTag = Boolean(hk.prizePool);
        if (activeTag === "ai") matchTag = (hk.title + " " + hk.description).toLowerCase().includes("ai") || (hk.title + " " + hk.description).toLowerCase().includes("ml");
        if (activeTag === "web3") matchTag = (hk.title + " " + hk.description).toLowerCase().includes("web3") || (hk.title + " " + hk.description).toLowerCase().includes("crypto");
        if (matchTag && matchesQuery(hk)) {
          all.push({ type: "hackathon", data: hk, id: `hk-${hk.id}` });
        }
      });
    }

    // Projects
    if (activeTag === "all" || activeTag === "projects" || activeTag === "opensource" || activeTag === "ai" || activeTag === "web3") {
      projects.forEach((pj) => {
        let matchTag = true;
        if (activeTag === "opensource") matchTag = Boolean(pj.githubUrl);
        if (activeTag === "ai") matchTag = (pj.title + " " + pj.description + " " + (pj.category || "")).toLowerCase().includes("ai");
        if (activeTag === "web3") matchTag = (pj.title + " " + pj.description + " " + (pj.category || "")).toLowerCase().includes("web3");
        if (matchTag && matchesQuery(pj)) {
          all.push({ type: "project", data: pj, id: `pj-${pj.id}` });
        }
      });
    }

    return all;
  };

  const filteredItems = getFilteredItems();

  const tags = [
    { id: "all", label: "All Items", count: events.length + hackathons.length + projects.length },
    { id: "events", label: "Events", count: events.length },
    { id: "hackathons", label: "Hackathons", count: hackathons.length },
    { id: "projects", label: "Projects", count: projects.length },
    { id: "ai", label: "AI & ML" },
    { id: "opensource", label: "Open Source" },
    { id: "prizes", label: "Prize Pools" },
    { id: "virtual", label: "Virtual / Online" },
    { id: "in-person", label: "In-Person" },
  ];

  return (
    <section id="directory" className="py-12 bg-[#fafafa] scroll-mt-14 sm:scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Minimal Tags & View Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200/80">
          
          {/* Horizontal scrolling tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {tags.map((tag) => {
              const isActive = activeTag === tag.id;
              return (
                <button
                  key={tag.id}
                  onClick={() => setActiveTag(tag.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-neutral-900 text-white shadow-2xs"
                      : "bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:border-neutral-300"
                  }`}
                >
                  <span>{tag.label}</span>
                  {tag.count !== undefined && (
                    <span className={`text-[10px] font-mono px-1 rounded ${
                      isActive ? "bg-neutral-800 text-neutral-300" : "bg-neutral-100 text-neutral-500"
                    }`}>
                      {tag.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right: View switcher & refresh */}
          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-neutral-500">
            <span className="font-mono">{filteredItems.length} curated</span>

            <div className="hidden sm:flex items-center border border-neutral-200 rounded-lg p-0.5 bg-white">
              <button
                type="button"
                onClick={() => setViewColumns(3)}
                className={`p-1 rounded transition-colors ${
                  viewColumns === 3 ? "bg-neutral-100 text-neutral-900" : "text-neutral-400 hover:text-neutral-700"
                }`}
                title="3 columns"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewColumns(4)}
                className={`p-1 rounded transition-colors ${
                  viewColumns === 4 ? "bg-neutral-100 text-neutral-900" : "text-neutral-400 hover:text-neutral-700"
                }`}
                title="4 columns"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* The Curated Gallery Grid */}
        <div className="pt-8">
          {loading ? (
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${viewColumns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-x-6 gap-y-10`}>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-neutral-200 max-w-lg mx-auto p-8 space-y-4">
              <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900">
                No items match your filter
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Try switching the category tag or resetting the search query to explore all opportunities.
              </p>
              <button
                type="button"
                onClick={() => { setActiveTag("all"); }}
                className="px-4 py-2 text-xs font-semibold bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${viewColumns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-x-6 gap-y-10`}>
              {filteredItems.map((item) => {
                if (item.type === "event") {
                  return (
                    <EventCard
                      key={item.id}
                      event={item.data}
                      onClick={(data) => setDrawerState({ isOpen: true, type: "event", data })}
                    />
                  );
                }
                if (item.type === "hackathon") {
                  return (
                    <HackathonCard
                      key={item.id}
                      hackathon={item.data}
                      onClick={(data) => setDrawerState({ isOpen: true, type: "hackathon", data })}
                    />
                  );
                }
                if (item.type === "project") {
                  return (
                    <ProjectCard
                      key={item.id}
                      project={item.data}
                      onClick={(data) => setDrawerState({ isOpen: true, type: "project", data })}
                    />
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>

        {/* Minimal Load More / Explore directory button */}
        {!loading && filteredItems.length > 0 && (
          <div className="pt-16 pb-6 text-center">
            <div className="inline-flex items-center gap-4">
              <Link
                href="/events"
                className="px-5 py-2.5 text-xs font-semibold border border-neutral-300 hover:border-neutral-900 bg-white text-neutral-900 rounded-full transition-colors inline-flex items-center gap-1.5"
              >
                <span>Browse All Events</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/hackathons"
                className="px-5 py-2.5 text-xs font-semibold border border-neutral-300 hover:border-neutral-900 bg-white text-neutral-900 rounded-full transition-colors inline-flex items-center gap-1.5"
              >
                <span>Explore Hackathons</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

      </div>

      <DetailDrawer
        isOpen={drawerState.isOpen}
        onClose={() => setDrawerState({ ...drawerState, isOpen: false })}
        type={drawerState.type}
        data={drawerState.data}
      />
    </section>
  );
}
