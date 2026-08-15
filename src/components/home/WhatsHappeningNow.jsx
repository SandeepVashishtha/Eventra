"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Calendar, 
  Trophy, 
  FolderKanban, 
  Search, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Globe2,
  Filter,
  Pause,
  Play
} from "lucide-react";
import { getEvents, getHackathons, getProjects } from "@/lib/api";
import EventCard from "@/components/ui/EventCard";
import HackathonCard from "@/components/ui/HackathonCard";
import ProjectCard from "@/components/ui/ProjectCard";
import DetailDrawer from "@/components/ui/DetailDrawer";
import { CardSkeleton } from "@/components/ui/Skeleton";

export default function WhatsHappeningNow() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  const [events, setEvents] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [projects, setProjects] = useState([]);

  const [drawerState, setDrawerState] = useState({
    isOpen: false,
    type: "event",
    data: null
  });

  const carouselRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    setIsRefreshing(true);
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
      console.warn("Failed to fetch live data", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredEvents = events.filter((e) =>
    (e.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHackathons = hackathons.filter((h) =>
    (h.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (h.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = projects.filter((p) =>
    (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCarouselItems = () => {
    const items = [];
    if (activeTab === "all" || activeTab === "events") {
      filteredEvents.forEach((item) => items.push({ type: "event", data: item }));
    }
    if (activeTab === "all" || activeTab === "hackathons") {
      filteredHackathons.forEach((item) => items.push({ type: "hackathon", data: item }));
    }
    if (activeTab === "all" || activeTab === "projects") {
      filteredProjects.forEach((item) => items.push({ type: "project", data: item }));
    }
    return items;
  };

  const carouselItems = getCarouselItems();

  const scrollSingleCard = (direction) => {
    if (!carouselRef.current) return;
    const firstCard = carouselRef.current.firstElementChild;
    const cardWidth = firstCard ? firstCard.clientWidth + 24 : 340;
    carouselRef.current.scrollBy({
      left: direction === "next" ? cardWidth : -cardWidth,
      behavior: "smooth"
    });
  };

  useEffect(() => {
    if (!isAutoplay || isHovering || loading || carouselItems.length === 0 || drawerState.isOpen) return;

    const interval = setInterval(() => {
      if (!carouselRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      const firstCard = carouselRef.current.firstElementChild;
      const step = firstCard ? firstCard.clientWidth + 24 : 340;

      if (scrollLeft + clientWidth >= scrollWidth - 20) {
        carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        carouselRef.current.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 3200);

    return () => clearInterval(interval);
  }, [isAutoplay, isHovering, loading, carouselItems.length, drawerState.isOpen]);

  const openItemDrawer = (itemType, itemData) => {
    setDrawerState({
      isOpen: true,
      type: itemType,
      data: itemData
    });
  };

  return (
    <section className="py-16 bg-[#f4fbf7] border-b border-emerald-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>What&apos;s Happening Now</span>
              </span>

              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                <Globe2 className="w-3 h-3 text-zinc-400" />
                <span>Backend Live API</span>
              </span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
              Live & Upcoming Opportunities
            </h2>
            <p className="text-sm text-zinc-600 max-w-xl">
              Real-time feed of public workshops, active hackathons, and trending open-source projects synced from Eventra API.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
              <input
                type="text"
                placeholder="Search live feed..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-zinc-900 placeholder-zinc-400 shadow-2xs transition-all"
              />
            </div>

            <button
              onClick={fetchData}
              disabled={isRefreshing}
              className="p-2 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-xl text-zinc-600 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              title="Refresh Live Feed"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
            </button>

            <button
              onClick={() => setIsAutoplay(!isAutoplay)}
              className="p-2 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-xl text-zinc-600 transition-colors shadow-2xs cursor-pointer"
              title={isAutoplay ? "Pause Autoplay" : "Resume Autoplay"}
            >
              {isAutoplay ? <Pause className="w-4 h-4 text-zinc-600" /> : <Play className="w-4 h-4 text-blue-600" />}
            </button>

            <div className="flex items-center gap-1 bg-white border border-zinc-200 p-1 rounded-xl shadow-2xs">
              <button
                onClick={() => scrollSingleCard("prev")}
                className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-700 transition-colors cursor-pointer"
                aria-label="Previous Card"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="w-px h-4 bg-zinc-200" />
              <button
                onClick={() => scrollSingleCard("next")}
                className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-700 transition-colors cursor-pointer"
                aria-label="Next Card"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 border-b border-zinc-200 pb-3 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-zinc-900 text-white shadow-xs"
                : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100"
            }`}
          >
            All Items ({events.length + hackathons.length + projects.length})
          </button>

          <button
            onClick={() => setActiveTab("events")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
              activeTab === "events"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Events ({events.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("hackathons")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
              activeTab === "hackathons"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Hackathons ({hackathons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
              activeTab === "projects"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100"
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Projects ({projects.length})</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : carouselItems.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-zinc-200 space-y-3">
            <Filter className="w-8 h-8 text-zinc-300 mx-auto" />
            <h4 className="text-base font-bold text-zinc-800">No items match your filter</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Try adjusting your search query or tab to discover active items.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveTab("all");
              }}
              className="mt-2 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="relative group">
            <div
              ref={carouselRef}
              className="flex items-stretch gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-4 pt-1 snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {carouselItems.map((item) => (
                <div
                  key={`${item.type}-${item.data.id}`}
                  className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] shrink-0 snap-start flex flex-col"
                >
                  {item.type === "event" && (
                    <EventCard
                      event={item.data}
                      onClick={(data) => openItemDrawer("event", data)}
                    />
                  )}
                  {item.type === "hackathon" && (
                    <HackathonCard
                      hackathon={item.data}
                      onClick={(data) => openItemDrawer("hackathon", data)}
                    />
                  )}
                  {item.type === "project" && (
                    <ProjectCard
                      project={item.data}
                      onClick={(data) => openItemDrawer("project", data)}
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => scrollSingleCard("prev")}
              className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-11 h-11 rounded-full bg-white border border-zinc-200 text-zinc-800 items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 hover:bg-zinc-50 hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
              aria-label="Previous Single Card"
            >
              <ChevronLeft className="w-6 h-6 text-zinc-700" />
            </button>
            <button
              onClick={() => scrollSingleCard("next")}
              className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-11 h-11 rounded-full bg-white border border-zinc-200 text-zinc-800 items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 hover:bg-zinc-50 hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
              aria-label="Next Single Card"
            >
              <ChevronRight className="w-6 h-6 text-zinc-700" />
            </button>
          </div>
        )}
      </div>

      {/* Side Drawer Modal */}
      <DetailDrawer
        isOpen={drawerState.isOpen}
        onClose={() => setDrawerState({ ...drawerState, isOpen: false })}
        type={drawerState.type}
        data={drawerState.data}
      />
    </section>
  );
}
