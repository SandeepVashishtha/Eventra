import React from "react";

export default function Workflow() {
  return (
    <section className="py-20 bg-[#f4fbf7] border-b border-emerald-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            Workflow
          </h2>
          <p className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            Simple process for builders and organizers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
            <div className="w-8 h-8 rounded-full bg-zinc-900 text-white font-bold text-sm flex items-center justify-center">
              1
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Explore & Register</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Filter events and hackathons by format, topic, or date. RSVP with a single click and access event schedules.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
            <div className="w-8 h-8 rounded-full bg-zinc-900 text-white font-bold text-sm flex items-center justify-center">
              2
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Collaborate & Build</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Form teams with fellow participants, attend technical workshops, and push your code to your repository.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
            <div className="w-8 h-8 rounded-full bg-zinc-900 text-white font-bold text-sm flex items-center justify-center">
              3
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Submit & Showcase</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Submit project links and demo videos for judging. Published projects remain visible on Eventra for community feedback.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
