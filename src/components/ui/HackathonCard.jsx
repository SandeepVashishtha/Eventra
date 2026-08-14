"use client";

import React from "react";
import Image from "next/image";
import { Trophy, Award, ArrowRight, Sparkles, MapPin } from "lucide-react";
import { useDrawer } from "@/context/DrawerContext";

export default function HackathonCard({ hackathon, onClick }) {
  const { openDrawer } = useDrawer();

  const formattedStart = hackathon?.startDate
    ? new Date(hackathon.startDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric"
      })
    : "TBD";

  const formattedEnd = hackathon?.endDate
    ? new Date(hackathon.endDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    : "";

  const imageUrl =
    hackathon?.imageUrl ||
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop";

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
    <div
      onClick={handleCardClick}
      className="group h-full bg-white border border-zinc-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xl hover:border-amber-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer select-none"
    >
      <div>
        <div className="relative h-44 w-full overflow-hidden bg-zinc-100">
          <Image
            src={imageUrl}
            alt={hackathon?.title || "Hackathon Banner"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow-md">
              <Trophy className="w-3.5 h-3.5" />
              <span>{hackathon?.mode || "Hackathon"}</span>
            </span>

            {hackathon?.prizePool && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-200">
                <Award className="w-3 h-3 text-amber-700" />
                <span>{hackathon.prizePool}</span>
              </span>
            )}
          </div>

          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-base font-extrabold text-white line-clamp-1 leading-snug drop-shadow-sm group-hover:text-amber-200 transition-colors">
              {hackathon?.title}
            </h3>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2 font-normal">
            {hackathon?.description}
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 font-medium">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span className="truncate max-w-[140px]">{hackathon?.organizer || "Community Organized"}</span>
            </div>

            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 font-medium">
              <MapPin className="w-3 h-3 text-zinc-400" />
              <span>{hackathon?.location || "Online"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-3.5 bg-zinc-50/60 border-t border-zinc-100 flex items-center justify-between text-xs">
        <span className="text-zinc-500 font-medium font-mono">{formattedStart} - {formattedEnd}</span>
        <div className="inline-flex items-center gap-1.5 font-bold text-amber-700 group-hover:text-amber-800 group-hover:translate-x-0.5 transition-all">
          <span>Register Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
