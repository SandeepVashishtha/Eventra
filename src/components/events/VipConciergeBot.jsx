/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';

const VipConciergeBot = () => {
  const [systemActive, setSystemActive] = useState(false);
  
  // RAG Metrics
  const [activeSessions, setActiveSessions] = useState(0); 
  const [llmLatency, setLlmLatency] = useState(0); // ms
  const [ragQueries, setRagQueries] = useState(1452); // Total queries handled
  const [handoffRate, setHandoffRate] = useState(4.2); // %
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '12:00:00', type: 'SYS', msg: 'Festival Manifest & VIP Rules ingested into Vector DB.' },
    { id: 2, time: '12:00:02', type: 'SYS', msg: 'LLM Concierge Agent active. Awaiting SMS ingress...' }
  ]);

  // Visualizer State
  const [chatHistory, setChatHistory] = useState([
      { id: 0, sender: 'bot', text: 'Welcome to the Eventra VIP Concierge. How can I assist you today?' }
  ]);
  const [ragContext, setRagContext] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const chatContainerRef = useRef(null);

  useEffect(() => {
      // Auto-scroll chat to bottom
      if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
  }, [chatHistory, isTyping]);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          setActiveSessions(240 + Math.floor(Math.random() * 20));
      }, 1000); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive]);

  const simulateVipMessage = (msgType) => {
      if (!systemActive || isTyping) return;
      
      let userMsg = '';
      let botResponse = '';
      let retrievedDocs = [];
      let delay = 800 + Math.random() * 400; // LLM Latency

      if (msgType === 'SET_TIME') {
          userMsg = 'What time does ODESZA play tonight, and which stage?';
          botResponse = 'ODESZA will be headlining the Main Stage tonight from 10:30 PM to 12:00 AM. Since you have a Platinum VIP pass, you have access to the elevated viewing deck on the right side of the stage.';
          retrievedDocs = ['doc_schedules.json', 'doc_vip_tiers.md'];
      } else if (msgType === 'BAR') {
          userMsg = 'Where is the private bar? The main ones are packed.';
          botResponse = 'There are two private VIP bars nearby: One behind the Neon Tent (Wait time: ~2 mins) and the Platinum Lounge next to the Main Stage (Wait time: ~0 mins). Can I send you walking directions?';
          retrievedDocs = ['doc_map_nodes.json', 'api_bar_wait_times'];
      } else if (msgType === 'COMPLEX') {
          userMsg = 'My friend lost their VIP wristband, but they are inside my cabana. Can you bring a replacement?';
          botResponse = 'I apologize, but wristband replacements require in-person identity verification. I am handing you off to a human VIP host who will come to your cabana immediately to resolve this.';
          retrievedDocs = ['doc_ticketing_policy.md'];
      }

      // Add user message
      setChatHistory(prev => [...prev, { id: Date.now(), sender: 'user', text: userMsg }]);
      
      // Trigger RAG Pipeline Visuals
      setTimeout(() => {
          if (!systemActive) return;
          
          setRagContext(retrievedDocs);
          addLog('SYS', `Semantic Search: Embedding user query. Retrieved ${retrievedDocs.length} context documents.`);
          
          if (msgType === 'COMPLEX') {
              addLog('WARN', 'LLM Confidence < 0.85 on policy resolution. Triggering Human Handoff.');
          }
          
          setIsTyping(true);
          setLlmLatency(delay);

          // LLM Response
          setTimeout(() => {
              if (!systemActive) return;
              
              setIsTyping(false);
              setChatHistory(prev => [...prev, { id: Date.now()+1, sender: 'bot', text: botResponse }]);
              setRagQueries(prev => prev + 1);
              
              if (msgType === 'COMPLEX') {
                  setHandoffRate(prev => Math.min(100, prev + 0.1));
              }

              setTimeout(() => {
                  setRagContext([]);
              }, 2000);

          }, delay);

      }, 400); // RAG Retrieval delay
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setActiveSessions(240);
      addLog('SYS', 'LLM Concierge Agent Deployed. Routing SMS gateway to inference engine.');
    } else {
      setSystemActive(false);
      setActiveSessions(0);
      setLlmLatency(0);
      setChatHistory([{ id: 0, sender: 'bot', text: 'Welcome to the Eventra VIP Concierge. How can I assist you today?' }]);
      setRagContext([]);
      addLog('WARN', 'AI Concierge Offline. 240 active sessions routed to 5 human hosts (EXPECT DELAYS).');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070502] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-yellow-900/40 text-yellow-500 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🤖</span> Applied Generative AI
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Automated VIP Concierge <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-400 to-orange-500">Local RAG Agents</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Human VIP concierges get overwhelmed answering the same repetitive questions about set times, private bar locations, and table service limits via text message, leading to poor response times for premium guests. Eventra solves this by deploying an NLP-based VIP Concierge Bot using a Retrieval-Augmented Generation (RAG) architecture. Eventra loads the entire festival manifest, site maps, and VIP rules into a vector database. When a VIP texts, the LLM retrieves the exact context and generates conversational, accurate responses instantly, seamlessly handing off to a human only for complex requests.
          </p>

          <div className="bg-[#120c06] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-yellow-500 text-lg mr-2">🎛️</span> RAG Pipeline Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-yellow-600 hover:bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Shutdown AI Engine' : 'Deploy LLM Agents'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Active Sessions */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-yellow-950/20 border-yellow-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Active VIP Chats
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     systemActive ? 'text-yellow-500' : 'text-slate-600'
                   }`}>
                     {activeSessions}
                   </span>
                 </div>
               </div>

               {/* LLM Latency */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isTyping ? 'bg-purple-950/40 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]' :
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Inference Time
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     isTyping ? 'text-purple-400' : 'text-slate-300'
                   }`}>
                     {llmLatency.toFixed(0)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ms</span>
                 </div>
               </div>
               
               {/* Total Queries */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Queries Handled
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {ragQueries.toLocaleString()}
                   </span>
                 </div>
               </div>
               
               {/* Handoff Rate */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 handoffRate > 10 ? 'bg-red-950/40 border-red-500/50' :
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Human Handoff
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     handoffRate > 10 ? 'text-red-400' : 'text-emerald-400'
                   }`}>
                     {handoffRate.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050302] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>RAG Orchestration Ledger</span>
                 {isTyping && <span className="text-purple-400 font-black animate-pulse">GENERATING RESPONSE...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-yellow-400 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Visualizers (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[420px] flex flex-col items-center">
            
            {/* VIP App UI Simulator */}
            <div className={`w-full rounded-[2rem] border-[8px] border-[#1e293b] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[500px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-black'
            }`}>
              
              {/* Phone Header */}
              <div className="absolute top-0 inset-x-0 p-2 text-center z-40 pointer-events-none flex justify-between bg-black/80 backdrop-blur-md border-b border-slate-800">
                <span className="text-[10px] font-black text-white ml-4">9:41</span>
                <span className="text-[10px] font-black text-white mr-4">📶 🔋</span>
              </div>
              
              {/* App Header */}
              <div className="absolute top-7 inset-x-0 p-3 flex items-center z-40 bg-black/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black font-black text-lg mr-3">
                      E
                  </div>
                  <div>
                      <h3 className="text-white font-bold text-sm leading-tight">Eventra Concierge</h3>
                      <span className="text-yellow-500 text-[10px] font-bold tracking-widest uppercase">Platinum VIP Support</span>
                  </div>
              </div>

              <div className="flex-1 relative flex flex-col overflow-hidden pt-24 pb-16 bg-[#0a0a0a]">
                  
                  {!systemActive ? (
                     <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                         <span className="text-4xl mb-4 text-slate-600">🤖</span>
                         <span className="text-sm font-bold text-slate-500 mb-2">Concierge Offline</span>
                     </div>
                  ) : (
                    <div className="w-full h-full relative z-20 flex flex-col">
                        
                        {/* Chat Messages */}
                        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth pb-12">
                            {chatHistory.map(msg => (
                                <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                                        msg.sender === 'user' 
                                            ? 'bg-blue-600 text-white rounded-tr-sm' 
                                            : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            
                            {/* Typing Indicator */}
                            {isTyping && (
                                <div className="flex w-full justify-start">
                                    <div className="max-w-[85%] p-4 rounded-2xl bg-slate-800 border border-slate-700 rounded-tl-sm flex space-x-1">
                                        <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RAG Context Visualizer (Overlay) */}
                        {ragContext.length > 0 && (
                            <div className="absolute bottom-16 left-4 right-4 bg-purple-900/90 backdrop-blur-md border border-purple-500 rounded-xl p-3 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 z-30">
                                <span className="text-[8px] font-black uppercase tracking-widest text-purple-300 flex items-center mb-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse mr-2"></span>
                                    Vector DB Context Retrieved
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {ragContext.map((doc, i) => (
                                        <span key={i} className="text-[10px] bg-black/50 text-purple-200 px-2 py-1 rounded border border-purple-700 font-mono">
                                            📄 {doc}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="absolute bottom-0 inset-x-0 p-3 bg-black/80 backdrop-blur-md border-t border-slate-800">
                            <div className="w-full bg-slate-900 rounded-full h-10 border border-slate-700 flex items-center px-4">
                                <span className="text-slate-500 text-sm">Message Concierge...</span>
                            </div>
                        </div>

                    </div>
                  )}
                
              </div>
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#120c06] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate VIP Inquiries</span>
               
               <div className="grid grid-cols-2 gap-2 mb-2">
                 <button 
                   onClick={() => simulateVipMessage('SET_TIME')}
                   disabled={!systemActive || isTyping}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border flex items-center justify-center ${
                     !systemActive || isTyping ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-yellow-950/40 border-yellow-600 text-yellow-500 hover:bg-yellow-900/60 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                   }`}
                 >
                   🎵 Ask Set Time
                 </button>
                 
                 <button 
                   onClick={() => simulateVipMessage('BAR')}
                   disabled={!systemActive || isTyping}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border flex items-center justify-center ${
                     !systemActive || isTyping ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-blue-950/40 border-blue-600 text-blue-400 hover:bg-blue-900/60 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                   }`}
                 >
                   🍸 Find VIP Bar
                 </button>
               </div>
               
               <button 
                   onClick={() => simulateVipMessage('COMPLEX')}
                   disabled={!systemActive || isTyping}
                   className={`w-full py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border flex items-center justify-center ${
                     !systemActive || isTyping ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-400 hover:bg-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                   }`}
                 >
                   ⚠️ Complex Policy Request (Human Handoff)
               </button>

            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default VipConciergeBot;
