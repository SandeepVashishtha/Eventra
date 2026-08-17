import React from "react";
import Hero from "@/components/home/Hero";
import WhatsHappeningNow from "@/components/home/WhatsHappeningNow";
import TrendingEvents from "@/components/home/TrendingEvents";
import EventCategoryBreakdown from "@/components/home/EventCategoryBreakdown";
import HackathonCategoryBreakdown from "@/components/home/HackathonCategoryBreakdown";
import Workflow from "@/components/home/Workflow";
import HostCTA from "@/components/home/HostCTA";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f4fbf7] text-zinc-900 font-sans">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. What's Happening Now (Live API Carousel Feed) */}
      <WhatsHappeningNow />

      {/* 3. Trending Events Section (6 Minimalist & Beautiful Event Cards) */}
      <TrendingEvents />

      {/* 4. Detailed Event Formats Breakdown */}
      <EventCategoryBreakdown />

      {/* 5. Detailed Hackathon Tracks Breakdown */}
      <HackathonCategoryBreakdown />

      {/* 6. 3-Step Participant & Organizer Workflow */}
      <Workflow />

      {/* 7. Host Event Call To Action */}
      <HostCTA />
    </main>
  );
}
