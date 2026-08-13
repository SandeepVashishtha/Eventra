/* eslint-disable */
import React, { useState, useEffect } from 'react';

const P2PMeshMessaging = () => {
  const [networkStatus, setNetworkStatus] = useState('CELLULAR'); // 'CELLULAR' or 'OFFLINE_MESH'
  const [isRouting, setIsRouting] = useState(false);
  
  const [messages, setMessages] = useState([
      { id: 1, sender: 'Alex', text: 'Meet at the left side of Main Stage!', type: 'received', protocol: 'SMS' }
  ]);
  
  const [inputText, setInputText] = useState('');
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '18:00:00', type: 'SYS', msg: 'Cellular radio nominal. 4G/5G connection active.' }
  ]);

  const toggleNetwork = () => {
      const newStatus = networkStatus === 'CELLULAR' ? 'OFFLINE_MESH' : 'CELLULAR';
      setNetworkStatus(newStatus);
      
      if (newStatus === 'OFFLINE_MESH') {
          addLog('CRIT', 'Cell tower congestion detected. Connection dropped.');
          setTimeout(() => {
              addLog('ACTION', 'Initializing WebRTC P2P Data Channels (Bluetooth/Wi-Fi Direct).');
              addLog('SYS', 'Discovered 4 nearby mesh nodes. Establishing decentralized routing table.');
          }, 600);
      } else {
          addLog('SUCCESS', 'Cellular connection restored. Standard routing resumed.');
      }
  };

  const sendMessage = () => {
      if (!inputText.trim()) return;
      
      const newMsg = {
          id: Date.now(),
          sender: 'Me',
          text: inputText,
          type: 'sent',
          protocol: networkStatus === 'CELLULAR' ? 'SMS' : 'WebRTC_Mesh',
          status: 'sending'
      };
      
      setMessages(prev => [...prev, newMsg]);
      setInputText('');
      
      if (networkStatus === 'OFFLINE_MESH') {
          setIsRouting(true);
          addLog('SYS', `Packet encrypted. Routing via Node [0x4A] -> Node [0x9F] -> Destination.`);
          
          setTimeout(() => {
              setIsRouting(false);
              setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' } : m));
              addLog('SUCCESS', 'P2P Handshake confirmed. Message delivered via multi-hop mesh.');
          }, 2500);
      } else {
          setTimeout(() => {
              setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' } : m));
              addLog('SYS', 'Message delivered via standard carrier tower.');
          }, 800);
      }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#07050e] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-900/40 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🕸️</span> WebRTC & Offline-First Architecture
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            P2P Mesh Messaging <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-500 to-cyan-500">via WebRTC</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Cellular networks completely collapse when 100,000 people enter a festival ground. Friends cannot text each other to coordinate meetups, causing panic and frustration. Eventra solves this by implementing a peer-to-peer (P2P) mesh networking protocol within the mobile app using WebRTC data channels. If cell service drops, phones can securely route encrypted text messages through nearby attendees' Bluetooth/Wi-Fi Direct radios, multi-hopping until the message reaches the recipient.
          </p>

          <div className="bg-[#0b0a17] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-indigo-500 text-lg mr-2">🎛️</span> Network Interface
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleNetwork}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     networkStatus === 'OFFLINE_MESH' ? 'bg-slate-800 text-slate-400 border border-slate-700' :
                     'bg-rose-900/60 text-rose-400 border border-rose-500 hover:bg-rose-800 shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                   }`}
                 >
                   {networkStatus === 'OFFLINE_MESH' ? 'Restore Cell Service' : 'Kill Cell Service (Simulate 100k Users)'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Protocol Status */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 networkStatus === 'CELLULAR' ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-indigo-950/20 border-indigo-900/50'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Active Transport Protocol
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none transition-colors duration-300 ${networkStatus === 'CELLULAR' ? 'text-emerald-400' : 'text-indigo-400'}`}>
                     {networkStatus === 'CELLULAR' ? 'HTTPS / SMS' : 'WebRTC P2P Mesh'}
                   </span>
                 </div>
               </div>

               {/* Mesh Topology Visualizer */}
               <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col relative overflow-hidden h-20">
                   <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1">Local Mesh Topology</span>
                   
                   {networkStatus === 'OFFLINE_MESH' ? (
                       <div className="flex-1 relative">
                           {/* Nodes */}
                           <div className="absolute top-1/2 left-2 w-3 h-3 bg-white rounded-full transform -translate-y-1/2 shadow-[0_0_8px_white]"></div>
                           <div className="absolute top-2 left-1/3 w-2 h-2 bg-indigo-500 rounded-full"></div>
                           <div className="absolute bottom-2 left-1/2 w-2 h-2 bg-indigo-500 rounded-full"></div>
                           <div className="absolute top-1/2 right-2 w-3 h-3 bg-white rounded-full transform -translate-y-1/2"></div>
                           
                           {/* Edges */}
                           <svg className="absolute inset-0 w-full h-full pointer-events-none">
                               <line x1="10%" y1="50%" x2="33%" y2="20%" stroke="#6366f1" strokeWidth="1" strokeDasharray="2 2" />
                               <line x1="33%" y1="20%" x2="50%" y2="80%" stroke="#6366f1" strokeWidth="1" strokeDasharray="2 2" />
                               <line x1="50%" y1="80%" x2="90%" y2="50%" stroke="#6366f1" strokeWidth="1" strokeDasharray="2 2" />
                               
                               {/* Animated Packet */}
                               {isRouting && (
                                   <circle cx="0" cy="0" r="3" fill="#38bdf8" className="animate-mesh-route">
                                       <animateMotion path="M 25 25 L 85 10 L 125 40 L 225 25" dur="2s" repeatCount="indefinite" />
                                   </circle>
                               )}
                           </svg>
                       </div>
                   ) : (
                       <div className="flex-1 flex items-center justify-center text-[10px] text-slate-600 font-mono">
                           [Mesh Inactive]
                       </div>
                   )}
               </div>

             </div>
             
             {/* System Log */}
             <div className="flex-1 bg-[#040308] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Data Channel Syslog</span>
                 {isRouting && <span className="text-cyan-400 font-black animate-pulse">ROUTING PACKETS...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-indigo-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-white font-bold bg-rose-600 px-1' :
                       log.type === 'SUCCESS' ? 'text-emerald-500 font-bold' :
                       log.type === 'SYS' ? 'text-slate-300 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Visualizers (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[340px] flex flex-col items-center">
            
            {/* Mobile App Simulator */}
            <div className={`w-full bg-[#f8fafc] rounded-[2.5rem] border-[12px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[650px] overflow-hidden font-sans mb-6 transition-all duration-500`}>
              
              {/* Header */}
              <div className="bg-slate-900 border-b border-slate-800 p-4 pt-6 shadow-sm z-20 flex justify-between items-center text-white">
                  <div className="flex items-center space-x-2">
                      <span className="text-xl">‹</span>
                      <div className="flex flex-col">
                          <span className="text-sm font-bold">Alex (Friend)</span>
                          {networkStatus === 'CELLULAR' ? (
                              <span className="text-[9px] text-emerald-400 flex items-center">
                                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1"></span> 5G Active
                              </span>
                          ) : (
                              <span className="text-[9px] text-indigo-400 flex items-center animate-pulse">
                                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-1"></span> P2P Mesh Active
                              </span>
                          )}
                      </div>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-xs">👤</div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 bg-slate-100 p-4 relative overflow-y-auto flex flex-col space-y-4">
                  
                  {networkStatus === 'OFFLINE_MESH' && (
                      <div className="bg-indigo-100 border border-indigo-200 text-indigo-800 text-[9px] text-center p-2 rounded-lg font-bold shadow-sm mx-4 animate-fade-in-down">
                          Cell service lost. Falling back to decentralized Eventra Mesh Network. Messages are end-to-end encrypted.
                      </div>
                  )}
                  
                  {messages.map(msg => (
                      <div key={msg.id} className={`flex flex-col ${msg.type === 'sent' ? 'items-end' : 'items-start'}`}>
                          <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm shadow-sm ${
                              msg.type === 'sent' ? 
                                  (msg.protocol === 'SMS' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-indigo-600 text-white rounded-br-none') 
                                  : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'
                          }`}>
                              {msg.text}
                          </div>
                          
                          {/* Metadata */}
                          <div className="flex items-center mt-1 text-[8px] text-slate-400 font-bold px-1">
                              {msg.protocol === 'WebRTC_Mesh' && <span className="text-indigo-500 mr-1">🕸️ Mesh</span>}
                              {msg.status === 'sending' ? 'Sending...' : 'Delivered'}
                          </div>
                      </div>
                  ))}

                  {/* Typing indicator (simulated during routing) */}
                  {isRouting && (
                      <div className="flex items-end self-start">
                          <div className="px-4 py-2 rounded-2xl bg-white text-slate-800 rounded-bl-none border border-slate-200 text-xs flex space-x-1 items-center shadow-sm">
                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '100ms'}}></span>
                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '200ms'}}></span>
                          </div>
                      </div>
                  )}

              </div>

              {/* Input Area */}
              <div className="bg-white border-t border-slate-200 p-3 flex items-center shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
                  <span className="text-slate-400 text-xl mr-3">+</span>
                  <input 
                      type="text" 
                      placeholder="Type a message..."
                      className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button 
                      onClick={sendMessage}
                      disabled={isRouting}
                      className={`ml-3 w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors ${
                          inputText ? (networkStatus === 'CELLULAR' ? 'bg-blue-600' : 'bg-indigo-600') : 'bg-slate-300'
                      }`}
                  >
                      ↑
                  </button>
              </div>

            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0b0a17] p-4 rounded-xl border border-indigo-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-indigo-400 uppercase block mb-1">WebRTC Data Channels:</span>
               Click <span className="text-white font-bold bg-rose-600 border border-rose-500 px-1 rounded">Kill Cell Service</span> to simulate massive tower congestion. The app gracefully degrades from HTTPS routing to P2P Mesh mode. Type a message and hit send; the UI simulates routing the encrypted packet through nearby attendees' Bluetooth/Wi-Fi radios until it reaches the destination.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default P2PMeshMessaging;
