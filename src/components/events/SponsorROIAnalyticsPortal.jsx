import React, { useState } from 'react';

const SponsorROIAnalyticsPortal = () => {
  const [dateRange, setDateRange] = useState('All Time'); // Today, This Week, All Time
  const [downloading, setDownloading] = useState(false);

  const sponsorData = {
    tier: 'Platinum',
    company: 'Acme Corp',
    metrics: {
      digitalImpressions: 45200,
      bannerClicks: 3105,
      boothScans: 842,
      sponsoredSessionAttendees: 1250,
      leadsCaptured: 630
    },
    topInterests: ['Cloud Infrastructure', 'Enterprise Security', 'DevOps'],
    recentLeads: [
      { id: 1, name: 'Alex Johnson', company: 'TechNova', source: 'Booth Scan' },
      { id: 2, name: 'Sarah Chen', company: 'DataSystems', source: 'Sponsored Session' },
      { id: 3, name: 'Marcus Ty', company: 'CloudFirst', source: 'App Banner Click' },
      { id: 4, name: 'Elena Rodriguez', company: 'SecureNet', source: 'Booth Scan' },
    ]
  };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert('ROI Report Downloaded successfully as CSV.');
    }, 2000);
  };

  return (
    <div className="p-6 bg-gray-50 rounded-2xl shadow-xl max-w-6xl mx-auto mt-8 border border-gray-200 font-sans text-gray-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{sponsorData.company} Portal</h2>
            <span className="bg-gradient-to-r from-slate-700 to-slate-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
              {sponsorData.tier} Sponsor
            </span>
          </div>
          <p className="text-sm text-gray-500">Unified ROI & Engagement Analytics Dashboard</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Today</option>
            <option>This Week</option>
            <option>All Time</option>
          </select>
          <button 
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-5 rounded-lg shadow-md transition disabled:opacity-70"
          >
            {downloading ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span> Generating...</>
            ) : (
              <><span className="mr-2">📥</span> Export CSV</>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Metrics */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Metric Cards */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-xl mb-3">📱</div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">App Impressions</p>
              <h3 className="text-3xl font-black text-gray-900">{sponsorData.metrics.digitalImpressions.toLocaleString()}</h3>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-xl mb-3">🖱️</div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Banner Clicks</p>
              <div className="flex items-end space-x-2">
                <h3 className="text-3xl font-black text-gray-900">{sponsorData.metrics.bannerClicks.toLocaleString()}</h3>
                <span className="text-sm font-bold text-green-500 mb-1">6.8% CTR</span>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-xl mb-3">🎟️</div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Physical Booth Scans</p>
              <h3 className="text-3xl font-black text-gray-900">{sponsorData.metrics.boothScans.toLocaleString()}</h3>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center text-xl mb-3">🎤</div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Session Attendance</p>
              <h3 className="text-3xl font-black text-gray-900">{sponsorData.metrics.sponsoredSessionAttendees.toLocaleString()}</h3>
            </div>

            <div className="sm:col-span-2 bg-gradient-to-br from-blue-900 to-indigo-900 p-5 rounded-xl shadow-lg text-white flex flex-col justify-center">
              <p className="text-xs text-blue-200 font-bold uppercase tracking-wider mb-1">Total Qualified Leads</p>
              <div className="flex justify-between items-end">
                <h3 className="text-5xl font-black">{sponsorData.metrics.leadsCaptured.toLocaleString()}</h3>
                <span className="text-sm bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full font-bold">
                  +12% vs Yesterday
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <h3 className="font-bold text-gray-800">Recent Lead Captures</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400 font-bold">
                    <th className="p-4">Name</th>
                    <th className="p-4">Company</th>
                    <th className="p-4">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sponsorData.recentLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-bold text-gray-900">{lead.name}</td>
                      <td className="p-4 text-sm text-gray-600">{lead.company}</td>
                      <td className="p-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          lead.source === 'Booth Scan' ? 'bg-emerald-100 text-emerald-700' :
                          lead.source === 'Sponsored Session' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {lead.source}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 p-3 text-center">
              <button className="text-sm font-bold text-blue-600 hover:text-blue-800 transition">View All Leads →</button>
            </div>
          </div>

        </div>

        {/* Sidebar Insights */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🎯</span> Audience Top Interests
            </h3>
            <div className="space-y-3">
              {sponsorData.topInterests.map((interest, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                    <span>{interest}</span>
                    <span>{85 - (idx * 15)}% Match</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${85 - (idx * 15)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-yellow-800 mb-2 flex items-center">
              <span className="mr-2">💡</span> AI ROI Insights
            </h3>
            <p className="text-sm text-yellow-700 leading-relaxed font-medium mb-3">
              Your sponsored session "Future of Cloud" generated <strong className="text-yellow-900">3x more leads</strong> than your physical booth scans today.
            </p>
            <p className="text-sm text-yellow-700 leading-relaxed font-medium">
              Consider directing physical booth traffic to your upcoming sessions to maximize qualified lead generation.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SponsorROIAnalyticsPortal;
