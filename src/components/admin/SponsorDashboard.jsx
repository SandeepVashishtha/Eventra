
import React from 'react';
export default function SponsorDashboard() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sponsor Dashboard</h1>
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold">Lead Retrieval Metrics</h2>
        <p className="text-gray-600 mb-4">Export attendees who opted into sponsor communications.</p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Export Leads (CSV)</button>
      </div>
    </div>
  );
}
