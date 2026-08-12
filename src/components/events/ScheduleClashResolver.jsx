import React, { useState } from 'react';

const ScheduleClashResolver = () => {
  const [resolving, setResolving] = useState(false);
  const [resolved, setResolved] = useState(false);

  const handleResolve = () => {
    setResolving(true);
    setTimeout(() => {
      setResolving(false);
      setResolved(true);
    }, 2000);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 border-b border-slate-200 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center">
              <span className="mr-3 text-red-500">⚠️</span> Schedule Optimization
            </h1>
            <p className="text-slate-500 font-medium mt-1">AI-driven clash detection based on attendee bookmarks.</p>
          </div>
          {!resolved && (
            <div className="bg-red-100 text-red-700 font-bold px-4 py-2 rounded-lg border border-red-200 flex items-center shadow-sm">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-ping mr-2"></span>
              2 Critical Clashes Detected
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Clash Alerts */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="font-bold text-slate-900 text-lg">Active Conflicts</h3>
            
            {/* Conflict 1 */}
            <div className={`bg-white rounded-2xl border-2 shadow-sm transition-all duration-500 ${resolved ? 'border-green-200 opacity-60' : 'border-red-200'}`}>
              <div className={`p-4 border-b ${resolved ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${resolved ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                    {resolved ? 'Resolved' : 'High Severity'}
                  </span>
                  <span className="text-xs font-bold text-slate-500">10:00 AM Slot</span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-full bg-blue-500 rounded"></div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Future of AI Models</p>
                    <p className="text-xs text-slate-500">Room A (Cap: 500)</p>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-400">vs</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-full bg-purple-500 rounded"></div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Ethics in Tech</p>
                    <p className="text-xs text-slate-500">Room B (Cap: 200)</p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-xs font-medium text-slate-600 leading-relaxed">
                    <span className="font-black text-slate-900">72%</span> of users who bookmarked "Future of AI" also bookmarked "Ethics in Tech". Overlap affects ~450 attendees.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Timetable & Resolution */}
          <div className="lg:col-span-2 flex flex-col">
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 p-6 relative overflow-hidden">
              
              <h3 className="font-bold text-slate-900 text-lg mb-6">Algorithm Suggestion</h3>

              {/* Timetable visual */}
              <div className="relative">
                {/* Time Axis */}
                <div className="flex border-b border-slate-200 pb-2 mb-4">
                  <div className="w-16"></div>
                  <div className="flex-1 text-xs font-bold text-slate-400">10:00 AM</div>
                  <div className="flex-1 text-xs font-bold text-slate-400">11:00 AM</div>
                  <div className="flex-1 text-xs font-bold text-slate-400">12:00 PM</div>
                </div>

                {/* Room A */}
                <div className="flex mb-6 relative">
                  <div className="w-16 text-xs font-bold text-slate-500 pt-2">Room A</div>
                  <div className="flex-1 relative h-16 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="absolute left-0 w-1/2 h-full bg-blue-100 border-2 border-blue-300 rounded-lg p-2 transition-all">
                      <p className="font-bold text-blue-900 text-xs">Future of AI Models</p>
                    </div>
                  </div>
                </div>

                {/* Room B */}
                <div className="flex relative">
                  <div className="w-16 text-xs font-bold text-slate-500 pt-2">Room B</div>
                  <div className="flex-1 relative h-16 bg-slate-50 rounded-lg border border-slate-100">
                    
                    {/* The Block */}
                    <div className={`absolute h-full bg-purple-100 border-2 border-purple-300 rounded-lg p-2 transition-all duration-700 ease-in-out ${resolved ? 'left-1/2 w-1/2' : 'left-0 w-1/2 shadow-[0_0_15px_rgba(239,68,68,0.3)] border-red-400'}`}>
                      <p className="font-bold text-purple-900 text-xs">Ethics in Tech</p>
                      {!resolved && <span className="absolute top-1 right-1 text-red-500 text-xs font-black animate-pulse">!</span>}
                    </div>

                    {/* Target highlight */}
                    {!resolved && (
                      <div className="absolute left-1/2 w-1/2 h-full border-2 border-dashed border-emerald-400 rounded-lg bg-emerald-50/50 flex items-center justify-center">
                        <span className="text-xs font-bold text-emerald-600">Suggested Move</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Action Bar */}
              <div className="mt-12 bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 text-sm">Proposed Action</p>
                  <p className="text-xs text-slate-500 mt-1">Shift "Ethics in Tech" to 11:00 AM (Room B is available).</p>
                </div>
                
                {resolved ? (
                  <button disabled className="bg-green-100 text-green-700 font-black py-2 px-6 rounded-lg border border-green-200 cursor-not-allowed">
                    Applied ✓
                  </button>
                ) : (
                  <button 
                    onClick={handleResolve}
                    disabled={resolving}
                    className={`font-black py-2 px-6 rounded-lg shadow transition ${resolving ? 'bg-slate-300 text-slate-600 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                  >
                    {resolving ? 'Processing...' : 'Apply Reshuffle'}
                  </button>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ScheduleClashResolver;
