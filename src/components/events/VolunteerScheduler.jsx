import React, { useState } from 'react';

const VolunteerScheduler = () => {
  const [runningAlg, setRunningAlg] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  
  const [shifts, setShifts] = useState([
    { id: 'S1', role: 'Medical Responder', time: '08:00 - 12:00', location: 'Main Hall', reqSkill: 'First Aid/CPR', assigned: null, status: 'unfilled' },
    { id: 'S2', role: 'A/V Tech Support', time: '09:00 - 14:00', location: 'Stage B', reqSkill: 'Audio Mixing', assigned: null, status: 'unfilled' },
    { id: 'S3', role: 'Crowd Control', time: '12:00 - 16:00', location: 'Expo Entrance', reqSkill: 'None', assigned: null, status: 'unfilled' },
    { id: 'S4', role: 'VIP Concierge', time: '14:00 - 18:00', location: 'Lounge 1', reqSkill: 'Hospitality', assigned: null, status: 'unfilled' }
  ]);

  const [volunteers] = useState([
    { name: 'Sarah J.', skills: ['First Aid/CPR', 'Hospitality'], maxHours: 8 },
    { name: 'Mike T.', skills: ['Audio Mixing', 'Network Setup'], maxHours: 5 },
    { name: 'Elena R.', skills: ['None'], maxHours: 4 },
    { name: 'David W.', skills: ['Hospitality', 'Languages: ES'], maxHours: 6 }
  ]);

  const handleAutoSchedule = () => {
    setRunningAlg(true);
    
    // Simulate algorithmic matching delay
    setTimeout(() => {
      setRunningAlg(false);
      setScheduled(true);
      
      setShifts([
        { id: 'S1', role: 'Medical Responder', time: '08:00 - 12:00', location: 'Main Hall', reqSkill: 'First Aid/CPR', assigned: 'Sarah J.', status: 'filled' },
        { id: 'S2', role: 'A/V Tech Support', time: '09:00 - 14:00', location: 'Stage B', reqSkill: 'Audio Mixing', assigned: 'Mike T.', status: 'filled' },
        { id: 'S3', role: 'Crowd Control', time: '12:00 - 16:00', location: 'Expo Entrance', reqSkill: 'None', assigned: 'Elena R.', status: 'filled' },
        { id: 'S4', role: 'VIP Concierge', time: '14:00 - 18:00', location: 'Lounge 1', reqSkill: 'Hospitality', assigned: 'David W.', status: 'filled' }
      ]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context & Volunteers (Col span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-block bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
            Operations & Logistics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Automated <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">Shift Scheduling</span>.
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            Ditch the giant Excel spreadsheets. Our algorithm ingests volunteer availability and skills, then instantly assigns the perfect personnel to ensure critical roles are never unmanned.
          </p>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
             <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Available Roster</h3>
             
             <div className="space-y-3">
               {volunteers.map((vol, idx) => (
                 <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                   <div>
                     <p className="font-bold text-slate-800">{vol.name}</p>
                     <div className="flex space-x-1 mt-1">
                       {vol.skills.map((skill, i) => (
                         <span key={i} className="text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">{skill}</span>
                       ))}
                     </div>
                   </div>
                   <span className="text-xs font-mono text-slate-400 font-bold">{vol.maxHours}h max</span>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Right Side: Interactive Scheduler (Col span 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl flex flex-col h-full min-h-[600px]">
          
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Shift Master Grid</h2>
              <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">Day 1 • Main Venue</p>
            </div>
            
            <button 
              onClick={handleAutoSchedule}
              disabled={runningAlg || scheduled}
              className={`px-6 py-3 rounded-xl font-bold transition flex items-center shadow-sm ${runningAlg ? 'bg-slate-200 text-slate-500 cursor-wait' : scheduled ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'}`}
            >
              {runningAlg ? (
                <><span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2"></span> Matching...</>
              ) : scheduled ? (
                '✓ Roster Optimized'
              ) : (
                'Auto-Fill Schedule'
              )}
            </button>
          </div>

          {/* KPI Bar */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center">
              <span className="text-2xl font-black text-slate-800">{shifts.length}</span>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Total Shifts</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center">
              <span className="text-2xl font-black text-indigo-600">{shifts.filter(s => s.status === 'filled').length}</span>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Filled</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center">
              <span className="text-2xl font-black text-rose-500">{shifts.filter(s => s.status === 'unfilled').length}</span>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Critical Gaps</p>
            </div>
          </div>

          {/* Shifts Grid */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {shifts.map((shift) => (
              <div key={shift.id} className={`p-4 rounded-2xl border transition-all duration-500 ${shift.status === 'filled' ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-white border-slate-200'}`}>
                
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-black text-slate-800">{shift.role}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{shift.location} • {shift.time}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest ${shift.reqSkill === 'None' ? 'bg-slate-100 text-slate-500' : 'bg-rose-100 text-rose-600'}`}>
                    Req: {shift.reqSkill}
                  </span>
                </div>

                <div className={`p-3 rounded-xl border flex items-center justify-between ${shift.status === 'filled' ? 'bg-white border-emerald-100' : 'bg-slate-50 border-dashed border-slate-300'}`}>
                  {shift.status === 'filled' ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs">
                        {shift.assigned.split(' ')[0][0]}{shift.assigned.split(' ')[1][0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{shift.assigned}</p>
                        <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest">Matched by Skill</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center text-slate-400 space-x-2">
                      <span className="text-xl">⚠️</span>
                      <span className="text-xs font-bold uppercase tracking-widest">Shift Unassigned</span>
                    </div>
                  )}
                  
                  {shift.status === 'filled' && (
                    <button className="text-xs text-indigo-600 font-bold hover:underline">
                      SMS Reminder Sent ✓
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};

export default VolunteerScheduler;
