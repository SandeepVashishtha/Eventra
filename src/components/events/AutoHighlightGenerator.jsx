import React, { useState, useEffect } from 'react';

const AutoHighlightGenerator = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [highlights, setHighlights] = useState([]);
  const [currentDecibel, setCurrentDecibel] = useState(45);
  
  // Simulated decibel history for the waveform
  const [waveform, setWaveform] = useState(Array(40).fill(40));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDecibel(prev => {
        // Random base noise 40-60dB
        let nextDb = 40 + Math.random() * 20;
        
        // Occasional massive spike to simulate applause
        if (Math.random() > 0.92 && !analyzing) {
          nextDb = 95 + Math.random() * 25; // 95-120dB (Cheering/Applause)
          
          if (nextDb > 105) {
            triggerHighlightClip(nextDb);
          }
        }
        
        setWaveform(curr => [...curr.slice(1), nextDb]);
        return Math.floor(nextDb);
      });
    }, 200); // update 5 times a sec

    return () => clearInterval(interval);
  }, [analyzing]);

  const triggerHighlightClip = (peakDb) => {
    setAnalyzing(true);
    
    // Simulate the backend FFmpeg clipping process
    setTimeout(() => {
      const newClip = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        peak: Math.floor(peakDb),
        length: '0:45',
        status: 'ready'
      };
      
      setHighlights(prev => [newClip, ...prev].slice(0, 4));
      setAnalyzing(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context (Col span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-block bg-pink-100 text-pink-700 border border-pink-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
            Social Media & Marketing
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Automated <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Highlight Reels</span>.
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            Stop paying video editors to scrub through 12 hours of footage. Our backend media processor monitors the live audio track for massive decibel spikes (applause/cheering) and instantly clips the surrounding footage for viral social media posts.
          </p>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
             <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Clipping Logic</h3>
             
             <div className="space-y-4">
               <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                 <span className="text-xs font-bold text-slate-600">Trigger Threshold</span>
                 <span className="text-sm font-black text-rose-500">&gt; 105 dB (Applause)</span>
               </div>
               <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                 <span className="text-xs font-bold text-slate-600">Pre-Roll (Before Spike)</span>
                 <span className="text-sm font-mono text-slate-800">- 30 seconds</span>
               </div>
               <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                 <span className="text-xs font-bold text-slate-600">Post-Roll (After Spike)</span>
                 <span className="text-sm font-mono text-slate-800">+ 15 seconds</span>
               </div>
             </div>
          </div>
        </div>

        {/* Right Side: Media Processor Dashboard (Col span 7) */}
        <div className="lg:col-span-7 bg-slate-900 rounded-3xl p-6 md:p-8 border-4 border-slate-800 shadow-2xl flex flex-col h-full min-h-[600px] relative overflow-hidden">
          
          {/* Live Audio Monitor */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 mb-6 relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold flex items-center">
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping mr-3"></span>
                Live Audio Analysis
              </h3>
              <div className="text-right">
                <span className={`text-3xl font-black ${currentDecibel > 105 ? 'text-rose-500' : 'text-slate-200'}`}>
                  {currentDecibel}
                </span>
                <span className="text-slate-500 text-xs font-bold ml-1">dB</span>
              </div>
            </div>

            {/* Dynamic Waveform */}
            <div className="h-24 flex items-end space-x-1 border-b border-slate-800 pb-2 relative">
               {/* 105dB Threshold Line */}
               <div className="absolute left-0 right-0 bottom-[60%] border-t border-rose-500/50 border-dashed z-0 flex justify-end">
                 <span className="text-[8px] text-rose-500 bg-slate-950 px-1 -mt-1.5 font-bold">105dB THRESHOLD</span>
               </div>

               {waveform.map((db, i) => (
                 <div 
                   key={i}
                   className={`flex-1 rounded-t-sm transition-all duration-75 relative z-10 ${db > 105 ? 'bg-rose-500' : db > 80 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                   style={{ height: `${Math.min(100, (db / 130) * 100)}%` }}
                 ></div>
               ))}
            </div>

            {analyzing && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-20">
                <div className="w-8 h-8 border-4 border-slate-700 border-t-rose-500 rounded-full animate-spin mb-2"></div>
                <p className="text-rose-400 font-bold text-xs uppercase tracking-widest animate-pulse">FFmpeg Clipping in Progress...</p>
              </div>
            )}
          </div>

          {/* Generated Highlights List */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Exported Highlights</h3>
            
            {highlights.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                <span className="text-4xl mb-4">✂️</span>
                <p className="text-white font-bold">Waiting for audience reaction...</p>
                <p className="text-xs text-slate-400 mt-1">Leave dashboard open to monitor.</p>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto pr-2">
                {highlights.map((clip) => (
                  <div key={clip.id} className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center justify-between animate-fade-in-up">
                    <div className="flex items-center space-x-4">
                      {/* Thumbnail */}
                      <div className="w-16 h-12 bg-slate-700 rounded-lg relative overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80')] bg-cover opacity-50"></div>
                        <span className="text-white text-xs z-10">▶</span>
                      </div>
                      
                      <div>
                         <h4 className="text-white font-bold text-sm">Keynote Highlight</h4>
                         <div className="flex items-center space-x-2 mt-1">
                           <span className="text-[9px] font-mono text-slate-400">Captured: {clip.timestamp}</span>
                           <span className="text-[9px] bg-rose-900/50 text-rose-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-widest border border-rose-500/30">
                             Peak: {clip.peak}dB
                           </span>
                         </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-400 text-white flex items-center justify-center transition shadow-lg text-sm" title="Post to Twitter">
                        𝕏
                      </button>
                      <button className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 text-white flex items-center justify-center transition shadow-lg text-sm" title="Post to Instagram">
                        IG
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default AutoHighlightGenerator;
