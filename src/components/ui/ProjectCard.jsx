"use client";

import React from "react";
import Image from "next/image";
import { FolderKanban, ThumbsUp, Code2, ArrowUpRight } from "lucide-react";
import { useDrawer } from "@/context/DrawerContext";
import { sanitizeProfileUrl } from "@/utils/sanitizeProfileUrl";

export default function ProjectCard({ project, onClick }) {
  const { openDrawer } = useDrawer();

  const thumbnailUrl =
    project?.thumbnailUrl ||
    "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=800&auto=format&fit=crop";
  const githubUrl = sanitizeProfileUrl(project?.githubUrl, "github");

  const handleCardClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick(project);
    } else {
      openDrawer("project", project);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group h-full bg-white border border-zinc-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer select-none"
    >
      <div>
        <div className="relative h-44 w-full overflow-hidden bg-zinc-100">
          <Image
            src={thumbnailUrl}
            alt={project?.title || "Project Thumbnail"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-md">
              <FolderKanban className="w-3.5 h-3.5" />
              <span>{project?.category || "Project"}</span>
            </span>

            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-900 bg-emerald-100/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-200">
              <ThumbsUp className="w-3 h-3 text-emerald-700" />
              <span>{project?.upvotes || 0} Upvotes</span>
            </span>
          </div>

          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-base font-extrabold text-white line-clamp-1 leading-snug drop-shadow-sm group-hover:text-emerald-200 transition-colors">
              {project?.title}
            </h3>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2 font-normal">
            {project?.description}
          </p>
        </div>
      </div>

      <div className="px-5 py-3.5 bg-zinc-50/60 border-t border-zinc-100 flex items-center justify-between text-xs">
        {githubUrl ? (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 font-semibold text-zinc-700 hover:text-zinc-900 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-zinc-500" />
            <span>Repository</span>
            <ArrowUpRight className="w-3 h-3 text-zinc-400" />
          </a>
        ) : (
          <span className="text-zinc-400 font-medium">Open Source</span>
        )}

        <div className="inline-flex items-center gap-1.5 font-bold text-emerald-600 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all">
          <span>View Project</span>
        </div>
      </div>
    </div>
  );
}
