/* eslint-disable */
import React, { useState, useEffect } from 'react';

const SpatialAudioLivestream = () => {
  const [engineActive, setEngineActive] = useState(false);
  const [audioMode, setAudioMode] = useState('STEREO'); // STEREO, BINAURAL
  
  // Ambisonic Field Simulation States
  const [frontStageLevel, setFrontStageLevel] = useState(70);
  const [rearCrowdLevel, setRearCrowdLevel] = useState(30);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '12:00:00', type: 'SYS', msg: 'Tetrahedral ambisonic microphone array online (FOH Booth).' },
    { id: 2, time: '12:00:02', type: 'SYS', msg: 'Broadcasting Dry Stereo Board Feed (Default).' }
  ]);

  useEffect(() => {
    let loop;
    
    if (engineActive) {
      loop = setInterval(() => {
        // Simulate dynamic audio field
        setFrontStageLevel(prev => Math.min(95, Math.max(65, prev + (Math.random() * 10 - 5))));
        setRearCrowdLevel(prev => Math.min(80, Math.max(25, prev + (Math.random() * 8 - 4))));
      }, 500);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [engineActive]);

  const toggleSpatialAudio = () => {
    if (audioMode === 'STEREO') {
      setAudioMode('BINAURAL');
      addLog('ACTION', 'Engaging Real-Time Ambisonic to Binaural DSP Decoder.');
      
      setTimeout(() => {
        addLog('WEB3', 'Streaming HRTF-processed spatial audio to remote viewers.');
        addLog('SUCCESS', 'Remote viewers now experiencing 360° sound field.');
      }, 800);
    } else {
      setAudioMode('STEREO');
      addLog('WARN', 'DSP bypassed. Reverting to flat, dry stereo board feed.');
    }
  };

  const toggleEngine = () => {
    if (!engineActive) {
      setEngineActive(true);
      addLog('SYS', 'Livestream audio engine initialized. Ingesting B-format audio.');
    } else {
      setEngineActive(false);
      setAudioMode('STEREO');
      setFrontStageLevel(70);
      setRearCrowdLevel(30);
      addLog('WARN', 'Audio streaming engine offline.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Audio Engine Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎧</span> Spatial DSP Streaming
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Spatial Audio (Ambisonics) <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-500">Livestream Mixing Engine</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Livestreaming a festival in standard stereo often makes the music feel flat and sterile, failing to capture the massive scale and reverberation of an outdoor stadium. Eventra solves this by deploying a tetrahedral ambisonic microphone array at the Front of House booth to capture the entire 360-degree acoustic environment. Our streaming engine decodes this B-format audio into a binaural mix in real-time. Fans listening at home with standard headphones experience true spatial audio, hearing the crowd chanting behind them and the PA system echoing in front.
          </p>

          <div className="bg-[#100a14] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-fuchsia-500 text-lg mr-2">🎛️</span> Ambisonic Decoder Output
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleEngine}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     engineActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(192,38,211,0.4)]'
                   }`}
                 >
                   {engineActive ? 'Kill Audio Stream' : 'Initialize B-Format Ingestion'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Current Audio Format */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 audioMode === 'BINAURAL' && engineActive ? 'bg-purple-950/40 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]' :
                 engineActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Active Stream Format
                 </span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black font-mono leading-tight ${
                     audioMode === 'BINAURAL' && engineActive ? 'text-purple-400 animate-pulse' : 
                     engineActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {engineActive ? (audioMode === 'BINAURAL' ? '3D BINAURAL' : 'FLAT STEREO') : 'OFFLINE'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest font-mono">
                     {engineActive ? (audioMode === 'BINAURAL' ? 'HRTF DSP Decoder ACTIVE' : 'Direct Board Feed') : '---'}
                   </span>
                 </div>
               </div>

               {/* Channel Visualization */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 engineActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Output Channels
                 </span>
                 
                 <div className="flex space-x-2">
                   {/* Left Channel */}
                   <div className="flex-1">
                     <span className="text-[8px] font-bold text-slate-400 block text-center mb-1">LEFT</span>
                     <div className="h-6 bg-slate-900 rounded overflow-hidden flex">
                       <div className={`h-full transition-all duration-75 ${audioMode === 'BINAURAL' ? 'bg-fuchsia-500' : 'bg-slate-400'}`} style={{ width: `${engineActive ? frontStageLevel : 0}%` }}></div>
                     </div>
                   </div>
                   {/* Right Channel */}
                   <div className="flex-1">
                     <span className="text-[8px] font-bold text-slate-400 block text-center mb-1">RIGHT</span>
                     <div className="h-6 bg-slate-900 rounded overflow-hidden flex">
                       <div className={`h-full transition-all duration-75 ${audioMode === 'BINAURAL' ? 'bg-purple-500' : 'bg-slate-400'}`} style={{ width: `${engineActive ? (frontStageLevel * 0.9 + (Math.random()*10)) : 0}%` }}></div>
                     </div>
                   </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-black rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>DSP Encoding Log</span>
                 {audioMode === 'BINAURAL' && engineActive && <span className="text-purple-400 animate-pulse">Encoding Spatial Mix...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-purple-400 font-bold' : 
                       log.type === 'ACTION' ? 'text-fuchsia-400 font-bold' :
                       log.type === 'WEB3' ? 'text-indigo-400 font-bold' :
                       log.type === 'WARN' ? 'text-yellow-500 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Listener Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[340px] flex flex-col items-center">
            
            {/* Viewer Headphone Simulator */}
            <div className={`w-full rounded-[2.5rem] border-[10px] border-[#18181b] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-all duration-300 ${
              engineActive ? 'bg-slate-900' : 'bg-[#0f172a]'
            }`}>
              
              {/* Dynamic Island */}
              <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
                <div className="w-20 h-6 bg-[#18181b] rounded-b-2xl"></div>
              </div>

              <div className="flex-1 relative flex flex-col items-center justify-center p-6">
                
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Home Viewer Experience</h3>

                {/* Spatial Field Visualizer */}
                <div className="relative w-48 h-48 rounded-full border-2 border-slate-700 flex items-center justify-center mb-8">
                  
                  {/* Listener (Center) */}
                  <div className="w-8 h-8 bg-slate-300 rounded-full z-20 flex items-center justify-center text-black text-[10px]">👤</div>
                  
                  {/* Headphones */}
                  <div className={`absolute w-12 h-12 rounded-full border-2 z-10 transition-colors duration-500 ${
                    audioMode === 'BINAURAL' && engineActive ? 'border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.5)]' : 'border-slate-500'
                  }`}></div>

                  {engineActive && audioMode === 'BINAURAL' && (
                    <>
                      {/* Front Stage Audio Field */}
                      <div 
                        className="absolute top-0 w-32 h-16 bg-gradient-radial from-fuchsia-500/40 to-transparent rounded-t-full origin-bottom opacity-70 transition-all duration-75"
                        style={{ transform: `scale(${frontStageLevel / 100})`, filter: 'blur(4px)' }}
                      ></div>
                      
                      {/* Rear Crowd Audio Field */}
                      <div 
                        className="absolute bottom-0 w-32 h-16 bg-gradient-radial from-purple-500/40 to-transparent rounded-b-full origin-top opacity-50 transition-all duration-75"
                        style={{ transform: `scale(${rearCrowdLevel / 100})`, filter: 'blur(4px)' }}
                      ></div>
                      
                      <span className="absolute -top-4 text-[8px] font-black text-fuchsia-400">MAIN PA</span>
                      <span className="absolute -bottom-4 text-[8px] font-black text-purple-400">CROWD ROAR</span>
                    </>
                  )}
                  
                  {engineActive && audioMode === 'STEREO' && (
                    <>
                      {/* Left/Right Flat Audio */}
                      <div className="absolute left-[-10px] w-4 h-16 bg-slate-500/50 rounded filter blur-sm"></div>
                      <div className="absolute right-[-10px] w-4 h-16 bg-slate-500/50 rounded filter blur-sm"></div>
                      <span className="absolute top-2 text-[8px] font-black text-slate-500">FLAT L/R MIX</span>
                    </>
                  )}

                  {!engineActive && (
                    <span className="absolute top-2 text-[8px] font-black text-slate-700">NO AUDIO</span>
                  )}
                </div>

                <div className="text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Listening Experience</span>
                  <span className={`text-lg font-black uppercase tracking-widest ${
                    audioMode === 'BINAURAL' && engineActive ? 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-500' : 'text-slate-400'
                  }`}>
                    {engineActive ? (audioMode === 'BINAURAL' ? 'Immersive 360°' : 'Dry Stereo') : 'Offline'}
                  </span>
                </div>

              </div>
            </div>

            {/* Interaction Buttons */}
            <div className="w-full">
              <button 
                onClick={toggleSpatialAudio}
                disabled={!engineActive}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition shadow-md border ${
                  !engineActive ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  audioMode === 'STEREO' ? 'bg-fuchsia-950/40 border-fuchsia-900 text-fuchsia-500 hover:bg-fuchsia-900/60' :
                  'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {audioMode === 'STEREO' ? 'Engage Ambisonic DSP' : 'Revert to Stereo Board Mix'}
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default SpatialAudioLivestream;
