/* eslint-disable */
import React, { useState, useEffect } from 'react';

const Web3ArtistRoyalties = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [streamState, setStreamState] = useState('IDLE'); // IDLE, FINGERPRINTING, STREAMING
  
  // Web3 Metrics
  const [totalCryptoPaid, setTotalCryptoPaid] = useState(14.52); // ETH
  const [activeProducers, setActiveProducers] = useState(0); 
  const [tracksIdentified, setTracksIdentified] = useState(342);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '21:00:00', type: 'SYS', msg: 'Audio Fingerprint DSP Engine Online.' },
    { id: 2, time: '21:00:02', type: 'SYS', msg: 'Awaiting Main Stage Master Out feed.' }
  ]);

  // Visualizer State
  const [currentTrack, setCurrentTrack] = useState(null);
  const [walletTxs, setWalletTxs] = useState([]);
  const [waveform, setWaveform] = useState(Array(30).fill(10));

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (streamState === 'IDLE') {
              // Flatline waveform
              setWaveform(prev => {
                  const val = 10 + (Math.random() * 5);
                  return [...prev.slice(1), val];
              });
          } else if (streamState === 'FINGERPRINTING') {
              // Chaotic scanning waveform
              setWaveform(prev => {
                  const val = 20 + (Math.random() * 60);
                  return [...prev.slice(1), val];
              });
          } else if (streamState === 'STREAMING') {
              // Active music waveform
              setWaveform(prev => {
                  const val = 30 + (Math.sin(Date.now() / 200) * 40) + (Math.random() * 20);
                  return [...prev.slice(1), val];
              });
              
              // Increment ETH slowly
              setTotalCryptoPaid(prev => prev + 0.0001);
              
              // Generate micro-tx UI elements
              if (Math.random() > 0.8) {
                  setWalletTxs(prev => [{
                      id: Date.now(),
                      amount: '0.0001 ETH',
                      to: currentTrack?.wallet || '0x...'
                  }, ...prev].slice(0, 5));
              }
          }

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, streamState, currentTrack]);

  const triggerEvent = (type) => {
    if (!systemActive || streamState !== 'IDLE') return;
    
    if (type === 'IDENTIFY') {
        setStreamState('FINGERPRINTING');
        addLog('ACTION', 'Master Out transient detected. Initiating DSP Audio Fingerprinting.');
        
        setTimeout(() => {
            const track = {
                title: 'Neon Underground (Original Mix)',
                artist: 'DJ Unknown',
                wallet: '0x7F4A...B921',
                proShare: '60%'
            };
            setCurrentTrack(track);
            setActiveProducers(1);
            setTracksIdentified(prev => prev + 1);
            setStreamState('STREAMING');
            
            addLog('SUCCESS', `Match Found: ${track.title} by ${track.artist}.`);
            addLog('SYS', `Opening Web3 payment channel to wallet ${track.wallet}.`);
            addLog('ETH', 'Streaming 0.0001 ETH per second to original producer.');
            
            // Auto-stop track after 5 seconds for demo
            setTimeout(() => {
                if (systemActive) {
                    setStreamState('IDLE');
                    setCurrentTrack(null);
                    setActiveProducers(0);
                    addLog('WARN', 'Track transition detected. Closing payment channel.');
                }
            }, 5000);
            
        }, 2000);
    }
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setStreamState('IDLE');
      setCurrentTrack(null);
      setWalletTxs([]);
      addLog('SYS', 'Smart Contract Royalties System linked to Main Stage feed.');
    } else {
      setSystemActive(false);
      setStreamState('IDLE');
      setCurrentTrack(null);
      setWalletTxs([]);
      setActiveProducers(0);
      addLog('WARN', 'Web3 System Offline. Reverting to manual PRO reporting.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#05040a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-amber-900/40 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎵</span> Decentralized Finance
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Blockchain-Verified Artist <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">Royalty Micro-Payments</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            DJs frequently play remixes or tracks produced by smaller, underground artists, but those original producers never receive royalties or credit for their music being played to 50,000 people. Eventra solves this by integrating audio-fingerprinting (similar to Shazam) into the main stage's master output feed. When Eventra identifies a track, it automatically triggers a Web3 smart contract that streams fractional cryptocurrency micro-payments directly to the original producer's wallet for every second their song is played live.
          </p>

          <div className="bg-[#0f0a14] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-amber-500 text-lg mr-2">💎</span> Royalty Smart Contract
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-amber-600 hover:bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Disconnect Wallet RPC' : 'Initialize Web3 Engine'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Total Crypto Paid */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 streamState === 'STREAMING' ? 'bg-amber-950/40 border-amber-500/50 shadow-inner' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Total Volume (ETH)
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     streamState === 'STREAMING' ? 'text-amber-400' :
                     systemActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {totalCryptoPaid.toFixed(4)}
                   </span>
                 </div>
               </div>

               {/* Active Producers */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 streamState === 'STREAMING' ? 'bg-indigo-950/40 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Active Channels
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     streamState === 'STREAMING' ? 'text-indigo-400' :
                     systemActive ? 'text-indigo-500' : 'text-slate-600'
                   }`}>
                     {activeProducers}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Wallets</span>
                 </div>
               </div>
               
               {/* Tracks Identified */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Tracks Identified
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     systemActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {tracksIdentified}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050308] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>DSP & Web3 Telemetry Log</span>
                 {streamState === 'FINGERPRINTING' && <span className="text-indigo-400 animate-pulse">ANALYZING AUDIO...</span>}
                 {streamState === 'STREAMING' && <span className="text-amber-400 font-black animate-pulse">TX CHANNEL OPEN</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-indigo-400 font-bold' :
                       log.type === 'ETH' ? 'text-amber-400 font-bold' : 'text-slate-400'
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
            
            {/* Audio / Web3 Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-500 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#0a0814]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none bg-black/60 border-b border-white/5 flex justify-between backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-amber-400">DSP FINGERPRINTING</span>
                <span className="text-[8px] font-mono text-slate-400">WEB3 MICRO-TX</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col pt-12 z-20">
                
                {!systemActive ? (
                   <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">SMART CONTRACT OFFLINE</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative flex flex-col">
                      
                      {/* Audio Waveform Viz */}
                      <div className="h-32 bg-black/50 border-b border-slate-800 px-4 flex flex-col justify-center relative">
                          <span className="absolute top-2 left-4 text-[7px] font-mono text-slate-500">MASTER OUT FEED (LIVE)</span>
                          
                          <div className="w-full h-16 flex items-end justify-between space-x-1 mt-4">
                              {waveform.map((val, i) => (
                                  <div 
                                      key={i} 
                                      className={`w-full rounded-t-sm transition-all duration-75 ${
                                          streamState === 'FINGERPRINTING' ? 'bg-indigo-500 shadow-[0_0_5px_rgba(99,102,241,0.5)]' :
                                          streamState === 'STREAMING' ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-slate-700'
                                      }`}
                                      style={{ height: `${val}%` }}
                                  ></div>
                              ))}
                          </div>
                          
                          {/* Fingerprint Scanning Reticle */}
                          {streamState === 'FINGERPRINTING' && (
                              <div className="absolute inset-x-0 top-0 h-full border-2 border-indigo-500 border-dashed opacity-50 animate-[scan_1s_ease-in-out_infinite]"></div>
                          )}
                      </div>

                      {/* Track Metadata & Web3 Connection */}
                      <div className="flex-1 p-4 flex flex-col">
                          
                          {streamState === 'IDLE' && (
                              <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                                  <div className="w-12 h-12 rounded-full border border-slate-700 mb-2"></div>
                                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Listening for Track...</span>
                              </div>
                          )}

                          {streamState === 'FINGERPRINTING' && (
                              <div className="flex-1 flex flex-col items-center justify-center">
                                  <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mb-2"></div>
                                  <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">Querying Hash DB...</span>
                              </div>
                          )}

                          {streamState === 'STREAMING' && currentTrack && (
                              <>
                                  {/* Track Info */}
                                  <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 mb-4 flex items-center shadow-lg">
                                      <div className="w-10 h-10 bg-indigo-900 rounded border border-indigo-500 flex items-center justify-center mr-3 shrink-0 text-lg">
                                          💿
                                      </div>
                                      <div className="flex-1 overflow-hidden">
                                          <h4 className="text-[12px] font-bold text-white truncate">{currentTrack.title}</h4>
                                          <span className="text-[9px] text-slate-400 truncate block">{currentTrack.artist}</span>
                                      </div>
                                      <div className="ml-2 text-right">
                                          <span className="text-[7px] font-mono text-emerald-500 block uppercase">MATCHED</span>
                                          <span className="text-[9px] font-black text-amber-400">{currentTrack.proShare} Share</span>
                                      </div>
                                  </div>

                                  {/* Web3 TX Stream */}
                                  <div className="flex-1 bg-black/60 border border-slate-800 rounded p-2 overflow-hidden relative">
                                      <span className="text-[7px] font-mono text-slate-500 block mb-2 border-b border-slate-800 pb-1">LIVE SMART CONTRACT TRANSACTIONS</span>
                                      
                                      <div className="space-y-1.5 overflow-hidden">
                                          {walletTxs.map(tx => (
                                              <div key={tx.id} className="flex justify-between items-center bg-slate-900/50 p-1.5 rounded animate-fade-in-up border-l-2 border-amber-500">
                                                  <div className="flex items-center">
                                                      <span className="text-[10px] mr-2">⛓️</span>
                                                      <span className="text-[8px] font-mono text-slate-400">To: {tx.to}</span>
                                                  </div>
                                                  <span className="text-[9px] font-black text-amber-400">+{tx.amount}</span>
                                              </div>
                                          ))}
                                      </div>
                                      
                                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>
                                  </div>
                              </>
                          )}

                      </div>

                  </div>
                )}
                
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes scan {
                        0%, 100% { opacity: 0; transform: scaleY(0.9); }
                        50% { opacity: 0.5; transform: scaleY(1); }
                    }
                `}} />

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#0f0a14] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Stage Audio</span>
               
               <div className="grid grid-cols-1 gap-2">
                 <button 
                   onClick={() => triggerEvent('IDENTIFY')}
                   disabled={!systemActive || streamState !== 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !systemActive || streamState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-amber-950/40 border-amber-600 text-amber-400 hover:bg-amber-900/60 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                   }`}
                 >
                   DJ Plays Unknown Remix (Trigger DSP)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default Web3ArtistRoyalties;
