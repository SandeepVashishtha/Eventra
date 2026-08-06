import React, { useState } from 'react';

const DIDReputationSystem = () => {
  const [verifying, setVerifying] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  const [activeProfile, setActiveProfile] = useState({
    name: 'Alice Chang',
    did: 'did:ethr:0x4f8a...9c21',
    trustScore: 92,
    attendanceRate: '98%',
    communityVouches: 45,
    history: [
      { event: 'EthGlobal SF 2025', status: 'Attended', points: '+5' },
      { event: 'React Summit', status: 'Speaker', points: '+15' },
      { event: 'Local Hack Day', status: 'Attended', points: '+2' }
    ]
  });

  const handleVerify = (threshold) => {
    setVerifying(true);
    setAccessGranted(false);
    setAccessDenied(false);

    setTimeout(() => {
      setVerifying(false);
      if (activeProfile.trustScore >= threshold) {
        setAccessGranted(true);
      } else {
        setAccessDenied(true);
      }
    }, 1500);
  };

  const loadBadActor = () => {
    setActiveProfile({
      name: 'User_4920',
      did: 'did:ethr:0x1b2c...8a4f',
      trustScore: 34,
      attendanceRate: '45%',
      communityVouches: 2,
      history: [
        { event: 'AI Hackathon', status: 'No-Show', points: '-10' },
        { event: 'DevRel Meetup', status: 'No-Show', points: '-10' },
        { event: 'Web3 Builders', status: 'Attended', points: '+2' }
      ]
    });
    setAccessGranted(false);
    setAccessDenied(false);
  };

  const loadGoodActor = () => {
    setActiveProfile({
      name: 'Alice Chang',
      did: 'did:ethr:0x4f8a...9c21',
      trustScore: 92,
      attendanceRate: '98%',
      communityVouches: 45,
      history: [
        { event: 'EthGlobal SF 2025', status: 'Attended', points: '+5' },
        { event: 'React Summit', status: 'Speaker', points: '+15' },
        { event: 'Local Hack Day', status: 'Attended', points: '+2' }
      ]
    });
    setAccessGranted(false);
    setAccessDenied(false);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center text-white">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase px-2 py-1 rounded border border-indigo-500/30">W3C Verifiable Credentials</span>
              <h1 className="text-3xl font-black text-white">DID Attendee Reputation</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">Create high-trust events. Eliminate no-shows and bad actors by setting minimum portable reputation scores for exclusive event access.</p>
          </div>
          
          <div className="mt-6 md:mt-0 flex space-x-2">
            <button onClick={loadGoodActor} className="bg-slate-800 text-emerald-400 border border-emerald-500/30 font-bold px-4 py-2 rounded-xl text-sm transition hover:bg-slate-700">
              Load High-Trust Profile
            </button>
            <button onClick={loadBadActor} className="bg-slate-800 text-red-400 border border-red-500/30 font-bold px-4 py-2 rounded-xl text-sm transition hover:bg-slate-700">
              Load Bad Actor
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Attendee Profile */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden transition-all duration-300">
              
              {/* Dynamic Header Background based on score */}
              <div className={`h-24 -mx-6 -mt-6 mb-12 relative flex justify-center items-end ${activeProfile.trustScore > 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-red-500 to-orange-500'}`}>
                <div className="w-20 h-20 bg-white rounded-full absolute -bottom-10 border-4 border-white shadow-md flex items-center justify-center text-2xl font-bold text-slate-400">
                  {activeProfile.name.charAt(0)}
                </div>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-xl font-black text-slate-900">{activeProfile.name}</h2>
                <p className="text-xs text-slate-400 font-mono mt-1 bg-slate-50 inline-block px-2 py-1 rounded-md border border-slate-100">{activeProfile.did}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Trust Score</p>
                  <p className={`text-2xl font-black ${activeProfile.trustScore > 80 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {activeProfile.trustScore}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Attendance</p>
                  <p className="text-2xl font-black text-slate-700">{activeProfile.attendanceRate}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">On-Chain History</h4>
                <div className="space-y-3">
                  {activeProfile.history.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-bold text-slate-800">{item.event}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${item.status === 'No-Show' ? 'text-red-500' : 'text-emerald-500'}`}>
                          {item.status}
                        </p>
                      </div>
                      <span className={`font-mono text-xs font-bold ${item.points.includes('-') ? 'text-red-500' : 'text-emerald-500'}`}>
                        {item.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Organizer Gate */}
          <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-center min-h-[500px]">
            
            <div className="max-w-md mx-auto w-full text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl mx-auto flex items-center justify-center text-2xl border border-slate-700 mb-6">
                🛡️
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Organizer Access Gate</h2>
              <p className="text-slate-400 text-sm mb-8">
                "Exclusive VIP Founder Dinner" requires a minimum Trust Score of <strong className="text-white">85</strong> to claim a free ticket.
              </p>

              {!accessGranted && !accessDenied ? (
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                  <button 
                    onClick={() => handleVerify(85)}
                    disabled={verifying}
                    className={`w-full py-4 rounded-xl font-black shadow-lg transition flex items-center justify-center ${verifying ? 'bg-indigo-900 text-indigo-400 cursor-wait border border-indigo-700' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                  >
                    {verifying ? (
                      <><span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mr-2"></span> Verifying DID...</>
                    ) : (
                      'Verify & Claim Ticket'
                    )}
                  </button>
                  <p className="text-[10px] text-slate-500 mt-4 uppercase tracking-widest">
                    Requesting read access to: did:ethr:reputation
                  </p>
                </div>
              ) : accessGranted ? (
                <div className="bg-emerald-900/40 border border-emerald-500/50 p-8 rounded-2xl animate-fade-in shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-inner">
                    ✓
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">Access Granted</h3>
                  <p className="text-emerald-400 text-sm mb-6">Trust score 92 exceeds the requirement.</p>
                  <button onClick={() => {setAccessGranted(false); setAccessDenied(false);}} className="text-xs text-emerald-200 font-bold hover:underline">Reset</button>
                </div>
              ) : (
                <div className="bg-red-900/40 border border-red-500/50 p-8 rounded-2xl animate-fade-in shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-inner">
                    ✕
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">Access Denied</h3>
                  <p className="text-red-400 text-sm mb-6">Trust score 34 is below the required threshold of 85 due to past no-shows.</p>
                  <button onClick={() => {setAccessGranted(false); setAccessDenied(false);}} className="text-xs text-red-200 font-bold hover:underline">Reset</button>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default DIDReputationSystem;
