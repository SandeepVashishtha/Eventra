import React, { useState, useEffect, useRef } from 'react';

const VoiceCommandCenter = () => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [systemResponse, setSystemResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const transcriptList = [
    "Eventra, what is the current check-in count?",
    "Eventra, broadcast 5-minute warning to all stages.",
    "Eventra, message security about spill in Expo Hall A.",
    "Eventra, what's the WiFi password?"
  ];
  
  const responseMap = {
    "Eventra, what is the current check-in count?": "Currently, 2,845 attendees have checked in (71% of total registrations).",
    "Eventra, broadcast 5-minute warning to all stages.": "Push notification sent: '5 minutes until next sessions begin' to 4 stages.",
    "Eventra, message security about spill in Expo Hall A.": "Message dispatched to Security Channel: 'Spill reported in Expo Hall A'.",
    "Eventra, what's the WiFi password?": "The venue WiFi password is: 'Eventra2026!'"
  };

  const handleMicClick = () => {
    if (listening) {
      setListening(false);
      setIsProcessing(false);
      setTranscript('');
      setSystemResponse('');
    } else {
      setListening(true);
      setSystemResponse('');
      
      // Simulate listening to a random command
      const randomCommand = transcriptList[Math.floor(Math.random() * transcriptList.length)];
      
      // Typewriter effect for transcript
      let i = 0;
      setTranscript('');
      const typing = setInterval(() => {
        setTranscript(randomCommand.substring(0, i + 1));
        i++;
        if (i === randomCommand.length) {
          clearInterval(typing);
          setListening(false);
          setIsProcessing(true);
          
          // Simulate AI processing delay before response
          setTimeout(() => {
            setIsProcessing(false);
            setSystemResponse(responseMap[randomCommand]);
          }, 1500);
        }
      }, 50); // 50ms per character
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans p-6">
      
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Context */}
        <div className="space-y-6">
          <div className="inline-block bg-fuchsia-900/50 text-fuchsia-400 border border-fuchsia-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
            NLP Organizer Assistant
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Voice-Activated <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-500">Command Center</span>.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Stay heads-up during the chaos of live events. Use natural language voice commands to instantly pull stats, broadcast announcements, and dispatch staff without ever touching a dashboard.
          </p>
          
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Try Commands Like:</h4>
            <ul className="space-y-2">
              {transcriptList.slice(0, 3).map((cmd, idx) => (
                <li key={idx} className="bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700 text-sm text-slate-300 flex items-center">
                  <span className="text-fuchsia-400 mr-2">❝</span> {cmd}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Side: Mobile Viewport Simulation */}
        <div className="flex justify-center relative">
          
          {/* Simulated Phone Frame */}
          <div className="w-[340px] h-[720px] bg-slate-950 rounded-[3rem] border-[10px] border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
            
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
              <div className="w-32 h-6 bg-slate-800 rounded-b-xl"></div>
            </div>

            {/* App UI */}
            <div className="flex-1 bg-slate-950 flex flex-col relative pt-12 pb-8 px-6 justify-between">
              
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <span className="text-white font-black text-xl tracking-tight">Eventra <span className="text-fuchsia-500 font-normal opacity-80">Ops</span></span>
                <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-xs text-slate-400">JD</div>
              </div>

              {/* Chat / Interaction Area */}
              <div className="flex-1 flex flex-col justify-end space-y-4 mb-12">
                
                {/* User Transcript Bubble */}
                {(transcript || listening) && (
                  <div className="self-end max-w-[85%] animate-fade-in-up">
                    <div className="bg-fuchsia-600 text-white p-4 rounded-2xl rounded-tr-sm shadow-lg text-sm">
                      {transcript}
                      {listening && <span className="animate-pulse ml-1 inline-block w-1.5 h-4 bg-white/50 align-middle"></span>}
                    </div>
                  </div>
                )}

                {/* Processing Indicator */}
                {isProcessing && (
                  <div className="self-start max-w-[85%] animate-fade-in">
                    <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-sm flex space-x-1.5">
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}

                {/* System Response Bubble */}
                {systemResponse && (
                  <div className="self-start max-w-[85%] animate-fade-in-up">
                    <div className="bg-slate-800 text-slate-200 border border-slate-700 p-4 rounded-2xl rounded-tl-sm shadow-lg text-sm leading-relaxed">
                      {systemResponse}
                    </div>
                  </div>
                )}
                
              </div>

              {/* Voice Interaction Button (Bottom Center) */}
              <div className="relative flex justify-center items-center mt-auto">
                
                {/* Siri-like Waveform Effect (Background) */}
                {listening && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-24 h-24 bg-fuchsia-500/20 rounded-full animate-ping absolute"></div>
                    <div className="w-32 h-32 bg-fuchsia-500/10 rounded-full animate-pulse absolute" style={{ animationDuration: '2s' }}></div>
                  </div>
                )}

                {/* Mic Button */}
                <button 
                  onClick={handleMicClick}
                  className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(217,70,239,0.3)] transition-transform duration-300 ${listening ? 'bg-gradient-to-br from-fuchsia-500 to-pink-600 scale-110' : 'bg-slate-800 hover:bg-slate-700 border border-slate-700'}`}
                >
                  <span className="text-white drop-shadow-md">🎙️</span>
                </button>
              </div>
              
              <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-6">
                {listening ? 'Listening...' : 'Tap to speak'}
              </p>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VoiceCommandCenter;
