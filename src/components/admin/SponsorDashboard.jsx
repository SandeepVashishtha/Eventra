import React from "react";
export default function SponsorDashboard() {
  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-4 text-2xl font-bold">Sponsor Dashboard</h1>
      <div className="rounded bg-white p-6 shadow">
        <h2 className="text-lg font-semibold">Lead Retrieval Metrics</h2>
        <p className="mb-4 text-gray-600">
          Export attendees who opted into sponsor communications.
        </p>
        <button className="rounded bg-blue-600 px-4 py-2 text-white">Export Leads (CSV)</button>
      </div>
    </div>
  );
}
