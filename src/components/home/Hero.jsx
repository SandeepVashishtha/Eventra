"use client";

import React, { useState } from "react";
import { Search, ArrowRight, X, ChevronDown, Sparkles } from "lucide-react";

export default function Hero({ searchQuery, setSearchQuery, onSearchSubmit }) {
  const [localSearch, setLocalSearch] = useState(searchQuery || "");

  const scrollToDirectory = () => {
    const el = document.getElementById("directory");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (setSearchQuery) setSearchQuery(localSearch);
    if (onSearchSubmit) onSearchSubmit(localSearch);
    scrollToDirectory();
  };

  const handleClear = () => {
    setLocalSearch("");
    if (setSearchQuery) setSearchQuery("");
  };

  const handlePopularClick = (tag) => {
    setLocalSearch(tag);
    if (setSearchQuery) setSearchQuery(tag);
    scrollToDirectory();
  };

  return (
    <section className="min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] flex flex-col justify-between pt-10 pb-8 sm:pt-14 sm:pb-10 border-b border-neutral-200/80 bg-[#fafafa] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-center">
        
        {/* Large Editorial Headline */}
        <div className="max-w-4xl space-y-6 sm:space-y-8">
          
          <div className="inline-flex items-center gap-2 text-xs font-mono text-neutral-500 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-neutral-900 animate-pulse"></span>
            <span>Curated Directory · Daily Updates</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-[58px] font-medium tracking-tight text-neutral-950 leading-[1.12]">
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
                  className="w-full pl-11 pr-24 py-4 bg-white border border-neutral-300 hover:border-neutral-400 focus:border-neutral-950 focus:outline-none rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors shadow-2xs"
                />
                {localSearch && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-14 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-800"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-3.5 text-xs text-neutral-500">
              <span className="font-mono text-neutral-400">Popular:</span>
              <button 
                type="button"
                onClick={() => handlePopularClick("AI")}
                className="hover:text-neutral-950 hover:underline transition-colors cursor-pointer"
              >
                AI &amp; LLMs
              </button>
              <span>·</span>
              <button 
                type="button"
                onClick={() => handlePopularClick("Hackathon")}
                className="hover:text-neutral-950 hover:underline transition-colors cursor-pointer"
              >
                Global Hackathons
              </button>
              <span>·</span>
              <button 
                type="button"
                onClick={() => handlePopularClick("Open Source")}
                className="hover:text-neutral-950 hover:underline transition-colors cursor-pointer"
              >
                Open Source
              </button>
              <span>·</span>
              <button 
                type="button"
                onClick={() => handlePopularClick("Web3")}
                className="hover:text-neutral-950 hover:underline transition-colors cursor-pointer"
              >
                Web3
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Bar: Stats & Scroll Cue */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-400 border-t border-neutral-200/60 pt-4 font-mono">
          <div className="flex items-center gap-3">
            <span>Events</span>
            <span>·</span>
            <span>Hackathons</span>
            <span className="hidden md:inline">·</span>
            <span className="hidden md:inline">Open-Source Project Gallery</span>
          </div>

          <button
            type="button"
            onClick={scrollToDirectory}
            className="inline-flex items-center gap-1 text-neutral-500 hover:text-neutral-950 transition-colors cursor-pointer self-start sm:self-auto group font-sans font-medium"
          >
            <span>Explore directory</span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
