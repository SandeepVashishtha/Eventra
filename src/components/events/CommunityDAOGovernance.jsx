import React, { useState } from 'react';

const CommunityDAOGovernance = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [voteCasted, setVoteCasted] = useState(false);
  
  const [poll, setPoll] = useState({
    title: 'Select City for TechCon 2027',
    description: 'Based on community feedback, we have narrowed down the next host city to three options. Cast your vote using your attendee token.',
    options: [
      { id: 'opt1', name: 'Austin, TX', votes: 1452, percentage: 45 },
      { id: 'opt2', name: 'Berlin, Germany', votes: 968, percentage: 30 },
      { id: 'opt3', name: 'Tokyo, Japan', votes: 806, percentage: 25 },
    ]
  });

  const handleVote = (id) => {
    setVoteCasted(true);
    setPoll(prev => {
      const newOptions = prev.options.map(opt => {
        if (opt.id === id) {
          return { ...opt, votes: opt.votes + 1 };
        }
        return opt;
      });
      
      const total = newOptions.reduce((acc, curr) => acc + curr.votes, 0);
      
      return {
        ...prev,
        options: newOptions.map(opt => ({
          ...opt,
          percentage: Math.round((opt.votes / total) * 100)
        }))
      };
    });
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-xl max-w-2xl mx-auto mt-8 border-t-8 border-purple-600">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Community DAO Voting</h2>
          <p className="text-sm text-gray-500 mt-1">Shape the future of this event securely on-chain.</p>
        </div>
        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl shadow-sm">
          ⚖️
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-8 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${walletConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-sm font-bold text-gray-700">
            {walletConnected ? 'Wallet Connected: 0x71C...9b23' : 'Wallet Not Connected'}
          </span>
        </div>
        {!walletConnected ? (
          <button 
            onClick={() => setWalletConnected(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg transition shadow"
          >
            Connect Wallet
          </button>
        ) : (
          <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
            Voting Power: 1 Token
          </span>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gray-900 text-white p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold">{poll.title}</h3>
            <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded border border-green-500/50 uppercase tracking-wider">
              Active Poll
            </span>
          </div>
          <p className="text-gray-400 text-sm">{poll.description}</p>
        </div>

        <div className="p-6 space-y-5">
          {poll.options.map(option => (
            <div key={option.id} className="relative">
              <div className="flex justify-between text-sm font-bold text-gray-800 mb-2">
                <span>{option.name}</span>
                <span>{voteCasted ? `${option.percentage}% (${option.votes.toLocaleString()} votes)` : ''}</span>
              </div>
              
              <div className="w-full bg-gray-100 rounded-lg h-12 relative overflow-hidden flex items-center">
                {voteCasted && (
                  <div 
                    className="absolute top-0 left-0 h-full bg-purple-100 transition-all duration-1000 border-r border-purple-300"
                    style={{ width: `${option.percentage}%` }}
                  ></div>
                )}
                
                <div className="relative z-10 w-full flex justify-between items-center px-4">
                  <span className="text-transparent">Placeholder</span>
                  {!voteCasted && (
                    <button 
                      onClick={() => handleVote(option.id)}
                      disabled={!walletConnected}
                      className={`px-4 py-1.5 text-xs font-bold rounded shadow transition ${walletConnected ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    >
                      {walletConnected ? 'Cast Vote' : 'Connect Wallet to Vote'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {voteCasted && (
          <div className="bg-green-50 p-4 border-t border-green-100 flex items-center justify-center animate-fade-in">
            <span className="text-green-600 mr-2">✅</span>
            <span className="text-sm font-bold text-green-800">Your vote has been cryptographically verified on-chain.</span>
          </div>
        )}
      </div>
      
      <p className="text-center text-xs text-gray-400 mt-6 font-medium">
        Powered by Polygon Smart Contracts. Results are final and binding.
      </p>
    </div>
  );
};

export default CommunityDAOGovernance;
