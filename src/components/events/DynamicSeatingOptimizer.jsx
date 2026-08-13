import React, { useState } from 'react';

const DynamicSeatingOptimizer = () => {
  const [optimizing, setOptimizing] = useState(false);
  const [optimized, setOptimized] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleOptimize = () => {
    setOptimizing(true);
    setOptimized(false);
    setProgress(0);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 5;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          setOptimizing(false);
          setOptimized(true);
        }, 500);
      } else {
        setProgress(currentProgress);
      }
    }, 300);
  };

  const initialTables = [
    { id: 1, synergy: 34, conflict: 2, status: 'unoptimized', guests: [ { name: 'A', type: 'Tech' }, { name: 'B', type: 'Tech' }, { name: 'C', type: 'Tech' }, { name: 'D', type: 'Tech' } ] },
    { id: 2, synergy: 12, conflict: 5, status: 'unoptimized', guests: [ { name: 'E', type: 'Finance' }, { name: 'F', type: 'Finance' }, { name: 'G', type: 'Marketing' }, { name: 'H', type: 'Sales' } ] },
    { id: 3, synergy: 45, conflict: 0, status: 'unoptimized', guests: [ { name: 'I', type: 'VC' }, { name: 'J', type: 'Startup' }, { name: 'K', type: 'VC' }, { name: 'L', type: 'Startup' } ] },
    { id: 4, synergy: 20, conflict: 3, status: 'unoptimized', guests: [ { name: 'M', type: 'Legal' }, { name: 'N', type: 'Legal' }, { name: 'O', type: 'Legal' }, { name: 'P', type: 'Product' } ] },
  ];

  const optimizedTables = [
    { id: 1, synergy: 94, conflict: 0, status: 'optimized', tags: 'Founders + VCs', guests: [ { name: 'J', type: 'Startup' }, { name: 'I', type: 'VC' }, { name: 'L', type: 'Startup' }, { name: 'K', type: 'VC' } ] },
    { id: 2, synergy: 88, conflict: 0, status: 'optimized', tags: 'FinTech Leaders', guests: [ { name: 'E', type: 'Finance' }, { name: 'F', type: 'Finance' }, { name: 'A', type: 'Tech' }, { name: 'B', type: 'Tech' } ] },
    { id: 3, synergy: 91, conflict: 0, status: 'optimized', tags: 'GTM Strategy', guests: [ { name: 'G', type: 'Marketing' }, { name: 'H', type: 'Sales' }, { name: 'P', type: 'Product' }, { name: 'C', type: 'Tech' } ] },
    { id: 4, synergy: 85, conflict: 0, status: 'optimized', tags: 'Enterprise Ops', guests: [ { name: 'M', type: 'Legal' }, { name: 'N', type: 'Legal' }, { name: 'O', type: 'Legal' }, { name: 'D', type: 'Tech' } ] },
  ];

  const renderTables = (tables) => (
    <div className="grid grid-cols-2 gap-4">
      {tables.map((table) => (
        <div key={table.id} className={`p-4 rounded-2xl border flex flex-col items-center relative ${table.status === 'optimized' ? 'bg-fuchsia-50 border-fuchsia-200 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
          
          <div className="flex justify-between w-full mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Table {table.id}</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded ${table.status === 'optimized' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
              Synergy: {table.synergy}%
            </span>
          </div>

          {/* Graphical Table */}
          <div className="w-16 h-16 rounded-full border-4 relative flex items-center justify-center mb-4 mt-2 transition-colors duration-500 delay-100 shadow-inner bg-white border-slate-200">
            {table.guests.map((guest, i) => {
              const positions = [
                'top-[-12px] left-1/2 -translate-x-1/2', // Top
                'bottom-[-12px] left-1/2 -translate-x-1/2', // Bottom
                'left-[-12px] top-1/2 -translate-y-1/2', // Left
                'right-[-12px] top-1/2 -translate-y-1/2' // Right
              ];
              const color = guest.type === 'Tech' ? 'bg-blue-500' : guest.type === 'Finance' ? 'bg-green-500' : guest.type === 'VC' ? 'bg-fuchsia-500' : guest.type === 'Startup' ? 'bg-orange-500' : 'bg-slate-400';
              return (
                <div key={i} className={`absolute w-6 h-6 rounded-full ${color} text-[8px] font-bold text-white flex items-center justify-center shadow-md ${positions[i]} transition-all duration-700`}>
                  {guest.type.substring(0,1)}
                </div>
              )
            })}
            <span className="text-[10px] text-slate-300 font-bold">{table.id}</span>
          </div>

          {table.status === 'optimized' && (
            <p className="text-xs font-bold text-fuchsia-600 uppercase tracking-widest mt-2">{table.tags}</p>
          )}

          {table.conflict > 0 && (
            <p className="text-[10px] text-red-500 font-bold flex items-center mt-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1 animate-ping"></span>
              {table.conflict} Conflicts
            </p>
          )}

        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 font-sans p-6 text-slate-200 flex flex-col items-center">
      
      {/* Header */}
      <div className="max-w-5xl w-full text-center mb-10">
        <div className="inline-block bg-fuchsia-900/50 text-fuchsia-400 border border-fuchsia-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
          Machine Learning Optimization
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
          Dynamic <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-500">Seating Algorithm</span>.
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Ditch the manual drag-and-drop. Ingest attendee profiles and past interactions to algorithmically generate seating arrangements that maximize networking synergy and keep known competitors apart.
        </p>
      </div>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        {/* Left Side: Current State */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl flex flex-col h-full relative overflow-hidden">
          
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Current Assignment</h2>
              <p className="text-xs text-slate-500 font-bold mt-1">Manual Input (Sub-optimal)</p>
            </div>
            <div className="bg-red-50 text-red-600 px-3 py-1 rounded-lg border border-red-200 text-center">
              <span className="text-xl font-black block">27%</span>
              <span className="text-[9px] uppercase font-bold tracking-widest">Avg Synergy</span>
            </div>
          </div>

          <div className="flex-1">
             {renderTables(initialTables)}
          </div>

        </div>

        {/* Right Side: AI Optimizer */}
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl flex flex-col h-full relative overflow-hidden">
          
          <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center">
                <span className="text-fuchsia-400 mr-2">✨</span> AI Optimizer
              </h2>
              <p className="text-xs text-slate-400 font-bold mt-1">Powered by Match-Graph Algo</p>
            </div>
            {optimized && (
              <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg border border-emerald-500/50 text-center animate-fade-in shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <span className="text-xl font-black block">89%</span>
                <span className="text-[9px] uppercase font-bold tracking-widest">Avg Synergy</span>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center">
            
            {!optimizing && !optimized && (
              <div className="text-center">
                <p className="text-slate-400 mb-6 text-sm">Analyzes 450+ data points including industry sectors, job titles, mutual connections, and competitor flags to calculate the perfect table groupings.</p>
                <button 
                  onClick={handleOptimize}
                  className="w-full bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(217,70,239,0.4)] transition transform hover:-translate-y-1"
                >
                  Run Neural Optimizer
                </button>
              </div>
            )}

            {optimizing && (
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="w-16 h-16 border-4 border-slate-700 border-t-fuchsia-500 rounded-full animate-spin"></div>
                <div className="text-center w-full">
                  <p className="text-fuchsia-400 font-bold text-sm mb-2">Calculating Permutations...</p>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700">
                    <div className="h-full bg-fuchsia-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-3">Evaluating 4,320,119 combinations</p>
                </div>
              </div>
            )}

            {optimized && (
              <div className="animate-fade-in-up">
                 {renderTables(optimizedTables)}
                 <button className="w-full mt-6 bg-slate-900 text-white border border-slate-700 hover:bg-slate-800 font-bold py-3 rounded-xl transition">
                   Apply & Export to PDF
                 </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default DynamicSeatingOptimizer;
