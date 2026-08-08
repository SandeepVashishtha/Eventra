import React, { useState, useEffect } from 'react';

const BiometricSentimentAnalysis = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [hrvData, setHrvData] = useState(Array(50).fill(65));
  
  // Total duration of presentation in "minutes" for the graph
  const duration = 45; 
  
  // Scripted events during the keynote to show on timeline
  const timelineEvents = [
    { min: 5, label: 'Intro Story', impact: 'neutral' },
    { min: 18, label: 'Major Product Reveal', impact: 'high' },
    { min: 28, label: 'Boring Architecture Slide', impact: 'low' },
    { min: 40, label: 'Steve Jobs Moment', impact: 'peak' }
  ];

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + 0.5;
        if (next >= duration) {
          setIsPlaying(false);
          return duration;
        }
        return next;
      });
      
      setHrvData(prev => {
        let baseHR = 65;
        
        // Simulate physiological reaction based on timeline events
        if (currentTime > 16 && currentTime < 22) baseHR = 95; // Reveal
        else if (currentTime > 26 && currentTime < 32) baseHR = 55; // Boring
        else if (currentTime > 38 && currentTime < 43) baseHR = 110; // Peak
        else baseHR = 70; // Standard

        // Add variance
        const noise = (Math.random() * 10) - 5;
        return [...prev.slice(1), Math.floor(baseHR + noise)];
      });
      
    }, 200);

    return () => clearInterval(interval);
  }, [isPlaying, currentTime]);

  const togglePlayback = () => {
    if (currentTime >= duration) {
      setCurrentTime(0);
      setHrvData(Array(50).fill(65));
    }
    setIsPlaying(!isPlaying);
  };

  const calculateAverageHR = () => {
    const sum = hrvData.reduce((a, b) => a + b, 0);
    return Math.floor(sum / hrvData.length);
  };

  const getSentimentLabel = (hr) => {
    if (hr > 90) return { text: 'Highly Engaged / Excited', color: 'text-rose-500' };
    if (hr < 60) return { text: 'Disengaged / Resting', color: 'text-blue-500' };
    return { text: 'Baseline Attention', color: 'text-emerald-500' };
  };

  const currentSentiment = getSentimentLabel(hrvData[hrvData.length - 1]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context (Col span 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="inline-block bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">❤️</span> HealthKit Integration
          </div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight">
            Biometric <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-500">Sentiment Analysis</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Ditch the subjective post-event surveys. By integrating with Apple HealthKit and Google Fit APIs, we analyze the anonymized, aggregate Heart Rate Variability (HRV) of the audience to scientifically map physiological excitement directly to the speaker's timeline.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4">
               <span className="text-[10px] bg-slate-100 text-slate-500 font-bold uppercase px-2 py-1 rounded border border-slate-200">
                 Strict Opt-In
               </span>
             </div>
             
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Live Audience Telemetry</h3>
             
             <div className="flex items-end space-x-4 mb-6">
               <span className="text-5xl font-black text-slate-900">{calculateAverageHR()}</span>
               <div className="pb-1">
                 <span className="text-sm font-bold text-slate-500 block">BPM</span>
                 <span className="text-[10px] text-slate-400 uppercase tracking-widest">Aggregate Avg</span>
               </div>
             </div>

             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Current Physiological State</span>
               <span className={`text-sm font-black flex items-center ${currentSentiment.color}`}>
                 <span className={`w-2 h-2 rounded-full mr-2 ${currentSentiment.color.replace('text', 'bg')} animate-pulse`}></span>
                 {currentSentiment.text}
               </span>
             </div>

             <div className="grid grid-cols-2 gap-3">
               <div className="text-center p-3 border border-slate-100 rounded-lg">
                 <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Apple Watches</span>
                 <span className="text-lg font-bold text-slate-700">1,204</span>
               </div>
               <div className="text-center p-3 border border-slate-100 rounded-lg">
                 <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Android Wear</span>
                 <span className="text-lg font-bold text-slate-700">892</span>
               </div>
             </div>
          </div>
        </div>

        {/* Right Side: The Timeline Analysis (Col span 8) */}
        <div className="lg:col-span-8 bg-slate-900 rounded-3xl border-4 border-slate-800 shadow-2xl flex flex-col h-full min-h-[600px] relative overflow-hidden">
          
          <div className="p-6 border-b border-slate-800 flex justify-between items-center z-10 relative">
            <div>
              <h2 className="text-xl font-black text-white">Post-Session Performance Review</h2>
              <p className="text-xs text-slate-400 font-mono mt-1">Speaker: Dr. Sarah Jenkins | Session: Web3 Future</p>
            </div>
            
            <button 
              onClick={togglePlayback}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl transition transform hover:scale-105 shadow-lg ${isPlaying ? 'bg-rose-600' : 'bg-blue-600'}`}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
          </div>

          <div className="flex-1 flex flex-col p-6 relative">
            
            {/* Video Playback Simulator Overlay */}
            <div className="absolute inset-x-6 top-6 h-48 bg-black rounded-2xl border border-slate-700 overflow-hidden shadow-inner flex items-center justify-center">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-40"></div>
              
              {/* Fake video timeline scrubber mapping to currentTime */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                <div className="h-full bg-rose-500" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
              </div>
              
              <div className="z-10 text-center">
                <span className="text-white font-mono bg-black/60 px-2 py-1 rounded text-sm">
                  {Math.floor(currentTime)}:{(currentTime % 1 * 60).toString().padStart(2, '0')} / {duration}:00
                </span>
              </div>
            </div>

            <div className="mt-56 flex-1 flex flex-col">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">Audience Heart Rate Variability (HRV)</h3>
              
              {/* Dynamic Graph Area */}
              <div className="flex-1 relative border-l border-b border-slate-700 ml-8 mb-6">
                
                {/* Y-Axis Labels */}
                <div className="absolute -left-8 top-0 text-[9px] text-slate-500 font-mono">120</div>
                <div className="absolute -left-8 top-1/4 text-[9px] text-slate-500 font-mono">90</div>
                <div className="absolute -left-8 top-1/2 text-[9px] text-slate-500 font-mono">75</div>
                <div className="absolute -left-8 bottom-0 text-[9px] text-slate-500 font-mono">50</div>

                {/* Grid Lines */}
                <div className="absolute top-1/4 left-0 right-0 border-t border-slate-800/50 border-dashed"></div>
                <div className="absolute top-1/2 left-0 right-0 border-t border-slate-800/50 border-dashed"></div>
                
                {/* Rendered Graph Bars */}
                <div className="absolute inset-0 flex items-end justify-between px-1">
                  {hrvData.map((hr, i) => (
                    <div 
                      key={i} 
                      className={`w-2 rounded-t-sm transition-all duration-150 ${hr > 90 ? 'bg-rose-500' : hr < 60 ? 'bg-blue-500' : 'bg-emerald-500'}`}
                      style={{ height: `${Math.max(0, Math.min(100, ((hr - 40) / 80) * 100))}%` }}
                    ></div>
                  ))}
                </div>

                {/* Playhead Line */}
                <div 
                  className="absolute top-0 bottom-0 w-px bg-white z-20 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                  style={{ left: `${(currentTime / duration) * 100}%` }}
                >
                  <div className="absolute -top-2 -ml-1.5 w-3 h-3 bg-white rounded-full"></div>
                </div>

                {/* Timeline Event Annotations */}
                {timelineEvents.map((evt, idx) => (
                  <div 
                    key={idx} 
                    className="absolute bottom-0 border-l border-dashed border-slate-600 pl-1 pb-1"
                    style={{ left: `${(evt.min / duration) * 100}%`, height: '100%' }}
                  >
                    <div className={`text-[9px] font-bold uppercase tracking-wider bg-slate-900 px-1 py-0.5 rounded border mt-2 w-max ${
                      evt.impact === 'peak' ? 'text-rose-400 border-rose-500/30' :
                      evt.impact === 'high' ? 'text-amber-400 border-amber-500/30' :
                      evt.impact === 'low' ? 'text-blue-400 border-blue-500/30' : 'text-slate-400 border-slate-700'
                    }`}>
                      {evt.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* X-Axis Labels */}
              <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono ml-8">
                <span>0:00</span>
                <span>15:00</span>
                <span>30:00</span>
                <span>45:00</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default BiometricSentimentAnalysis;
