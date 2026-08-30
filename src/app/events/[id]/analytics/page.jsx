"use client";

import React from "react";
import { useParams } from "next/navigation";
import OrganizerAnalyticsDashboard from "@/components/analytics/OrganizerAnalyticsDashboard";

export default function EventAnalyticsPage() {
  const params = useParams();
  const eventId = params?.id || "1";

  return (
    <main className="min-h-screen bg-[#f4fbf7] text-zinc-900 font-sans py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <OrganizerAnalyticsDashboard eventId={eventId} />
      </div>
    </main>
  );
}
