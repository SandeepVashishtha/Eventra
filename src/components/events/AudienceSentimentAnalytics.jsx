import React, { useState, useEffect } from 'react';

const AudienceSentimentAnalytics = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  
  // Simulated timeline data representing the 45-minute keynote
  const duration = 2700; // 45 minutes in seconds
  
  // Aggregate sentiment data (Engagement, Boredom, Confusion)
  const [metrics, setMetrics] = useState({
    engagement: 75,
    boredom: 15,
    confusion: 10
  });

  const [currentSlide, setCurrentSlide] = useState(1);
  const [insight, setInsight] = useState("Audience heavily engaged with opening hook.");

  // Mock data for the timeline chart
  const timelineData = [
    { time: '0:00', e: 80, b: 10, c: 10, slide: 1, note: 'Intro' },
    { time: '10:00', e: 90, b: 5, c: 5, slide: 12, note: 'Demo' },
    { time: '20:00', e: 40, b: 45, c: 15, slide: 28, note: 'Architecture Deep Dive (Low Engagement)' },
    { time: '30:00', e: 35, b: 15, c: 50, slide: 35, note: 'Pricing Model (High Confusion)' },
    { time: '40:00', e: 85, b: 10, c: 5, slide: 45, note: 'Q&A' }
  ];

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 15; // Fast forward 15s per tick
          if (next >= duration) {
            setIsPlaying(false);
            return 0;
          }
          
          // Update dynamic metrics based on timeline
          if (next > 2400) { // 40m mark (Q&A)
            setMetrics({ engagement: 85, boredom: 10, confusion: 5 });
            setCurrentSlide(45);
            setInsight("High engagement during Q&A session.");
          } else if (next > 1800) { // 30m mark (Pricing)
            setMetrics({ engagement: 35, boredom: 15, confusion: 50 });
            setCurrentSlide(35);
            setInsight("WARNING: Massive spike in confusion during Pricing Model breakdown.");
          } else if (next > 1200) { // 20m mark (Architecture)
            setMetrics({ engagement: 40, boredom: 45, confusion: 15 });
            setCurrentSlide(28);
            setInsight("WARNING: Audience losing focus. Prolonged boredom detected on Architecture slide.");
          } else if (next > 600) { // 10m mark (Demo)
            setMetrics({ engagement: 90, boredom: 5, confusion: 5 });
            setCurrentSlide(12);
            setInsight("Peak engagement achieved during Live Demo segment.");
          }
          
          return next;
        });
      }, 500); // UI updates every 500ms
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context & Master Analytics (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🧠</span> Deep Learning Analytics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Facial Emotion <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Sentiment Engine</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Post-event email surveys are biased and largely ignored. Eventra processes the venue's stage-facing camera feeds through a privacy-preserving facial emotion recognition model. It aggregates macro-level audience expressions time-synced directly to the speaker's slide deck, providing empirical data on exactly which topics resonated and which fell flat.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
               <div>
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Keynote Post-Mortem</h3>
                 <span className="text-[10px] text-slate-500 font-bold">Speaker: Dr. A. Mercer • Track: Future Tech</span>
               </div>
               
               <button 
                 onClick={() => setIsPlaying(!isPlaying)}
                 className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition shadow-lg flex items-center ${
                   isPlaying ? 'bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                 }`}
               >
                 {isPlaying ? '⏸ Pause Playback' : '▶ Play Timeline'}
               </button>
             </div>

             {/* Live Metrics Row */}
             <div className="flex space-x-4 mb-6">
               <div className="flex-1 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                 <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Engagement</span>
                 <div className="text-3xl font-black text-emerald-500 font-mono transition-all duration-300">{metrics.engagement}%</div>
               </div>
               <div className="flex-1 bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                 <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Boredom</span>
                 <div className="text-3xl font-black text-amber-500 font-mono transition-all duration-300">{metrics.boredom}%</div>
               </div>
               <div className="flex-1 bg-rose-50 border border-rose-100 p-4 rounded-2xl">
                 <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Confusion</span>
                 <div className="text-3xl font-black text-rose-500 font-mono transition-all duration-300">{metrics.confusion}%</div>
               </div>
             </div>

             {/* Slide Context & Insights */}
             <div className="flex-1 bg-slate-900 rounded-2xl p-5 border border-slate-800 flex flex-col justify-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full filter blur-2xl transform translate-x-10 -translate-y-10"></div>
               
               <div className="flex justify-between items-start relative z-10 mb-2">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time-Synced Context</span>
                 <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-mono px-2 py-1 rounded">Slide {currentSlide} / 50</span>
               </div>
               
               <div className="relative z-10 flex-1 flex flex-col justify-center">
                 <p className={`font-mono text-sm leading-relaxed transition-all duration-300 ${
                   metrics.confusion > 30 ? 'text-rose-400' : 
                   metrics.boredom > 30 ? 'text-amber-400' : 'text-emerald-400'
                 }`}>
                   &gt; {insight}
                 </p>
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Timeline & Vision Simulation (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          <div className="w-full bg-slate-900 rounded-[2rem] border-[8px] border-slate-950 shadow-2xl relative overflow-hidden flex flex-col h-[650px]">
            
            {/* Vision Header */}
            <div className="bg-black p-3 flex justify-between items-center z-20 border-b border-slate-800">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></span> Stage-Facing Cam
              </span>
              <span className="text-[10px] text-slate-500 font-mono text-rose-500 animate-pulse font-bold flex items-center">
                <span className="mr-1">●</span> REC {formatTime(currentTime)}
              </span>
            </div>

            {/* Video Canvas (Simulated Crowd) */}
            <div className="h-64 relative bg-black flex items-center justify-center overflow-hidden border-b border-slate-800">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-40"></div>
               
               {/* Facial Tracking Overlays */}
               {isPlaying && (
                 <div className="absolute inset-0 pointer-events-none">
                   {/* Fake bounding boxes */}
                   <div className={`absolute top-1/4 left-1/4 w-12 h-16 border-2 rounded transition-colors duration-300 ${metrics.confusion > 30 ? 'border-rose-500' : metrics.boredom > 30 ? 'border-amber-500' : 'border-emerald-500'}`}></div>
                   <div className={`absolute top-1/3 right-1/3 w-10 h-12 border-2 rounded transition-colors duration-300 ${metrics.confusion > 30 ? 'border-rose-500' : metrics.boredom > 30 ? 'border-amber-500' : 'border-emerald-500'}`}></div>
                   <div className={`absolute bottom-1/4 left-1/3 w-14 h-16 border-2 rounded transition-colors duration-300 ${metrics.confusion > 30 ? 'border-rose-500' : metrics.boredom > 30 ? 'border-amber-500' : 'border-emerald-500'}`}></div>
                   
                   {/* Macro Data Overlay */}
                   <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[8px] font-mono text-slate-300 border border-slate-700">
                     FACES DETECTED: 842<br/>
                     AGGREGATION: MACRO
                   </div>
                 </div>
               )}
            </div>

            {/* Timeline UI */}
            <div className="flex-1 bg-slate-900 p-4 flex flex-col relative">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Event Timeline (45m)</h4>
              
              <div className="relative flex-1 flex flex-col justify-between ml-8 border-l border-slate-700 py-2">
                
                {/* Playhead indicator */}
                <div 
                  className="absolute left-[-5px] w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_white] transition-all duration-300 z-20"
                  style={{ top: \`\${(currentTime / duration) * 100}%\` }}
                ></div>

                {timelineData.map((node, i) => (
                  <div key={i} className="relative group">
                    <div className="absolute -left-10 text-[10px] font-mono text-slate-500">{node.time}</div>
                    <div className="absolute -left-1.5 w-3 h-3 rounded-full bg-slate-800 border-2 border-slate-600 group-hover:border-indigo-400 transition"></div>
                    
                    <div className="pl-6 pb-2">
                      <span className="text-xs font-bold text-white block">{node.note}</span>
                      <div className="flex space-x-2 mt-1">
                        <span className="text-[8px] font-black uppercase text-emerald-500">Eng: {node.e}%</span>
                        <span className="text-[8px] font-black uppercase text-amber-500">Bor: {node.b}%</span>
                        <span className="text-[8px] font-black uppercase text-rose-500">Con: {node.c}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default AudienceSentimentAnalytics;
