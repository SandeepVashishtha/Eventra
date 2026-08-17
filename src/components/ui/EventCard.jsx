"use client";

import React from "react";
import Image from "next/image";
import { Calendar, MapPin, Users, ArrowRight, Clock } from "lucide-react";
import { useDrawer } from "@/context/DrawerContext";

export default function EventCard({ event, onClick }) {
  const { openDrawer } = useDrawer();

  const formattedDate = event?.eventDate
    ? new Date(event.eventDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    : "Date TBD";

  const formattedTime = event?.eventDate
    ? new Date(event.eventDate).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit"
      })
    : "";

  const imageUrl =
    event?.imageUrl ||
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop";

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
    <div
      onClick={handleCardClick}
      className="group h-full bg-white border border-zinc-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer select-none"
    >
      <div>
        <div className="relative h-44 w-full overflow-hidden bg-zinc-100">
          <Image
            src={imageUrl}
            alt={event?.title || "Event Image"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00b887] text-white text-xs font-bold shadow-md">
              <Calendar className="w-3.5 h-3.5" />
              <span>Event</span>
            </span>

            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
              <Clock className="w-3 h-3 text-emerald-300" />
              <span>{formattedDate}</span>
            </span>
          </div>

          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-base font-extrabold text-white line-clamp-1 leading-snug drop-shadow-sm group-hover:text-emerald-200 transition-colors">
              {event?.title}
            </h3>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2 font-normal">
            {event?.description}
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 font-medium">
              <MapPin className="w-3 h-3 text-emerald-600" />
              <span className="truncate max-w-[130px]">{event?.location || "Online"}</span>
            </div>

            {event?.registeredCount !== undefined && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 font-medium">
                <Users className="w-3 h-3 text-emerald-600" />
                <span>{event.registeredCount} attending</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 py-3.5 bg-zinc-50/60 border-t border-zinc-100 flex items-center justify-between text-xs">
        <span className="text-zinc-500 font-medium">{formattedTime ? formattedTime : "Public Workshop"}</span>
        <div className="inline-flex items-center gap-1.5 font-bold text-[#00b887] group-hover:text-[#049d73] group-hover:translate-x-0.5 transition-all">
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
