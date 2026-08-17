import React from "react";
import Link from "next/link";

export default function HostCTA() {
  return (
    <section className="py-16 bg-[#f4fbf7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-zinc-900 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Organizing an event or hackathon?
            </h3>
            <p className="text-sm text-zinc-400 max-w-lg">
              Publish your event on Eventra to reach developers, manage registrations, and accept project submissions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              href="/host"
              className="w-full sm:w-auto px-6 py-3 bg-white text-zinc-900 font-semibold text-sm rounded-full hover:bg-zinc-100 transition-colors text-center"
            >
              Host an Event
            </Link>
            <Link
              href="/events"
              className="w-full sm:w-auto px-6 py-3 bg-zinc-800 text-white font-semibold text-sm rounded-full hover:bg-zinc-700 transition-colors border border-zinc-700 text-center"
            >
              Find Events
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
