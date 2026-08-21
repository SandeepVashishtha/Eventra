"use client";

import React, { useState } from "react";
import Hero from "@/components/home/Hero";
import WhatsHappeningNow from "@/components/home/WhatsHappeningNow";
import HostCTA from "@/components/home/HostCTA";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <main className="min-h-screen bg-[#fafafa] text-neutral-900 font-sans">
      {/* 1. Minimal Editorial Hero with Search */}
      <Hero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* 2. Minimal Gallery Curated Grid with Tags & Filters */}
      <WhatsHappeningNow searchQuery={searchQuery} />

      {/* 3. Submissions & Weekly Digest Callout */}
      <HostCTA />
    </main>
  );
}
