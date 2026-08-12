import React, { useState, useEffect } from 'react';

const CrossLingualNetworking = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Kenji', original: 'こんにちは。あなたのAIスタートアップに関する講演、とても素晴らしかったです。', translated: 'Hello. Your presentation on your AI startup was absolutely wonderful.', type: 'received', lang: 'ja' },
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  
  // NLP Telemetry state
  const [nlpLog, setNlpLog] = useState([
    { time: '14:20:01', event: 'Match created: 94% Professional Synergy.' },
    { time: '14:20:05', event: 'Translation pipeline active: [EN] <-> [JA]' }
  ]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Simulate sending message (English)
    const newMsg = {
      id: Date.now(),
      sender: 'You',
      original: inputText,
      translated: '...', // We don't need to show the JP translation to the EN user, but we'll show a loading state
      type: 'sent',
      lang: 'en'
    };
    
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setIsTranslating(true);
    addLog(`Ingesting EN string: "${newMsg.original.substring(0, 15)}..."`);

    // Simulate NLP Translation processing delay
    setTimeout(() => {
      addLog('Translating EN -> JA (Latency: 142ms)');
      setIsTranslating(false);
      
      // Simulate Kenji's response based on a hardcoded flow for demo purposes
      setTimeout(() => {
        const responseText = "ありがとうございます！今後、APIの統合についてお話しする機会があれば嬉しいです。";
        const translatedResponse = "Thank you! I would be glad to have the opportunity to discuss API integration with you in the future.";
        
        addLog(`Ingesting JA string. Translating JA -> EN (Latency: 118ms)`);
        
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'Kenji',
          original: responseText,
          translated: translatedResponse,
          type: 'received',
          lang: 'ja'
        }]);
      }, 2500);
      
    }, 800);
  };

  const handleIcebreakerSelect = (text) => {
    setInputText(text);
  };

  const addLog = (msg) => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setNlpLog(prev => [{ time: timeString, event: msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Context & Engineering Console (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🧠</span> Natural Language Processing
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Cross-Lingual Real-Time <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Networking Matchmaker</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Incredible networking opportunities at global summits are lost simply because attendees don't share a common language. Eventra utilizes AI to pair attendees based entirely on professional synergy. When users open their chat, an advanced NLP engine automatically translates messages in real-time between their native languages, breaking down global barriers completely.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
               <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center">
                 <span className="text-indigo-500 text-lg mr-2">⚙️</span> Translation Engine Telemetry
               </h3>
               <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-1 rounded text-[10px] font-mono flex items-center shadow-sm">
                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span> LATENCY: 142ms
               </span>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-center">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Active Linguistic Pair</span>
                 <div className="flex items-center space-x-3 text-lg font-black text-slate-800">
                   <span className="flex items-center"><span className="text-2xl mr-1">🇺🇸</span> EN</span>
                   <span className="text-indigo-400">⟷</span>
                   <span className="flex items-center"><span className="text-2xl mr-1">🇯🇵</span> JA</span>
                 </div>
               </div>

               <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-center">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Professional Synergy Score</span>
                 <span className="text-3xl font-black text-indigo-600 font-mono">
                   94.2<span className="text-sm">%</span>
                 </span>
               </div>

             </div>

             <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">Live NLP Pipeline</span>
               
               <div className="flex-1 overflow-y-auto space-y-2 text-slate-400 pr-2">
                 {nlpLog.map((log, i) => (
                   <div key={i} className="flex justify-between items-start animate-fade-in-up">
                     <div>
                       <span className="text-indigo-500 font-bold mr-2">&gt;</span>
                       <span className="text-slate-300">{log.event}</span>
                     </div>
                     <span className="text-slate-600 shrink-0">{log.time}</span>
                   </div>
                 ))}
                 {isTranslating && (
                   <div className="flex items-start animate-pulse">
                     <span className="text-purple-500 font-bold mr-2">&gt;</span>
                     <span className="text-purple-300">Processing neural machine translation...</span>
                   </div>
                 )}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Mobile Chat App Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-white rounded-[3rem] border-[12px] border-slate-900 shadow-2xl relative flex flex-col h-[700px] overflow-hidden font-sans">
            
            {/* iOS Header */}
            <div className="h-10 flex justify-between items-center px-6 text-slate-800 text-xs font-bold z-20 bg-white">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            {/* Match Header */}
            <div className="p-4 bg-white flex flex-col items-center border-b border-slate-100 z-10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10 text-6xl transform translate-x-4 -translate-y-4">🇯🇵</div>
              <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-white shadow-md flex items-center justify-center font-bold text-slate-500 mb-2 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Kenji" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-slate-900 font-black text-lg leading-tight">Kenji Sato</h2>
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-1">CTO, NeuralTech Tokyo</p>
              
              <div className="mt-3 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 flex items-center">
                 <span className="text-indigo-600 text-[10px] font-bold">Auto-Translating: Japanese</span>
                 <span className="ml-2 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 flex flex-col">
              
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col max-w-[85%] ${msg.type === 'sent' ? 'self-end items-end' : 'self-start items-start'}`}>
                  <div className={`p-3 rounded-2xl text-sm shadow-sm relative group ${
                    msg.type === 'sent' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'
                  }`}>
                    {/* The Translated Text (Main reading view) */}
                    <p>{msg.type === 'received' ? msg.translated : msg.original}</p>
                    
                    {/* Original Native Text (Small, above or below) */}
                    {msg.type === 'received' && (
                      <p className="text-[9px] text-slate-400 mt-2 pt-2 border-t border-slate-100 font-sans leading-relaxed">
                        {msg.original}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1 mt-1 px-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">
                      {msg.type === 'sent' && isTranslating ? 'Translating...' : 'Delivered'}
                    </span>
                  </div>
                </div>
              ))}
              
              {/* Culturally Localized Ice Breakers */}
              {messages.length === 1 && (
                <div className="mt-8 animate-fade-in-up">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 text-center">AI Ice Breaker Suggestions</span>
                  <div className="space-y-2">
                    <button 
                      onClick={() => handleIcebreakerSelect("I'd love to learn more about NeuralTech's vision.")}
                      className="w-full bg-white border border-indigo-200 text-indigo-700 text-xs py-2 px-4 rounded-full shadow-sm hover:bg-indigo-50 transition text-left"
                    >
                      "I'd love to learn more about NeuralTech's vision."
                    </button>
                    <button 
                      onClick={() => handleIcebreakerSelect("Will you be attending the networking dinner tonight?")}
                      className="w-full bg-white border border-indigo-200 text-indigo-700 text-xs py-2 px-4 rounded-full shadow-sm hover:bg-indigo-50 transition text-left"
                    >
                      "Will you be attending the networking dinner tonight?"
                    </button>
                  </div>
                </div>
              )}
              
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200 z-10 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
              <form onSubmit={sendMessage} className="flex space-x-2">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type in English..."
                  disabled={isTranslating}
                  className="flex-1 bg-slate-100 border-none text-slate-800 text-sm rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim() || isTranslating}
                  className="w-11 h-11 rounded-full flex items-center justify-center transition disabled:opacity-50 bg-indigo-600 hover:bg-indigo-500 text-white shadow-md"
                >
                  <span className="text-xl -mt-1">↑</span>
                </button>
              </form>
              <div className="text-center mt-2">
                <span className="text-[8px] text-slate-400 uppercase font-bold tracking-widest">Translating to: Japanese</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default CrossLingualNetworking;
