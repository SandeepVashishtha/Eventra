import React, { useState, useEffect } from 'react';

const MeshNetworkChat = () => {
  const [networkStatus, setNetworkStatus] = useState('cellular'); // cellular, dropping, offline, mesh
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Sarah', text: 'Are you at the main stage yet?', time: '8:45 PM', status: 'delivered', type: 'received' },
    { id: 2, sender: 'You', text: 'Heading there now. Near the food trucks.', time: '8:46 PM', status: 'read', type: 'sent' }
  ]);
  const [inputText, setInputText] = useState('');
  const [activeNodes, setActiveNodes] = useState(0);

  // Hop visualization states
  const [messageHops, setMessageHops] = useState([]);

  useEffect(() => {
    let dropInterval;
    
    if (networkStatus === 'dropping') {
      dropInterval = setTimeout(() => {
        setNetworkStatus('offline');
        
        // Auto-switch to mesh after a brief panic period
        setTimeout(() => {
          setNetworkStatus('mesh');
          setActiveNodes(42);
        }, 3000);
      }, 2000);
    }
    
    return () => clearTimeout(dropInterval);
  }, [networkStatus]);

  const simulateCrash = () => {
    setNetworkStatus('dropping');
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'You',
      text: inputText,
      time: '8:52 PM',
      status: networkStatus === 'mesh' ? 'hopping' : 'sent',
      type: 'sent'
    };
    
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    
    if (networkStatus === 'mesh') {
      simulateMeshHops(newMsg.id);
    }
  };

  const simulateMeshHops = (msgId) => {
    // Simulate peer-to-peer routing
    const hops = [
      { id: 'Node A', time: 500 },
      { id: 'Node B', time: 1200 },
      { id: 'Node C', time: 2100 },
      { id: 'Sarah (Target)', time: 3500 }
    ];
    
    setMessageHops(hops);
    
    setTimeout(() => {
      setMessages(prev => prev.map(m => 
        m.id === msgId ? { ...m, status: 'delivered' } : m
      ));
      setMessageHops([]);
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center font-sans p-6 text-neutral-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Context & Engineering Console (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-cyan-900/50 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📡</span> Networking Infrastructure
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Decentralized <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Mesh-Network Chat</span>.
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed mb-6">
            Cellular towers at massive festivals instantly crash due to network congestion. Eventra utilizes Apple's MultipeerConnectivity and Android's Wi-Fi Direct to build an offline, peer-to-peer mesh network. If the cloud drops, the app automatically routes your texts by securely hopping them through the Bluetooth/WiFi antennas of other nearby attendees' phones until they reach your friends.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-neutral-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
               <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Network Telemetry</h3>
               
               <button 
                 onClick={() => {
                   if(networkStatus === 'cellular' || networkStatus === 'mesh') {
                     setNetworkStatus('cellular');
                     setActiveNodes(0);
                   }
                 }}
                 className="px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
               >
                 Reset Simulation
               </button>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               <div className={`p-4 rounded-xl border flex flex-col justify-center transition-colors duration-500 ${
                 networkStatus === 'cellular' ? 'bg-emerald-900/20 border-emerald-500/30' :
                 networkStatus === 'dropping' ? 'bg-amber-900/20 border-amber-500/30' :
                 'bg-rose-900/20 border-rose-500/30'
               }`}>
                 <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-2">Cloud Connectivity (4G/5G)</span>
                 <div className="flex items-center space-x-2">
                   <div className={`w-3 h-3 rounded-full ${
                     networkStatus === 'cellular' ? 'bg-emerald-500' :
                     networkStatus === 'dropping' ? 'bg-amber-500 animate-ping' :
                     'bg-rose-500'
                   }`}></div>
                   <span className={`text-xl font-black uppercase tracking-widest ${
                     networkStatus === 'cellular' ? 'text-emerald-400' :
                     networkStatus === 'dropping' ? 'text-amber-400' :
                     'text-rose-500'
                   }`}>{networkStatus === 'dropping' ? 'CONGESTED' : networkStatus === 'cellular' ? 'ONLINE' : 'OFFLINE'}</span>
                 </div>
               </div>

               <div className={`p-4 rounded-xl border flex flex-col justify-center transition-colors duration-500 ${
                 networkStatus === 'mesh' ? 'bg-cyan-900/20 border-cyan-500/30' : 'bg-black border-neutral-800'
               }`}>
                 <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-2">P2P Mesh Network</span>
                 <div className="flex justify-between items-end">
                   <span className={`text-xl font-black uppercase tracking-widest ${networkStatus === 'mesh' ? 'text-cyan-400' : 'text-neutral-600'}`}>
                     {networkStatus === 'mesh' ? 'ACTIVE' : 'STANDBY'}
                   </span>
                   <span className="text-[10px] text-neutral-500 font-mono">{activeNodes} Local Nodes</span>
                 </div>
               </div>

             </div>

             <div className="flex-1 bg-neutral-950 rounded-xl border border-neutral-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col">
               <span className="text-neutral-500 uppercase font-bold tracking-widest block mb-2 border-b border-neutral-800 pb-2">Routing Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-1 text-neutral-400">
                 {networkStatus === 'cellular' && (
                   <p>&gt; Connected to Cell Tower 0x4A. Standard AWS WebSockets active.</p>
                 )}
                 {networkStatus === 'dropping' && (
                   <div className="text-amber-400">
                     <p>&gt; WARNING: Packet loss exceeding 80%.</p>
                     <p>&gt; AWS WebSocket disconnected. Connection timeout.</p>
                   </div>
                 )}
                 {networkStatus === 'offline' && (
                   <div className="text-rose-400">
                     <p>&gt; CLOUD CONNECTION SEVERED.</p>
                     <p>&gt; Initializing fallback protocol...</p>
                   </div>
                 )}
                 {networkStatus === 'mesh' && (
                   <div className="text-cyan-400">
                     <p>&gt; Scanning local MultipeerConnectivity & Wi-Fi Direct frequencies...</p>
                     <p>&gt; 42 Eventra peer nodes discovered.</p>
                     <p className="font-bold text-white">&gt; Mesh network established. E2E encryption maintained.</p>
                   </div>
                 )}
                 {messageHops.length > 0 && (
                   <div className="mt-2 space-y-1 text-emerald-400 font-bold">
                     <p>&gt; Routing payload via peer nodes...</p>
                     {messageHops.map((hop, i) => (
                       <p key={i} className="animate-fade-in-up" style={{ animationDelay: \`\${hop.time}ms\` }}>
                         &gt; Hop {i+1}: Handshake with {hop.id}... OK.
                       </p>
                     ))}
                   </div>
                 )}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Mobile Chat App Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-black rounded-[3rem] border-[12px] border-neutral-800 shadow-2xl relative flex flex-col h-[700px] overflow-hidden font-sans">
            
            {/* iOS Header */}
            <div className="h-10 flex justify-between items-center px-6 text-white text-xs font-bold z-20 bg-neutral-900 border-b border-neutral-800">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                {networkStatus === 'cellular' ? (
                  <span>5G 📶</span>
                ) : (
                  <span className="text-rose-500">No Service ⚠️</span>
                )}
                <span className="ml-2">🔋</span>
              </div>
            </div>

            {/* Chat Header */}
            <div className="p-4 bg-neutral-900 flex items-center space-x-3 border-b border-neutral-800 z-10 shadow-md">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white shadow-inner">
                S
              </div>
              <div className="flex-1">
                <h2 className="text-white font-bold">Sarah</h2>
                
                {/* Network Indicator */}
                {networkStatus === 'cellular' ? (
                  <p className="text-[10px] text-emerald-400 flex items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1"></span> Online (Cloud)
                  </p>
                ) : networkStatus === 'mesh' ? (
                  <p className="text-[10px] text-cyan-400 flex items-center animate-pulse">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-1"></span> Eventra Mesh Active
                  </p>
                ) : (
                  <p className="text-[10px] text-rose-500 flex items-center">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-1"></span> Offline
                  </p>
                )}
              </div>
            </div>

            {/* Crash Trigger (Hidden in UI normally, exposed for demo) */}
            {networkStatus === 'cellular' && (
              <button 
                onClick={simulateCrash}
                className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-rose-600 text-white text-[9px] font-bold uppercase px-3 py-1 rounded-full shadow-lg z-30 animate-bounce"
              >
                Simulate Cell Tower Crash
              </button>
            )}

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-950 flex flex-col">
              
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col max-w-[80%] ${msg.type === 'sent' ? 'self-end items-end' : 'self-start items-start'}`}>
                  <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                    msg.type === 'sent' ? 
                      (networkStatus === 'mesh' ? 'bg-cyan-600 text-white rounded-br-sm' : 'bg-blue-600 text-white rounded-br-sm') 
                      : 'bg-neutral-800 text-white border border-neutral-700 rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <div className="flex items-center space-x-1 mt-1 px-1">
                    <span className="text-[9px] text-neutral-500 font-bold uppercase">{msg.time}</span>
                    
                    {msg.type === 'sent' && (
                      <span className="text-[10px] text-neutral-500">
                        {msg.status === 'sent' && '✓'}
                        {msg.status === 'read' && <span className="text-blue-400">✓✓</span>}
                        {msg.status === 'delivered' && (networkStatus === 'mesh' ? <span className="text-cyan-400">✓✓</span> : '✓✓')}
                        {msg.status === 'hopping' && <span className="text-cyan-500 animate-pulse font-mono">...hop...</span>}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
            </div>

            {/* Input Area */}
            <div className="p-4 bg-neutral-900 border-t border-neutral-800 z-10">
              <form onSubmit={sendMessage} className="flex space-x-2">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={networkStatus === 'dropping' || networkStatus === 'offline' ? "Reconnecting..." : "Type a message..."}
                  disabled={networkStatus === 'dropping' || networkStatus === 'offline'}
                  className="flex-1 bg-neutral-950 border border-neutral-700 text-white text-sm rounded-full px-4 py-2 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim() || networkStatus === 'dropping' || networkStatus === 'offline'}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition disabled:opacity-50 ${
                    networkStatus === 'mesh' ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-blue-600 hover:bg-blue-500'
                  }`}
                >
                  <span className="text-white text-lg">↑</span>
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default MeshNetworkChat;
