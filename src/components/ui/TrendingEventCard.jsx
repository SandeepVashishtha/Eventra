"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Bookmark, ArrowUpRight, Calendar } from "lucide-react";
import { useDrawer } from "@/context/DrawerContext";

export default function TrendingEventCard({ event, onClick }) {
  const { openDrawer } = useDrawer();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const formattedDate = event?.eventDate
    ? new Date(event.eventDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    : "Date TBD";

  const imageUrl =
    event?.imageUrl ||
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop";

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("eventra_bookmarks") || "[]");
      setIsBookmarked(saved.some((item) => item.id === event?.id && item.type === "event"));
    } catch (e) {}
  }, [event?.id]);

  const toggleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved = JSON.parse(localStorage.getItem("eventra_bookmarks") || "[]");
      let updated;
      if (isBookmarked) {
        updated = saved.filter((item) => !(item.id === event?.id && item.type === "event"));
        setIsBookmarked(false);
      } else {
        updated = [...saved, { ...event, type: "event", savedAt: Date.now() }];
        setIsBookmarked(true);
      }
      localStorage.setItem("eventra_bookmarks", JSON.stringify(updated));
    } catch (e) {}
  };

  const handleCardClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick(event);
    } else {
      openDrawer("event", event);
    }
  };

  return (
    <article
      onClick={handleCardClick}
      className="group flex flex-col gap-2.5 cursor-pointer select-none"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-neutral-100 border border-neutral-200/80 group-hover:border-neutral-400 transition-all duration-300">
        <Image
          src={imageUrl}
          alt={event?.title || "Event Cover"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
          unoptimized
        />

        <div className="absolute top-2.5 left-2.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-neutral-900/80 text-white backdrop-blur-md">
            Featured
          </span>
        </div>

        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={toggleBookmark}
            title={isBookmarked ? "Remove Bookmark" : "Save Event"}
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

      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-medium text-neutral-950 group-hover:text-neutral-600 transition-colors line-clamp-1">
            {event?.title}
          </h3>
          <span className="text-xs font-mono text-neutral-400 shrink-0">
            {formattedDate}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span className="truncate max-w-[200px]">
            {event?.location || "Online"} · {event?.registeredCount || 0} registered
          </span>
          <span className="text-neutral-400 group-hover:text-neutral-900 transition-colors inline-flex items-center gap-0.5">
            <span>Details</span>
            <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </article>
  );
}
