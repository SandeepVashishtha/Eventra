import React, { useState } from 'react';

const E2EEVIPMessaging = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'other', text: 'Are the Q3 acquisition rumors true?', time: '10:42 AM', status: 'read' },
    { id: 2, sender: 'me', text: 'Yes, but it\'s strictly under embargo until tomorrow\'s keynote.', time: '10:45 AM', status: 'read' },
    { id: 3, sender: 'other', text: 'Understood. Let\'s discuss the term sheet in the VIP lounge at 2 PM.', time: '10:48 AM', status: 'read' }
  ]);
  const [inputText, setInputText] = useState('');
  const [keyVerificationOpen, setKeyVerificationOpen] = useState(false);
  const [viewingEncrypted, setViewingEncrypted] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    setMessages([...messages, { 
      id: Date.now(), 
      sender: 'me', 
      text: inputText, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent' 
    }]);
    setInputText('');
  };

  // Simulate what the database sees vs what the user sees
  const generateGibberish = (text) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let gibberish = 'AES256-GCM:';
    for (let i = 0; i < text.length * 2; i++) {
      gibberish += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return gibberish.substring(0, Math.min(gibberish.length, 60)) + '...';
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans p-6 text-slate-200">
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Context */}
        <div className="space-y-6">
          <div className="inline-block bg-emerald-900/50 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
            Signal Protocol Implementation
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            End-to-End <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Encrypted Messaging</span>.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Attract high-profile executives and government officials. Guarantee absolute privacy for VIP networking with client-side encryption. Not even Eventra server admins can read the contents.
          </p>
          
          <div className="pt-4 flex space-x-4">
             <div className="flex-1 bg-slate-800 p-4 rounded-xl border border-slate-700">
               <div className="flex items-center mb-2">
                 <span className="text-emerald-500 text-xl mr-2">🔒</span>
                 <h4 className="font-bold text-white text-sm">Perfect Forward Secrecy</h4>
               </div>
               <p className="text-xs text-slate-400">Keys rotate constantly. Past messages remain secure.</p>
             </div>
             <div className="flex-1 bg-slate-800 p-4 rounded-xl border border-slate-700">
               <div className="flex items-center mb-2">
                 <span className="text-emerald-500 text-xl mr-2">🛡️</span>
                 <h4 className="font-bold text-white text-sm">Zero-Knowledge</h4>
               </div>
               <p className="text-xs text-slate-400">Our databases only store encrypted ciphertexts.</p>
             </div>
          </div>
        </div>

        {/* Right Side: Dual View Simulation */}
        <div className="flex flex-col space-y-6 relative">
          
          {/* Toggle between Client View and Database View */}
          <div className="flex justify-center mb-2">
            <div className="bg-slate-800 p-1 rounded-lg inline-flex">
              <button 
                onClick={() => setViewingEncrypted(false)}
                className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition ${!viewingEncrypted ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Client Device (Decrypted)
              </button>
              <button 
                onClick={() => setViewingEncrypted(true)}
                className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition ${viewingEncrypted ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Eventra Server (Ciphertext)
              </button>
            </div>
          </div>

          {/* App UI Simulation */}
          <div className="w-full max-w-[400px] mx-auto h-[650px] bg-black rounded-[3rem] border-[12px] border-slate-800 shadow-2xl relative flex flex-col overflow-hidden transition-all duration-300">
            
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 pt-10 pb-4 px-6 flex items-center justify-between z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-600 rounded-full flex items-center justify-center text-white font-bold shadow-inner">
                  CM
                </div>
                <div>
                  <h3 className="text-white font-black text-sm">CEO, MegaCorp</h3>
                  <div className="flex items-center mt-0.5 cursor-pointer" onClick={() => setKeyVerificationOpen(!keyVerificationOpen)}>
                    <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest flex items-center">
                      <span className="mr-1">🔒</span> E2E Encrypted
                    </span>
                  </div>
                </div>
              </div>
              <button className="text-slate-500 hover:text-white transition">⋮</button>
            </div>

            {/* Safety Banner */}
            {!viewingEncrypted && (
              <div className="bg-emerald-900/30 border-b border-emerald-900/50 p-2 text-center">
                <p className="text-[10px] text-emerald-400/80 font-bold">Messages and calls are end-to-end encrypted.</p>
              </div>
            )}

            {/* Chat Area */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${viewingEncrypted ? 'bg-slate-950' : 'bg-slate-900'}`}>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm relative group ${
                    viewingEncrypted 
                      ? 'bg-slate-800 border border-red-500/30 text-red-400 font-mono text-[10px] break-all' 
                      : msg.sender === 'me' ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
                  }`}>
                    {viewingEncrypted ? generateGibberish(msg.text) : msg.text}
                    
                    {!viewingEncrypted && (
                      <div className={`text-[9px] mt-1 text-right flex items-center justify-end space-x-1 ${msg.sender === 'me' ? 'text-emerald-200' : 'text-slate-500'}`}>
                        <span>{msg.time}</span>
                        {msg.sender === 'me' && <span>✓✓</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 relative z-10">
              {viewingEncrypted ? (
                <div className="w-full bg-slate-800 border border-slate-700 rounded-full px-4 py-3 flex items-center justify-center opacity-50 cursor-not-allowed">
                  <span className="text-xs text-red-400 font-mono">Input disabled on server view</span>
                </div>
              ) : (
                <form onSubmit={handleSend} className="flex items-center space-x-2">
                  <button type="button" className="text-slate-400 hover:text-white p-2">
                    📎
                  </button>
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Encrypted message..."
                    className="flex-1 bg-slate-800 text-white placeholder-slate-500 border-transparent rounded-full px-4 py-2.5 text-sm focus:bg-slate-700 focus:outline-none transition"
                  />
                  <button 
                    type="submit"
                    disabled={!inputText.trim()}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${inputText.trim() ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-500'}`}
                  >
                    ↑
                  </button>
                </form>
              )}
            </div>

            {/* Key Verification Modal Overlay */}
            {keyVerificationOpen && !viewingEncrypted && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full shadow-2xl">
                  <h3 className="text-white font-black mb-2 text-center text-lg">Verify Security Number</h3>
                  <p className="text-xs text-slate-400 text-center mb-6">Compare these numbers with CEO, MegaCorp to verify your E2EE connection.</p>
                  
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl mb-6">
                     <div className="grid grid-cols-4 gap-y-3 gap-x-2 text-center font-mono text-emerald-400 text-sm font-bold">
                       <span>04183</span><span>99281</span><span>48572</span><span>11094</span>
                       <span>84732</span><span>94812</span><span>33948</span><span>10293</span>
                       <span>58493</span><span>20491</span><span>58473</span><span>92019</span>
                     </div>
                  </div>

                  <button 
                    onClick={() => setKeyVerificationOpen(false)}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default E2EEVIPMessaging;
