/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AiItineraryGenerator = () => {
  const [spotifyLinked, setSpotifyLinked] = useState(false);
  
  // AI Metrics
  const [llmState, setLlmState] = useState('IDLE'); // IDLE, ANALYZING, GENERATING, DONE
  const [artistsDiscovered, setArtistsDiscovered] = useState(0); 
  const [conflictsAvoided, setConflictsAvoided] = useState(0);
  const [inferenceTime, setInferenceTime] = useState(0); // ms
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '10:00:00', type: 'SYS', msg: 'OAuth 2.0 Gateway initialized. Awaiting user consent.' },
    { id: 2, time: '10:00:02', type: 'SYS', msg: 'LLM Prompt context loaded with master 150-artist schedule.' }
  ]);

  // Visualizer State
  const [userProfile, setUserProfile] = useState(null);
  const [generatedSchedule, setGeneratedSchedule] = useState([]);

  useEffect(() => {
    let loop;
    
    if (spotifyLinked && llmState === 'IDLE') {
      loop = setInterval(() => {
          // Just idle telemetry
      }, 1000); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [spotifyLinked, llmState]);

  const linkSpotify = () => {
      if (spotifyLinked) return;
      
      addLog('ACTION', 'User clicked Connect Spotify. Triggering OAuth flow.');
      addLog('SUCCESS', 'OAuth token received. Fetching top_artists and top_tracks data.');
      
      setTimeout(() => {
          setSpotifyLinked(true);
          setUserProfile({
              name: 'Mohith Reddy',
              topGenres: ['Melodic House', 'Techno', 'Indie Dance'],
              topArtists: ['Odesza', 'Rufus Du Sol', 'Fred Again..']
          });
      }, 800);
  };

  const generateItinerary = () => {
      if (!spotifyLinked || llmState !== 'IDLE') return;
      
      setLlmState('ANALYZING');
      setGeneratedSchedule([]);
      addLog('SYS', 'Injecting Spotify listening history into LLM prompt context.');
      
      // Simulate Analyzing
      setTimeout(() => {
          setLlmState('GENERATING');
          addLog('ACTION', 'LLM running constrained scheduling algorithm (no overlapping times).');
          
          let ms = 0;
          const infInterval = setInterval(() => {
              ms += 50;
              setInferenceTime(ms);
          }, 50);

          // Simulate Generating & Done
          setTimeout(() => {
              clearInterval(infInterval);
              setLlmState('DONE');
              setArtistsDiscovered(4);
              setConflictsAvoided(3); // e.g. two artists playing at 8PM
              
              setGeneratedSchedule([
                  { time: '4:00 PM', stage: 'Neon Tent', artist: 'Rival Consoles', type: 'HIDDEN GEM', color: '#a855f7' },
                  { time: '5:30 PM', stage: 'Main Stage', artist: 'Bicep', type: 'FAVORITE', color: '#10b981' },
                  { time: '7:00 PM', stage: 'Forest Stage', artist: 'Ben Bohmer', type: 'MATCH', color: '#3b82f6' },
                  { time: '8:30 PM', stage: 'Main Stage', artist: 'Odesza', type: 'HEADLINER', color: '#f59e0b' },
                  { time: '10:30 PM', stage: 'Warehouse', artist: 'Anyma', type: 'DISCOVERY', color: '#ec4899' }
              ]);

              addLog('SUCCESS', 'LLM generated mathematically conflict-free schedule in 1.4s.');
              
              setTimeout(() => {
                  setLlmState('IDLE');
              }, 4000);

          }, 1400);

      }, 1000);
  };

  const resetSystem = () => {
      setSpotifyLinked(false);
      setLlmState('IDLE');
      setUserProfile(null);
      setGeneratedSchedule([]);
      setArtistsDiscovered(0);
      setConflictsAvoided(0);
      setInferenceTime(0);
      addLog('WARN', 'OAuth token revoked. User data cleared.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020502] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🧠</span> LLM + OAuth Integration
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Generative AI Personalized <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1DB954] via-emerald-400 to-teal-400">Festival Itinerary</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Attendees are overwhelmed by line-ups with 150+ artists across 6 stages and often miss out on discovering new music because manually starring artists in a list doesn't account for overlapping set times or walking distance. Eventra solves this by integrating Spotify OAuth to securely analyze an attendee's recent listening history. We feed this context into an LLM along with the festival's complex master schedule. The AI generates a personalized, mathematically conflict-free festival itinerary, perfectly balancing their favorite headliners with highly-curated undiscovered gems.
          </p>

          <div className="bg-[#050a06] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-[#1DB954] text-lg mr-2">🎛️</span> AI Scheduling Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={resetSystem}
                   disabled={!spotifyLinked}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     !spotifyLinked ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' :
                     'bg-red-900/60 hover:bg-red-800 text-red-400 border border-red-700/50'
                   }`}
                 >
                   Revoke OAuth Access
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* LLM State */}
               <div className={`col-span-2 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 llmState === 'ANALYZING' ? 'bg-indigo-950/40 border-indigo-500/50' : 
                 llmState === 'GENERATING' ? 'bg-purple-950/40 border-purple-500/50 animate-pulse' :
                 llmState === 'DONE' ? 'bg-[#1DB954]/20 border-[#1DB954]/50' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Inference Engine
                 </span>
                 <div className="flex items-end">
                   <span className={`text-xl font-black uppercase tracking-widest leading-none transition-colors duration-300 ${
                     llmState === 'ANALYZING' ? 'text-indigo-400' : 
                     llmState === 'GENERATING' ? 'text-purple-400' : 
                     llmState === 'DONE' ? 'text-[#1DB954]' : 'text-slate-600'
                   }`}>
                     {llmState}
                   </span>
                 </div>
               </div>

               {/* Conflicts Avoided */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 conflictsAvoided > 0 ? 'bg-amber-950/40 border-amber-600/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Overlaps Fixed
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     conflictsAvoided > 0 ? 'text-amber-400' : 'text-slate-600'
                   }`}>
                     {conflictsAvoided}
                   </span>
                 </div>
               </div>
               
               {/* Artists Discovered */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 artistsDiscovered > 0 ? 'bg-[#1DB954]/20 border-[#1DB954]/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   New Artists
                 </span>
                 <div className="flex flex-col">
                     <div className="flex items-end">
                       <span className={`text-3xl font-black font-mono leading-none ${
                         artistsDiscovered > 0 ? 'text-[#1DB954]' : 'text-slate-600'
                       }`}>
                         +{artistsDiscovered}
                       </span>
                     </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020302] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Backend Event Ledger</span>
                 {llmState === 'GENERATING' && <span className="text-purple-400 font-black animate-pulse">LLM INFERENCE: {inferenceTime}ms</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-purple-400 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Visualizers (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[380px] flex flex-col items-center">
            
            {/* Mobile App UI Simulator */}
            <div className={`w-full rounded-[2.5rem] border-[8px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[550px] overflow-hidden font-sans mb-6 bg-[#0a0f12]`}>
              
              {/* App Header */}
              <div className="pt-10 pb-4 px-6 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center z-20 absolute inset-x-0 top-0">
                  <span className="text-sm font-black tracking-widest text-white uppercase">EVENTRA</span>
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs">👤</div>
              </div>

              <div className="flex-1 flex flex-col pt-24 px-6 pb-6 relative z-10 overflow-y-auto">
                  
                  {!spotifyLinked ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in-up">
                         <div className="w-20 h-20 bg-[#1DB954]/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(29,185,84,0.3)]">
                             <span className="text-4xl text-[#1DB954]">🎵</span>
                         </div>
                         <h3 className="text-xl font-black text-white mb-2">Build Your Perfect Lineup</h3>
                         <p className="text-xs text-slate-400 mb-8 leading-relaxed">Connect your music account to let our AI generate a custom, conflict-free festival schedule based on your exact taste.</p>
                         
                         <button 
                             onClick={linkSpotify}
                             className="w-full py-4 bg-[#1DB954] hover:bg-[#1ed760] text-black font-black uppercase tracking-widest rounded-full transition-all flex items-center justify-center shadow-[0_0_20px_rgba(29,185,84,0.4)]"
                         >
                             <span className="mr-2 text-lg">🔗</span> Connect Spotify
                         </button>
                     </div>
                  ) : (
                    <div className="flex flex-col animate-fade-in-up">
                        
                        {/* User Profile Header */}
                        <div className="flex items-center mb-6">
                            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-lg mr-4 border border-slate-700">🧑</div>
                            <div>
                                <span className="text-[10px] font-bold text-[#1DB954] uppercase tracking-widest block mb-1">Spotify Synced</span>
                                <span className="text-sm font-bold text-white">{userProfile.name}'s Taste Profile</span>
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {userProfile.topGenres.map(genre => (
                                <span key={genre} className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-[9px] font-bold uppercase tracking-wider border border-slate-700">
                                    {genre}
                                </span>
                            ))}
                        </div>

                        {llmState !== 'IDLE' && generatedSchedule.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-12">
                                <div className="w-16 h-16 relative flex justify-center items-center mb-4">
                                    <div className={`absolute inset-0 border-4 rounded-full border-t-purple-500 border-r-indigo-500 border-b-cyan-500 border-l-transparent animate-spin ${llmState === 'DONE' ? 'opacity-0' : 'opacity-100'}`}></div>
                                    <span className="text-2xl">🧠</span>
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                                    {llmState === 'ANALYZING' ? 'Analyzing 150+ Artists...' : 'Generating Perfect Route...'}
                                </span>
                            </div>
                        ) : generatedSchedule.length > 0 ? (
                            <div className="flex flex-col animate-fade-in-up">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4 border-b border-slate-800 pb-2">Your AI Itinerary (Saturday)</span>
                                
                                <div className="relative border-l border-slate-800 ml-2 space-y-6">
                                    {generatedSchedule.map((item, i) => (
                                        <div key={i} className="pl-6 relative">
                                            {/* Timeline Dot */}
                                            <div className="absolute w-3 h-3 rounded-full -left-[1.5px] top-1 z-10" style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}80` }}></div>
                                            
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-[10px] font-mono text-slate-400">{item.time}</span>
                                                <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                                                    {item.type}
                                                </span>
                                            </div>
                                            
                                            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 mt-1">
                                                <span className="text-white font-black block mb-1">{item.artist}</span>
                                                <span className="text-[10px] text-slate-400 flex items-center">
                                                    <span className="mr-1">📍</span> {item.stage}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-center pt-8">
                                <button 
                                    onClick={generateItinerary}
                                    className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.4)]"
                                >
                                    <span className="mr-2 text-lg">✨</span> Generate Itinerary
                                </button>
                            </div>
                        )}

                    </div>
                  )}

              </div>
              
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default AiItineraryGenerator;
