import React from "react";
import EventCard from "Pages/Events/EventCard";
import { notifyLenisResize, getImageAspectRatioStyle } from "utils/lenisUtils";

export default function EventGridVirtualizer({ events = [], viewMode = "grid" }) {
  if (!events || events.length === 0) {
    return null;
  }

  const aspectStyle = getImageAspectRatioStyle(16, 9);

  return (
    <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
      {events.map((evt, idx) => (
        <div
          key={evt.id || idx}
          className="relative rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 transition-all duration-300"
        >
          {/* Bounding box skeleton container to prevent layout shifts before image hydration */}
          <div style={aspectStyle} className="bg-gray-200 dark:bg-gray-800 animate-pulse relative overflow-hidden">
            {evt.bannerImage && (
              <img
                src={evt.bannerImage}
                alt={evt.title || "Event Banner"}
                onLoad={() => notifyLenisResize(100)}
                className="w-full h-full object-cover relative z-10 transition-opacity duration-300"
                loading="lazy"
              />
            )}
          </div>

          <div className="p-4">
            <EventCard event={evt} index={idx} />
          </div>
        </div>
      ))}
    </div>
  );
}
