import React, { useState } from 'react';

const ARScavengerHunt = () => {
  const [arActive, setArActive] = useState(false);
  const [tokensCollected, setTokensCollected] = useState(0);
  const [totalScore, setTotalScore] = useState(150);
  
  const [activeToken, setActiveToken] = useState(null);

  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, name: 'Alex C.', score: 2450 },
    { rank: 2, name: 'Maria S.', score: 2100 },
    { rank: 3, name: 'You', score: 150 },
    { rank: 4, name: 'David T.', score: 100 }
  ]);

  const simulateCameraScan = () => {
    setArActive(true);
    
    // Simulate finding a high-value token in a "dead zone"
    setTimeout(() => {
      setActiveToken({
        id: 'token_99',
        type: 'Gold Ethereum Coin',
        value: 500,
        location: 'Hall C (Obscure Corner)'
      });
    }, 2000);
  };

  const collectToken = () => {
    if (!activeToken) return;
    
    const pointsEarned = activeToken.value;
    
    // Animate UI collection
    setActiveToken(null);
    setTokensCollected(prev => prev + 1);
    
    // Update score
    setTimeout(() => {
      setTotalScore(prev => prev + pointsEarned);
      
      // Update leaderboard playfully
      setLeaderboard(prev => {
        const newBoard = [...prev];
        const youIndex = newBoard.findIndex(p => p.name === 'You');
        newBoard[youIndex].score += pointsEarned;
        
        // Re-sort
        return newBoard.sort((a, b) => b.score - a.score).map((p, i) => ({...p, rank: i + 1}));
      });
      
      setTimeout(() => {
        setArActive(false);
      }, 1500);
      
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans p-6 text-slate-200">
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Context & Leaderboard (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-pink-900/50 text-pink-400 border border-pink-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎮</span> WebXR Gamification
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Spatial Web AR <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Scavenger Hunt</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Solve the #1 B2B vendor complaint: low foot traffic in obscure hall corners. Organizers drop virtual 3D tokens via Eventra's WebXR framework. Attendees use their smartphone cameras to "see" and collect tokens, with high-value points intentionally placed in low-traffic areas to gamify foot traffic distribution.
          </p>

          <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Global Leaderboard</h3>
               <span className="bg-pink-900/30 text-pink-500 text-[10px] font-black uppercase px-2 py-1 rounded border border-pink-500/30">
                 Prize: VIP Afterparty Pass
               </span>
             </div>
             
             <div className="space-y-3">
               {leaderboard.map(player => (
                 <div key={player.name} className={`p-4 rounded-xl flex items-center justify-between transition-all ${
                   player.name === 'You' ? 'bg-gradient-to-r from-pink-900/40 to-purple-900/40 border border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.15)]' : 'bg-slate-900 border border-slate-800'
                 }`}>
                   <div className="flex items-center space-x-4">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${
                       player.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' : 
                       player.rank === 2 ? 'bg-slate-400/20 text-slate-400' :
                       player.rank === 3 ? 'bg-amber-700/20 text-amber-600' : 'bg-slate-800 text-slate-500'
                     }`}>
                       #{player.rank}
                     </div>
                     <span className={`font-bold ${player.name === 'You' ? 'text-white' : 'text-slate-300'}`}>{player.name}</span>
                   </div>
                   <div className="text-right">
                     <span className={`text-xl font-black font-mono ${player.name === 'You' ? 'text-pink-400' : 'text-slate-400'}`}>
                       {player.score.toLocaleString()}
                     </span>
                     <span className="text-[9px] text-slate-500 uppercase tracking-widest ml-1">PTS</span>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Right Side: Mobile AR Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center">
          
          <div className="w-full max-w-[360px] bg-black rounded-[3rem] border-[12px] border-slate-800 shadow-2xl relative flex flex-col h-[700px] overflow-hidden">
            
            {/* Status Bar */}
            <div className="absolute top-0 inset-x-0 h-10 flex justify-between items-center px-6 text-white text-xs font-bold z-30 drop-shadow-md">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            {/* Mobile App View */}
            <div className="flex-1 flex flex-col relative">
              
              {!arActive ? (
                // Standard App State
                <div className="flex-1 bg-slate-950 p-6 flex flex-col pt-16">
                  
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-tr from-pink-600 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(236,72,153,0.4)]">
                      <span className="text-4xl">💎</span>
                    </div>
                    <h2 className="text-2xl font-black text-white">Eventra Hunt</h2>
                    <p className="text-slate-400 text-xs mt-2">Find virtual tokens hidden in dead zones to win prizes.</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 flex justify-between items-center">
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest">Your Score</span>
                      <span className="block text-3xl font-black text-white">{totalScore}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest">Found</span>
                      <span className="block text-3xl font-black text-white">{tokensCollected}</span>
                    </div>
                  </div>

                  <button 
                    onClick={simulateCameraScan}
                    className="mt-auto w-full bg-white hover:bg-slate-200 text-black font-black py-4 rounded-2xl transition shadow-xl flex items-center justify-center space-x-2"
                  >
                    <span className="text-xl">📷</span>
                    <span>Launch AR Camera</span>
                  </button>
                </div>
              ) : (
                // AR Camera Active State
                <div className="flex-1 relative bg-black flex flex-col">
                  
                  {/* Simulated Camera Feed Background */}
                  <div className="absolute inset-0 z-0">
                    <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-80"></div>
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
                  </div>
                  
                  {/* WebXR Target Reticle */}
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="w-64 h-64 border-2 border-white/30 rounded-[3rem] flex items-center justify-center relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white/80 rounded-tl-[3rem]"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white/80 rounded-tr-[3rem]"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white/80 rounded-bl-[3rem]"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white/80 rounded-br-[3rem]"></div>
                      
                      {!activeToken && (
                        <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
                      )}
                    </div>
                  </div>

                  {/* UI Overlays */}
                  <div className="absolute top-12 left-0 right-0 p-6 z-20 flex justify-between items-center animate-fade-in">
                    <button onClick={() => setArActive(false)} className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full text-white flex items-center justify-center border border-white/10">✕</button>
                    <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                      <span className="text-white font-bold text-sm">{totalScore} PTS</span>
                    </div>
                  </div>

                  {/* Active 3D Token */}
                  {activeToken && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 animate-fade-in">
                      
                      {/* Fake 3D Object */}
                      <div className="w-32 h-32 relative mb-8 animate-[bounce_2s_infinite]">
                        <div className="absolute inset-0 bg-yellow-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-600 to-yellow-300 rounded-full border-4 border-yellow-200 shadow-2xl flex items-center justify-center">
                          <span className="text-4xl transform -rotate-12">💎</span>
                        </div>
                      </div>
                      
                      {/* Info & Collect Button */}
                      <div className="bg-black/70 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center mx-6 shadow-2xl animate-fade-in-up">
                        <span className="bg-pink-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block">
                          Rare Discovery!
                        </span>
                        <h3 className="text-xl font-black text-white mb-1">{activeToken.type}</h3>
                        <p className="text-slate-300 text-xs mb-4">Found in: {activeToken.location}</p>
                        
                        <button 
                          onClick={collectToken}
                          className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(236,72,153,0.5)] transform transition active:scale-95"
                        >
                          Collect +{activeToken.value} Pts
                        </button>
                      </div>
                    </div>
                  )}

                  {!activeToken && (
                    <div className="absolute bottom-10 inset-x-0 text-center z-20 animate-fade-in">
                      <span className="bg-black/60 backdrop-blur-md text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-white/10">
                        Scanning Environment...
                      </span>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ARScavengerHunt;
