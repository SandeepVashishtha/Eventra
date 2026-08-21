"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Bookmark, ArrowUpRight } from "lucide-react";
import { useDrawer } from "@/context/DrawerContext";

export default function HackathonCard({ hackathon, onClick }) {
  const { openDrawer } = useDrawer();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const formattedStart = hackathon?.startDate
    ? new Date(hackathon.startDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric"
      })
    : "TBD";

  const imageUrl =
    hackathon?.imageUrl ||
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop";

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("eventra_bookmarks") || "[]");
      setIsBookmarked(saved.some((item) => item.id === hackathon?.id && item.type === "hackathon"));
    } catch (e) {}
  }, [hackathon?.id]);

  const toggleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved = JSON.parse(localStorage.getItem("eventra_bookmarks") || "[]");
      let updated;
      if (isBookmarked) {
        updated = saved.filter((item) => !(item.id === hackathon?.id && item.type === "hackathon"));
        setIsBookmarked(false);
      } else {
        updated = [...saved, { ...hackathon, type: "hackathon", savedAt: Date.now() }];
        setIsBookmarked(true);
      }
      localStorage.setItem("eventra_bookmarks", JSON.stringify(updated));
    } catch (e) {}
  };

  const handleCardClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick(hackathon);
    } else {
      openDrawer("hackathon", hackathon);
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
          src={imageUrl}
          alt={hackathon?.title || "Hackathon Banner"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
          unoptimized
        />

        {/* Minimal Category & Prize Tag */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-neutral-900/80 text-white backdrop-blur-md">
            Hackathon
          </span>
          {hackathon?.prizePool && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-white/90 text-neutral-900 backdrop-blur-md">
              {hackathon.prizePool}
            </span>
          )}
        </div>

        {/* Floating Minimal Action Buttons */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={toggleBookmark}
            title={isBookmarked ? "Remove Bookmark" : "Save Hackathon"}
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
            {hackathon?.title}
          </h3>
          <span className="text-xs font-mono text-neutral-400 shrink-0">
            {formattedStart}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span className="truncate max-w-[200px]">
            {hackathon?.mode || "Online"} · {hackathon?.organizer || "Global"}
          </span>
          <span className="text-neutral-400 group-hover:text-neutral-900 transition-colors inline-flex items-center gap-0.5">
            <span>Register</span>
            <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </article>
  );
}
