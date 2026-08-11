import React, { useState } from 'react';

const SponsorLeadScoring = () => {
  const [activeTab, setActiveTab] = useState('hot');

  // Mock lead data with digital footprint points
  const leads = [
    { 
      id: 'L-1024', 
      name: 'Eleanor Vance', 
      title: 'VP Engineering', 
      company: 'DataCorp',
      score: 94, 
      category: 'hot',
      footprint: [
        { action: 'Attended 45min Technical Workshop', pts: 40 },
        { action: 'Downloaded API Whitepaper', pts: 25 },
        { action: 'Scanned at Booth (In-depth chat)', pts: 20 },
        { action: 'Visited Virtual Booth > 10 mins', pts: 9 }
      ]
    },
    { 
      id: 'L-0911', 
      name: 'James Foster', 
      title: 'DevOps Lead', 
      company: 'CloudSync',
      score: 82, 
      category: 'hot',
      footprint: [
        { action: 'Attended Keynote (Sponsored)', pts: 30 },
        { action: 'Scanned at Booth', pts: 15 },
        { action: 'Clicked Email Promo Link', pts: 15 },
        { action: 'Requested Demo via App', pts: 22 }
      ]
    },
    { 
      id: 'L-3342', 
      name: 'Sarah Chen', 
      title: 'Product Manager', 
      company: 'BuildIt',
      score: 45, 
      category: 'warm',
      footprint: [
        { action: 'Scanned at Booth (Got T-Shirt)', pts: 15 },
        { action: 'Saved Sponsor to Favorites', pts: 10 },
        { action: 'Attended 10 mins of Workshop', pts: 20 }
      ]
    },
    { 
      id: 'L-8821', 
      name: 'Michael Ross', 
      title: 'Junior Developer', 
      company: 'Startup Inc',
      score: 15, 
      category: 'cold',
      footprint: [
        { action: 'Scanned at Booth (Got T-Shirt)', pts: 15 }
      ]
    }
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-rose-500 bg-rose-50 border-rose-200';
    if (score >= 40) return 'text-amber-500 bg-amber-50 border-amber-200';
    return 'text-blue-500 bg-blue-50 border-blue-200';
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return <span className="bg-rose-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-sm">Hot Lead 🔥</span>;
    if (score >= 40) return <span className="bg-amber-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-sm">Warm Lead 📈</span>;
    return <span className="bg-blue-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-sm">Cold Lead 🧊</span>;
  };

  const filteredLeads = leads.filter(l => l.category === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context & Scoring Rules (Col span 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="inline-block bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎯</span> Sponsor ROI
          </div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight">
            Behavioral <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Lead Scoring</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Stop wasting time calling attendees who just wanted a free t-shirt. Our engine tracks an attendee's digital footprint across the entire event, automatically bubbling up high-intent buyers based on real engagement with your brand.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Algorithm Weights</h3>
             
             <div className="space-y-3">
               <div className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-slate-50">
                 <span className="text-xs font-bold text-slate-700">Attend 45m Workshop</span>
                 <span className="text-xs font-black text-emerald-600">+40 pts</span>
               </div>
               <div className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-slate-50">
                 <span className="text-xs font-bold text-slate-700">Request App Demo</span>
                 <span className="text-xs font-black text-emerald-600">+25 pts</span>
               </div>
               <div className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-slate-50">
                 <span className="text-xs font-bold text-slate-700">Download Whitepaper</span>
                 <span className="text-xs font-black text-emerald-600">+20 pts</span>
               </div>
               <div className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-slate-50 opacity-60">
                 <span className="text-xs font-bold text-slate-700">Standard Booth Scan</span>
                 <span className="text-xs font-black text-emerald-600">+15 pts</span>
               </div>
             </div>

             <div className="mt-6 pt-4 border-t border-slate-100">
               <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 <span>Cold (0-39)</span>
                 <span>Warm (40-79)</span>
                 <span>Hot (80+)</span>
               </div>
               <div className="w-full h-2 rounded-full mt-2 flex overflow-hidden">
                 <div className="h-full bg-blue-500" style={{ width: '39%' }}></div>
                 <div className="h-full bg-amber-500" style={{ width: '40%' }}></div>
                 <div className="h-full bg-rose-500" style={{ width: '21%' }}></div>
               </div>
             </div>
          </div>
        </div>

        {/* Right Side: Sales Rep Dashboard (Col span 8) */}
        <div className="lg:col-span-8 bg-slate-900 rounded-3xl p-6 md:p-8 border-4 border-slate-800 shadow-2xl flex flex-col h-full min-h-[600px]">
          
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-black text-white">Sponsor Lead Portal</h2>
              <p className="text-xs text-slate-400 font-mono mt-1">Acme Corp Sales Team View</p>
            </div>
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-md transition">
              Export Hot Leads to CRM
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 mb-6">
            <button 
              onClick={() => setActiveTab('hot')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition flex items-center justify-center space-x-2 ${activeTab === 'hot' ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              <span>🔥 Hot</span>
              <span className="bg-black/20 text-white text-[10px] px-2 py-0.5 rounded-full">{leads.filter(l => l.category === 'hot').length}</span>
            </button>
            <button 
              onClick={() => setActiveTab('warm')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition flex items-center justify-center space-x-2 ${activeTab === 'warm' ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              <span>📈 Warm</span>
              <span className="bg-black/20 text-white text-[10px] px-2 py-0.5 rounded-full">{leads.filter(l => l.category === 'warm').length}</span>
            </button>
            <button 
              onClick={() => setActiveTab('cold')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition flex items-center justify-center space-x-2 ${activeTab === 'cold' ? 'bg-blue-500 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              <span>🧊 Cold (Swag Seekers)</span>
              <span className="bg-black/20 text-white text-[10px] px-2 py-0.5 rounded-full">{leads.filter(l => l.category === 'cold').length}</span>
            </button>
          </div>

          {/* Lead List */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
             {filteredLeads.map((lead) => (
               <div key={lead.id} className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col md:flex-row gap-6 animate-fade-in-up">
                 
                 {/* Lead Profile Info */}
                 <div className="md:w-1/3 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
                   <div>
                     <div className="flex justify-between items-start mb-2">
                       <h4 className="font-black text-slate-900 text-lg">{lead.name}</h4>
                       {getScoreBadge(lead.score)}
                     </div>
                     <p className="text-sm text-slate-600">{lead.title}</p>
                     <p className="text-sm font-bold text-slate-800">{lead.company}</p>
                   </div>
                   
                   <div className={`mt-4 w-16 h-16 rounded-full border-4 flex items-center justify-center shadow-inner ${getScoreColor(lead.score)}`}>
                     <span className="text-2xl font-black">{lead.score}</span>
                   </div>
                 </div>

                 {/* Digital Footprint Audit Trail */}
                 <div className="md:w-2/3">
                   <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Behavioral Footprint Audit</h5>
                   <div className="space-y-2">
                     {lead.footprint.map((fp, idx) => (
                       <div key={idx} className="flex justify-between items-center text-sm bg-slate-50 p-2 px-3 rounded-lg border border-slate-100">
                         <span className="text-slate-700">{fp.action}</span>
                         <span className="font-mono text-emerald-600 font-bold">+{fp.pts}</span>
                       </div>
                     ))}
                   </div>
                   <div className="mt-4 flex space-x-3">
                     <button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-lg transition">View Profile</button>
                     <button className="flex-1 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold py-2 rounded-lg transition">Email Now</button>
                   </div>
                 </div>

               </div>
             ))}

             {filteredLeads.length === 0 && (
               <div className="text-center py-10 opacity-50">
                 <p className="text-white font-bold">No leads in this category.</p>
               </div>
             )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default SponsorLeadScoring;
