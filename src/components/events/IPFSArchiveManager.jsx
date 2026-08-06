import React, { useState } from 'react';

const IPFSArchiveManager = () => {
  const [archiving, setArchiving] = useState(false);
  const [archiveComplete, setArchiveComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cid, setCid] = useState('');

  const filesToArchive = [
    { name: 'Eventra_Summit_26_Ledger.csv', size: '12 MB', type: 'Database' },
    { name: 'Keynote_MainStage_1080p.mp4', size: '4.2 GB', type: 'Video' },
    { name: 'Attendee_Blockchain_Signatures.json', size: '45 MB', type: 'Verification' },
    { name: 'Sponsor_Contract_Agreements.pdf', size: '18 MB', type: 'Legal' }
  ];

  const handleStartArchive = () => {
    setArchiving(true);
    setArchiveComplete(false);
    setProgress(0);

    let currentProgress = 0;
    const interval = setInterval(() => {
      // Slower progress to simulate pinning to IPFS nodes
      currentProgress += Math.floor(Math.random() * 12) + 2; 
      if (currentProgress >= 100) {
        clearInterval(interval);
        setProgress(100);
        
        // Generate a mock IPFS CID (Content Identifier)
        const mockCid = 'Qm' + Array.from({length: 44}, () => '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'[(Math.random() * 58) | 0]).join('');
        
        setTimeout(() => {
          setArchiving(false);
          setArchiveComplete(true);
          setCid(mockCid);
        }, 800);
      } else {
        setProgress(currentProgress);
      }
    }, 500);
  };

  const copyToClipboard = () => {
    // In a real app, write to clipboard. Here we just show a visual flash.
    alert(`Copied CID to clipboard: ${cid}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Context */}
        <div className="space-y-6">
          <div className="inline-block bg-cyan-100 text-cyan-800 border border-cyan-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
            Web3 / Decentralization
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Immutable <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Event Archives</span>.
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            Never lose your historical event data to a centralized cloud provider again. Pin your keynotes, attendee ledgers, and legal contracts directly to the InterPlanetary File System (IPFS) for permanent, tamper-proof storage.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <span className="text-2xl mb-2 text-cyan-500">🛡️</span>
              <h4 className="font-bold text-slate-800 text-sm">Tamper-Proof</h4>
              <p className="text-xs text-slate-500 mt-1">Data is verified via cryptographic hashing.</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <span className="text-2xl mb-2 text-blue-500">🌍</span>
              <h4 className="font-bold text-slate-800 text-sm">Decentralized</h4>
              <p className="text-xs text-slate-500 mt-1">No single point of failure or centralized admin.</p>
            </div>
          </div>
        </div>

        {/* Right Side: IPFS Archiver UI */}
        <div className="flex justify-center">
          
          <div className="w-full bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[650px] relative">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950 flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl font-black text-white flex items-center">
                  <span className="text-cyan-400 mr-2">⬡</span> IPFS Node Manager
                </h2>
                <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">Network: InterPlanetary File System</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-slate-300">Node Online</span>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 flex flex-col space-y-6 overflow-hidden relative z-10">
              
              {/* File List */}
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-4 flex-1 overflow-y-auto">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Payload ready for pinning</h3>
                
                <div className="space-y-3">
                  {filesToArchive.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-800 p-3 rounded-xl border border-slate-700">
                      <div className="flex items-center space-x-3 truncate pr-4">
                        <span className="text-xl">
                          {file.type === 'Video' ? '🎥' : file.type === 'Database' ? '💾' : file.type === 'Legal' ? '📄' : '🔐'}
                        </span>
                        <span className="text-sm font-bold text-slate-200 truncate">{file.name}</span>
                      </div>
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-900/30 px-2 py-1 rounded whitespace-nowrap">{file.size}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Area */}
              <div className="bg-black/40 rounded-2xl p-6 border border-slate-800 relative overflow-hidden">
                
                {/* Background ambient glow */}
                {archiving && <div className="absolute inset-0 bg-cyan-900/20 animate-pulse"></div>}
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  
                  {!archiving && !archiveComplete && (
                    <>
                      <p className="text-sm text-slate-400 mb-6">Total Payload: <span className="font-bold text-white">4.3 GB</span></p>
                      <button 
                        onClick={handleStartArchive}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(8,145,178,0.4)] transition transform hover:-translate-y-1"
                      >
                        Pin to IPFS Network
                      </button>
                    </>
                  )}

                  {archiving && (
                    <div className="w-full py-2">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-cyan-400 font-bold text-sm">Generating Merkle DAG...</span>
                        <span className="text-white font-mono font-bold">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
                        <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                      </div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-4 animate-pulse">
                        Connecting to decentralized peers...
                      </p>
                    </div>
                  )}

                  {archiveComplete && (
                    <div className="w-full animate-fade-in-up">
                      <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 border border-emerald-500/50">✓</div>
                      <h3 className="text-lg font-black text-white mb-2">Pinned Successfully</h3>
                      
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left mt-4">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Content Identifier (CID)</p>
                        <div className="flex items-center justify-between bg-slate-900 p-2 rounded border border-slate-700">
                          <code className="text-xs text-cyan-400 truncate max-w-[200px]">{cid}</code>
                          <button onClick={copyToClipboard} className="text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded text-xs transition">Copy</button>
                        </div>
                      </div>

                      <a href="#" className="inline-block mt-4 text-xs font-bold text-cyan-500 hover:text-cyan-400 transition underline underline-offset-2">
                        View on IPFS Gateway ↗
                      </a>
                    </div>
                  )}

                </div>
              </div>

            </div>

            {/* Simulated background nodes graphic */}
            <div className="absolute inset-0 opacity-5 pointer-events-none z-0">
               <svg width="100%" height="100%">
                 <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
                   <path d="M25 0L50 14.4V43.3L25 57.7L0 43.3V14.4L25 0Z" fill="none" stroke="currentColor" strokeWidth="1" />
                 </pattern>
                 <rect width="100%" height="100%" fill="url(#hexagons)" className="text-cyan-500" />
               </svg>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default IPFSArchiveManager;
