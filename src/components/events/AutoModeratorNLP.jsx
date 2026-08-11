import React, { useState, useEffect } from 'react';

const AutoModeratorNLP = () => {
  const [messages, setMessages] = useState([
    { id: 1, user: 'AlexM', text: 'Great keynote so far!', status: 'approved', score: 0.02 },
    { id: 2, user: 'SarahJ', text: 'Where can I find the slides?', status: 'approved', score: 0.05 },
    { id: 3, user: 'TechBro99', text: 'Wow, what a totally useless presentation.', status: 'approved', score: 0.45 }
  ]);
  const [moderatorLog, setModeratorLog] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const offensiveMessages = [
    { text: 'This speaker is an absolute idiot and should be fired.', type: 'Harassment', score: 0.94 },
    { text: 'Buy cheap crypto at totallynotascam.com!!', type: 'Spam/Phishing', score: 0.98 },
    { text: 'You are all sheep, wake up you stupid losers.', type: 'Hate Speech', score: 0.91 }
  ];

  const simulateIncomingAttack = () => {
    setIsSimulating(true);
    let delay = 0;

    offensiveMessages.forEach((offense, index) => {
      delay += 1500;
      setTimeout(() => {
        const msgId = Date.now() + index;
        
        // 1. Add to chat temporarily (Shadow Ban state - only sender sees it in a real app)
        setMessages(prev => [...prev, { 
          id: msgId, 
          user: `Troll_${Math.floor(Math.random() * 1000)}`, 
          text: offense.text, 
          status: 'shadow_banned',
          score: offense.score
        }]);

        // 2. Add to Mod Log
        setModeratorLog(prev => [{
          id: msgId,
          user: `Troll_${Math.floor(Math.random() * 1000)}`,
          text: offense.text,
          type: offense.type,
          score: (offense.score * 100).toFixed(1) + '%'
        }, ...prev]);

      }, delay);
    });

    setTimeout(() => {
      setIsSimulating(false);
    }, delay + 1000);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans text-slate-200 p-6 overflow-hidden">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-rose-900/50 text-rose-400 border border-rose-500/30 text-[10px] font-bold uppercase px-3 py-1 rounded-full">
                Trust & Safety
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight">Auto-Moderator NLP</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-2xl">
              Ensure brand safety and an inclusive environment. Our background NLP engine scans thousands of messages per minute, instantly shadow-banning harassment, hate speech, and spam before it reaches the main chat.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
             <button 
               onClick={simulateIncomingAttack}
               disabled={isSimulating}
               className={`px-6 py-3 rounded-xl text-sm font-bold transition flex items-center shadow-lg ${isSimulating ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/50'}`}
             >
               {isSimulating ? 'Analyzing Stream...' : 'Simulate Troll Attack 🚨'}
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: Public Live Chat */}
        <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl flex flex-col h-[550px] relative overflow-hidden">
          
          <div className="bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center z-10">
            <h3 className="text-white font-bold flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
              Public Live Chat
            </h3>
            <span className="text-xs text-slate-500 font-mono">14,204 watching</span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto flex flex-col justify-end space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col animate-fade-in-up ${msg.status === 'shadow_banned' ? 'opacity-30 grayscale' : ''}`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`font-bold text-xs ${msg.status === 'shadow_banned' ? 'text-rose-500' : 'text-blue-400'}`}>{msg.user}</span>
                  {msg.status === 'shadow_banned' && (
                    <span className="text-[9px] bg-rose-900/50 text-rose-400 px-1.5 rounded uppercase tracking-widest border border-rose-500/30">Shadow Banned</span>
                  )}
                </div>
                <p className={`text-sm ${msg.status === 'shadow_banned' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                  {msg.text}
                </p>
              </div>
            ))}
          </div>
          
          {/* Mock Chat Input */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 z-10">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-500 text-sm">
              Chat is paused during simulation...
            </div>
          </div>
        </div>

        {/* Right Side: Admin Moderation Dashboard */}
        <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl flex flex-col h-[550px]">
          
          <div className="p-6 border-b border-slate-700 flex justify-between items-center">
             <div className="flex items-center space-x-3">
               <span className="text-2xl">🛡️</span>
               <div>
                 <h2 className="text-lg font-black text-white">Trust & Safety NLP Log</h2>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Admin Action Required</p>
               </div>
             </div>
             <div className="bg-rose-900/30 border border-rose-500/50 px-3 py-1 rounded text-rose-400 text-xs font-mono">
               {moderatorLog.length} Flagged
             </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto bg-slate-900/50">
            
            {moderatorLog.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30">
                <span className="text-4xl mb-4">✨</span>
                <p className="text-white font-bold">Chat is clean.</p>
                <p className="text-xs text-slate-400 mt-2">NLP Engine monitoring 0.05s latency.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {moderatorLog.map((log) => (
                  <div key={log.id} className="bg-slate-800 border border-rose-900 rounded-2xl p-4 shadow-lg animate-fade-in-up">
                    
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="bg-rose-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-sm">
                          {log.type}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">Confidence: {log.score}</span>
                      </div>
                      <span className="text-xs text-slate-500">Just now</span>
                    </div>

                    <p className="text-white font-medium text-sm mb-4 bg-slate-900 p-3 rounded-xl border border-slate-700">
                      "{log.text}"
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-[10px] text-white">
                          {log.user.substring(0, 1)}
                        </div>
                        <span className="text-xs text-slate-300 font-bold">{log.user}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold px-3 py-1.5 rounded transition">
                          Approve
                        </button>
                        <button className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-3 py-1.5 rounded transition shadow-md">
                          Ban IP Address
                        </button>
                      </div>
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

export default AutoModeratorNLP;
