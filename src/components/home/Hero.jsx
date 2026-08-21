"use client";

import React, { useState } from "react";
import { Search, Sparkles, ArrowRight, X } from "lucide-react";

export default function Hero({ searchQuery, setSearchQuery, onSearchSubmit }) {
  const [localSearch, setLocalSearch] = useState(searchQuery || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (setSearchQuery) setSearchQuery(localSearch);
    if (onSearchSubmit) onSearchSubmit(localSearch);
  };

  const handleClear = () => {
    setLocalSearch("");
    if (setSearchQuery) setSearchQuery("");
  };

  return (
    <section className="pt-12 pb-8 sm:pt-16 sm:pb-12 border-b border-neutral-200/80 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Large Editorial Headline */}
        <div className="max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-neutral-500 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-neutral-900"></span>
            <span>Curated Directory · Daily Updates</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-medium tracking-tight text-neutral-950 leading-[1.12]">
            For the love of tech events, global hackathons &amp; developer projects.
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 font-normal leading-relaxed max-w-2xl">
            A hand-picked index of technical workshops, high-stakes hackathons, and trending open-source work from builders around the world.
          </p>

          {/* Minimal Search & Filter Bar */}
          <div className="pt-2 max-w-2xl">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => {
                    setLocalSearch(e.target.value);
                    if (setSearchQuery) setSearchQuery(e.target.value);
                  }}
                  placeholder="Search events, hackathons, open-source repositories..."
                  className="w-full pl-11 pr-24 py-3.5 bg-white border border-neutral-300 hover:border-neutral-400 focus:border-neutral-950 focus:outline-none rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors shadow-2xs"
                />
                {localSearch && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-800"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>Search</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </form>

            <div className="flex items-center gap-3 pt-3 text-xs text-neutral-500">
              <span className="font-mono text-neutral-400">Popular:</span>
              <button 
                type="button"
                onClick={() => { setLocalSearch("AI"); if (setSearchQuery) setSearchQuery("AI"); }}
                className="hover:text-neutral-950 hover:underline transition-colors cursor-pointer"
              >
                AI &amp; LLMs
              </button>
              <span>·</span>
              <button 
                type="button"
                onClick={() => { setLocalSearch("Hackathon"); if (setSearchQuery) setSearchQuery("Hackathon"); }}
                className="hover:text-neutral-950 hover:underline transition-colors cursor-pointer"
              >
                Global Hackathons
              </button>
              <span>·</span>
              <button 
                type="button"
                onClick={() => { setLocalSearch("Open Source"); if (setSearchQuery) setSearchQuery("Open Source"); }}
                className="hover:text-neutral-950 hover:underline transition-colors cursor-pointer"
              >
                Open Source
              </button>
              <span>·</span>
              <button 
                type="button"
                onClick={() => { setLocalSearch("Web3"); if (setSearchQuery) setSearchQuery("Web3"); }}
                className="hover:text-neutral-950 hover:underline transition-colors cursor-pointer"
              >
                Web3
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
