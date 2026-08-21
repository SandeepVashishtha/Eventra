"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Bookmark, ArrowUpRight, Star, Heart } from "lucide-react";
import { useDrawer } from "@/context/DrawerContext";
import { upvoteProject } from "@/lib/api";

export default function ProjectCard({ project, onClick }) {
  const { openDrawer } = useDrawer();
  const [upvotes, setUpvotes] = useState(project?.upvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [githubStars, setGithubStars] = useState(null);

  useEffect(() => {
    setUpvotes(project?.upvotes || 0);
  }, [project]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("eventra_bookmarks") || "[]");
      setIsBookmarked(saved.some((item) => item.id === project?.id && item.type === "project"));
    } catch (e) {}
  }, [project?.id]);

  useEffect(() => {
    async function fetchStars() {
      if (!project?.githubUrl) return;
      try {
        const cleanUrl = project.githubUrl.replace(/\/$/, "");
        const match = cleanUrl.match(/github\.com\/([^/]+\/[^/]+)/);
        if (match && match[1]) {
          const repoPath = match[1];
          const res = await fetch(`https://api.github.com/repos/${repoPath}`);
          if (res.ok) {
            const data = await res.json();
            if (typeof data.stargazers_count === "number") {
              setGithubStars(data.stargazers_count);
            }
          }
        }
      } catch (err) {}
    }
    fetchStars();
  }, [project?.githubUrl]);

  const handleUpvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasUpvoted) return;

    setUpvotes((prev) => prev + 1);
    setHasUpvoted(true);
    try {
      await upvoteProject(project.id);
    } catch (err) {}
  };

  const toggleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved = JSON.parse(localStorage.getItem("eventra_bookmarks") || "[]");
      let updated;
      if (isBookmarked) {
        updated = saved.filter((item) => !(item.id === project?.id && item.type === "project"));
        setIsBookmarked(false);
      } else {
        updated = [...saved, { ...project, type: "project", savedAt: Date.now() }];
        setIsBookmarked(true);
      }
      localStorage.setItem("eventra_bookmarks", JSON.stringify(updated));
    } catch (e) {}
  };

  const thumbnailUrl =
    project?.thumbnailUrl ||
    "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=800&auto=format&fit=crop";

  const handleCardClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick({ ...project, upvotes });
    } else {
      openDrawer("project", { ...project, upvotes });
    }
  };

  return (
    <article
      onClick={handleCardClick}
      className="group flex flex-col gap-2.5 cursor-pointer select-none"
    >
      {/* Media container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-neutral-100 border border-neutral-200/80 group-hover:border-neutral-400 transition-all duration-300">
        <Image
          src={thumbnailUrl}
          alt={project?.title || "Project Thumbnail"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
          unoptimized
        />

        {/* Minimal Category Tag */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-neutral-900/80 text-white backdrop-blur-md">
            {project?.category || "Project"}
          </span>
          {githubStars !== null && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-white/90 text-neutral-900 backdrop-blur-md">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{githubStars}</span>
            </span>
          )}
        </div>

        {/* Floating Minimal Action Buttons */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={handleUpvote}
            title="Applaud Project"
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${
              hasUpvoted
                ? "bg-rose-600 text-white"
                : "bg-white/90 text-neutral-800 hover:bg-white"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${hasUpvoted ? "fill-white" : ""}`} />
          </button>

          <button
            type="button"
            onClick={toggleBookmark}
            title={isBookmarked ? "Remove Bookmark" : "Save Project"}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${
              isBookmarked
                ? "bg-neutral-900 text-white"
                : "bg-white/90 text-neutral-800 hover:bg-white"
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-white" : ""}`} />
          </button>
        </div>
      </div>

      {/* Text Details */}
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-medium text-neutral-950 group-hover:text-neutral-600 transition-colors line-clamp-1">
            {project?.title}
          </h3>
          <span className="text-xs font-mono text-neutral-400 shrink-0">
            {upvotes} votes
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span className="truncate max-w-[200px]">
            {project?.author || "Open Source Builder"}
          </span>
          <span className="text-neutral-400 group-hover:text-neutral-900 transition-colors inline-flex items-center gap-0.5">
            <span>Explore</span>
            <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </article>
  );
}
