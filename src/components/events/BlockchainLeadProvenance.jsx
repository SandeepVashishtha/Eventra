import React, { useState } from 'react';

const BlockchainLeadProvenance = () => {
  const [networkState, setNetworkState] = useState('idle'); // idle, scanning, minting, verified
  
  const [leads, setLeads] = useState([
    { id: 'usr_942', name: 'Alex M.', company: 'Stripe', role: 'VP Engineering', time: '10:14 AM', hash: '0x8f2a...4b9c', verified: true },
    { id: 'usr_118', name: 'Sarah J.', company: 'Vercel', role: 'DevRel', time: '10:42 AM', hash: '0x3c9d...1f2e', verified: true },
    { id: 'usr_773', name: 'Michael T.', company: 'Google', role: 'Product', time: '11:05 AM', hash: '0x7e5b...9a8d', verified: true }
  ]);
  
  const [newScanData, setNewScanData] = useState(null);

  const simulateBadgeScan = () => {
    setNetworkState('scanning');
    
    setTimeout(() => {
      setNetworkState('minting');
      
      const newLead = {
        id: `usr_${Math.floor(Math.random() * 900) + 100}`,
        name: 'Jane Doe',
        company: 'Acme Corp',
        role: 'Director of IT',
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        hash: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`,
        verified: false
      };
      
      setNewScanData(newLead);
      
      setTimeout(() => {
        setNetworkState('verified');
        newLead.verified = true;
        setLeads(prev => [newLead, ...prev]);
        
        setTimeout(() => {
          setNetworkState('idle');
          setNewScanData(null);
        }, 3000);
        
      }, 2500);
      
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context & Tech Specs (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔗</span> Web3 Trust Infrastructure
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Blockchain Lead <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Provenance Ledger</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Exhibitors fundamentally distrust CSV lead lists because event organizers frequently inject "cold" data to artificially inflate ROI metrics. Eventra writes every physical badge scan interaction directly to a private, lightweight blockchain ledger. Exhibitors receive cryptographic proof-of-interaction for every contact, guaranteeing it was a real, physical interaction at their booth.
          </p>

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col">
             
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">⛓️</span> Private Consortium Node
               </h3>
               <span className="bg-emerald-900/50 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded text-[10px] font-mono">STATUS: SYNCED</span>
             </div>

             <div className="mb-6 bg-black p-4 rounded-xl border border-slate-800 flex justify-between items-center">
               <div>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Contract Address</span>
                 <span className="text-xs text-blue-400 font-mono">0x4b2c...e89f (Eventra_Leads_V1)</span>
               </div>
               <div className="text-right">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Total Minted Interactions</span>
                 <span className="text-lg font-black text-white font-mono">24,892</span>
               </div>
             </div>

             {/* Live Ledger Visualization */}
             <div className="flex-1 bg-black rounded-xl border border-slate-800 p-4 overflow-hidden relative">
               <span className="text-slate-500 uppercase font-bold tracking-widest text-[10px] block mb-4 border-b border-slate-800 pb-2">Live Consensus Log</span>
               
               <div className="space-y-2 font-mono text-[10px]">
                 
                 {networkState === 'scanning' && (
                   <div className="text-amber-400 animate-fade-in-up">
                     &gt; Awaiting payload from Booth_Scanner_42...
                   </div>
                 )}
                 
                 {networkState === 'minting' && (
                   <div className="text-sky-400">
                     <p>&gt; Encrypting payload (Timestamp + BoothID + AttendeePub)...</p>
                     <p className="animate-pulse text-indigo-400 mt-1">&gt; Minting cryptographic proof to Ledger...</p>
                   </div>
                 )}
                 
                 {networkState === 'verified' && (
                   <div className="text-emerald-400 mb-4 animate-fade-in-up">
                     <p>&gt; Transaction Confirmed. Block hash generated.</p>
                     <p className="font-bold text-white mt-1 bg-emerald-900/30 px-2 py-1 rounded border border-emerald-500/30">
                       ✓ {newScanData?.hash}
                     </p>
                   </div>
                 )}

                 <div className="text-slate-600 opacity-50 space-y-1 pt-2">
                   <p>&gt; Block #14892 validated by Node_2.</p>
                   <p>&gt; Block #14891 validated by Node_4.</p>
                   <p>&gt; Block #14890 validated by Node_1.</p>
                 </div>

               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Exhibitor App Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center">
          
          <div className="w-full max-w-[360px] bg-white rounded-[3rem] border-[12px] border-slate-900 shadow-2xl relative flex flex-col h-[700px] overflow-hidden">
            
            {/* iOS Header */}
            <div className="h-10 flex justify-between items-center px-6 text-slate-900 text-xs font-bold bg-white z-20">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            {/* App Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl font-black text-slate-900">Lead Retrieval</h2>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Booth 402</span>
              </div>
              <button 
                onClick={simulateBadgeScan}
                disabled={networkState !== 'idle'}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition shadow-lg ${
                  networkState !== 'idle' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-105'
                }`}
              >
                📷
              </button>
            </div>

            {/* Mobile Content */}
            <div className="flex-1 bg-slate-50 flex flex-col relative overflow-hidden">
              
              <div className="p-4 overflow-y-auto space-y-3 pb-24">
                
                {/* Simulated New Scan Overlay */}
                {(networkState === 'scanning' || networkState === 'minting') && (
                  <div className="bg-white rounded-2xl shadow-md border-2 border-blue-500 p-4 mb-4 animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-50 opacity-50"></div>
                    <div className="relative z-10 flex justify-center items-center h-16">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-2"></div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                          {networkState === 'scanning' ? 'Reading NFC Badge...' : 'Cryptographic Minting...'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lead List */}
                {leads.map(lead => (
                  <div key={lead.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">{lead.name}</h4>
                        <span className="text-[10px] text-slate-500">{lead.role}, {lead.company}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{lead.time}</span>
                    </div>
                    
                    <div className="bg-slate-50 p-2 rounded border border-slate-100 flex justify-between items-center mt-3">
                      <div className="flex items-center space-x-1 text-[8px] font-mono text-slate-500">
                        <span>TX:</span>
                        <span className="text-blue-500 font-bold">{lead.hash}</span>
                      </div>
                      {lead.verified && (
                        <div className="flex items-center text-[8px] font-bold text-emerald-600 uppercase">
                          <span className="mr-1">✓</span> Verified
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Floating Download Button */}
              <div className="absolute bottom-6 inset-x-6 z-20">
                <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition shadow-xl flex items-center justify-center">
                  <span className="mr-2">📥</span> Download CSV (with Proofs)
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default BlockchainLeadProvenance;
