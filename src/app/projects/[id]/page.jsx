"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { 
  FolderKanban, 
  ThumbsUp, 
  Code2, 
  ArrowLeft, 
  ArrowUpRight, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck,
  Star,
  AlertCircle
} from "lucide-react";
import { getProjectById, upvoteProject } from "@/lib/api";
import { CardSkeleton } from "@/components/ui/Skeleton";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params?.id;

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upvotes, setUpvotes] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    async function loadProject() {
      setLoading(true);
      try {
        const data = await getProjectById(projectId);
        setProject(data);
        setUpvotes(data?.upvotes || 0);
      } catch (err) {
        console.warn("Failed to load project details", err);
      } finally {
        setLoading(false);
      }
    }

    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const handleUpvote = async () => {
    if (hasUpvoted) return;
    setActionError("");
    // Optimistic update, rolled back below if the request fails.
    setUpvotes((prev) => prev + 1);
    setHasUpvoted(true);
    try {
      await upvoteProject(projectId);
    } catch (err) {
      console.warn("Upvote error", err);
      setUpvotes((prev) => Math.max(0, prev - 1));
      setHasUpvoted(false);
      setActionError(err?.message || "Could not record your upvote. Please try again.");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4fbf7] py-12 px-4 max-w-4xl mx-auto space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-[#f4fbf7] py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-zinc-800">Project Not Found</h2>
        <Link href="/projects" className="text-[#00b887] hover:underline text-sm font-semibold">
          Return to Projects List
        </Link>
      </main>
    );
  }

  const thumbnailUrl =
    project.thumbnailUrl ||
    "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=800&auto=format&fit=crop";

  return (
    <main className="min-h-screen bg-[#f4fbf7] text-zinc-900 font-sans py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Back Link */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Projects</span>
        </Link>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Main Details */}
          <div className="lg:col-span-8 space-y-8">
            
            <div className="bg-white border border-emerald-900/10 rounded-3xl overflow-hidden shadow-2xs">
              
              {/* Banner Image */}
              <div className="relative h-64 sm:h-80 w-full bg-zinc-100">
                <Image
                  src={thumbnailUrl}
                  alt={project.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00b887] text-white text-xs font-bold shadow-md">
                    <FolderKanban className="w-3.5 h-3.5" />
                    <span>{project.category || "Open Source"}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-900 bg-emerald-100/90 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-200">
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{upvotes} Upvotes</span>
                  </span>
                </div>

                <div className="absolute bottom-4 left-6 right-6">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow-sm">
                    {project.title}
                  </h1>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-8 space-y-6">
                
                <div className="space-y-3 text-sm text-zinc-600 leading-relaxed font-normal">
                  <h2 className="text-lg font-extrabold text-zinc-900">About this project</h2>
                  <p>{project.description}</p>
                  <p>
                    Built by community contributors, this project provides reusable code modules, transparent documentation, and continuous integration workflows.
                  </p>
                </div>

                {/* Tech Highlights */}
                <div className="pt-6 border-t border-zinc-100 space-y-3">
                  <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#00b887]" />
                    <span>Project Architecture & Stack</span>
                  </h3>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-3 py-1 rounded-full bg-zinc-100 font-semibold text-zinc-800 border border-zinc-200">
                      TypeScript
                    </span>
                    <span className="px-3 py-1 rounded-full bg-zinc-100 font-semibold text-zinc-800 border border-zinc-200">
                      Next.js
                    </span>
                    <span className="px-3 py-1 rounded-full bg-zinc-100 font-semibold text-zinc-800 border border-zinc-200">
                      REST API
                    </span>
                    <span className="px-3 py-1 rounded-full bg-zinc-100 font-semibold text-zinc-800 border border-zinc-200">
                      Tailwind CSS
                    </span>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 shadow-md space-y-6 sticky top-24">
              
              <div className="space-y-3">
                <div className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                  Project Actions
                </div>

                {/* Upvote Button */}
                <button
                  onClick={handleUpvote}
                  disabled={hasUpvoted}
                  className={`w-full py-3.5 px-6 font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    hasUpvoted
                      ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                      : "bg-[#00b887] hover:bg-[#049d73] text-white shadow-emerald-200"
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{hasUpvoted ? `Upvoted (${upvotes})` : `Upvote Project (${upvotes})`}</span>
                </button>

                {actionError && (
                  <div
                    role="alert"
                    className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-start gap-2 font-medium"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-px" />
                    <span>{actionError}</span>
                  </div>
                )}

                {/* GitHub Repository Link */}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-6 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    <Code2 className="w-4 h-4" />
                    <span>View Repository</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 pt-2 border-t border-zinc-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Open Source</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
