"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FolderKanban, 
  Search, 
  ThumbsUp, 
  Code2, 
  Filter, 
  RefreshCw, 
  Sparkles, 
  ArrowRight, 
  PlusCircle, 
  ArrowUpRight
} from "lucide-react";
import { getProjects } from "@/lib/api";
import ProjectCard from "@/components/ui/ProjectCard";
import DetailDrawer from "@/components/ui/DetailDrawer";
import { CardSkeleton } from "@/components/ui/Skeleton";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchProjectsData = async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      setProjects(data || []);
    } catch (err) {
      console.warn("Failed to fetch projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsData();
  }, []);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      (p.category || "").toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const featuredProject = projects[0];

  return (
    <main className="min-h-screen bg-[#f4fbf7] text-zinc-900 font-sans py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-900 text-xs font-semibold">
            <FolderKanban className="w-3.5 h-3.5 text-[#00b887]" />
            <span>Community Open Source Showcase</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 leading-tight">
            Discover Open Source & Hackathon Projects
          </h1>

          <p className="text-base text-zinc-600 leading-relaxed font-normal">
            Explore developer tools, autonomous AI pipelines, web applications, and CLI utilities built by community builders.
          </p>

          <div className="pt-2 flex justify-center">
            <Link
              href="/submit-project"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00b887] hover:bg-[#049d73] text-white font-bold text-xs rounded-full shadow-md shadow-emerald-200 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit Your Project</span>
            </Link>
          </div>
        </div>

        {featuredProject && !loading && (
          <div className="bg-white border border-emerald-900/10 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-[#00b887]" />
                    <span>Spotlight Project</span>
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    👍 {featuredProject.upvotes || 0} Upvotes
                  </span>
                </div>

                <h2 className="text-2xl font-extrabold text-zinc-900">
                  {featuredProject.title}
                </h2>

                <p className="text-sm text-zinc-600 leading-relaxed">
                  {featuredProject.description}
                </p>

                <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium pt-2">
                  <span className="flex items-center gap-1">
                    <Code2 className="w-4 h-4 text-emerald-600" />
                    <span>{featuredProject.category || "Open Source"}</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                <button
                  onClick={() => setSelectedProject(featuredProject)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#00b887] hover:bg-[#049d73] text-white font-bold text-xs rounded-2xl shadow-md shadow-emerald-200 transition-all cursor-pointer"
                >
                  <span>Quick View Details</span>
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
                placeholder="Search projects by keyword, tech stack, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00b887] text-zinc-900 placeholder-zinc-400 transition-all"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-56 px-3.5 py-2.5 text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00b887] text-zinc-800 cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="developer tools">Developer Tools</option>
              <option value="web development">Web Development</option>
              <option value="ai">AI & Autonomous Agents</option>
              <option value="cloud native">Cloud Native</option>
            </select>

            <button
              onClick={fetchProjectsData}
              className="p-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl transition-colors cursor-pointer"
              title="Refresh projects list"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium pt-1 border-t border-zinc-100">
            <span>Showing {filteredProjects.length} open source projects</span>
            {searchQuery || selectedCategory !== "all" ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="text-[#00b887] hover:underline font-semibold"
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
        ) : filteredProjects.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-emerald-900/10 space-y-3">
            <Filter className="w-10 h-10 text-zinc-300 mx-auto" />
            <h3 className="text-lg font-bold text-zinc-800">No projects found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              No open source projects match your search criteria. Try adjusting your search query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={`project-${project.id}`}
                project={project}
                onClick={(data) => setSelectedProject(data)}
              />
            ))}
          </div>
        )}
      </div>

      <DetailDrawer
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
        type="project"
        data={selectedProject}
      />
    </main>
  );
}
