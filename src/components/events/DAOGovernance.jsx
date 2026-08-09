import React, { useState } from 'react';

const DAOGovernance = () => {
  const [voted, setVoted] = useState(false);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto mt-8 border-t-4 border-blue-600">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Community Event Governance (DAO)</h2>
        <p className="text-gray-500 text-sm mt-1">Holders of the Eventra Attendee Token can vote on upcoming decisions.</p>
      </div>

      <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6 text-sm">
        <div>
          <span className="text-gray-600 mr-2">Wallet Connected:</span>
          <span className="font-mono text-blue-800 font-medium">0x89A...2F4b</span>
        </div>
        <div>
          <span className="text-gray-600 mr-2">Voting Power:</span>
          <span className="font-bold text-blue-700">3 Tokens (3 past events)</span>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 border-b p-4 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Proposal #42: Select Main Keynote Speaker</h3>
          <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">Active</span>
        </div>
        
        <div className="p-5">
          <p className="text-sm text-gray-600 mb-5">
            The community budget has $15,000 allocated for the main keynote. Please vote for your preferred speaker. 
            The winning smart contract will automatically execute the booking deposit.
          </p>

          <div className="space-y-4">
            {/* Option A */}
            <div className={`p-4 border rounded-lg flex items-center justify-between cursor-pointer transition ${voted ? 'bg-gray-50' : 'hover:border-blue-400'}`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-bold">JD</div>
                <div>
                  <h4 className="font-bold text-gray-800">Jane Doe (AI Ethics)</h4>
                  <p className="text-xs text-gray-500">Current Votes: 145</p>
                </div>
              </div>
              {!voted && (
                <button onClick={() => setVoted(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded shadow hover:bg-blue-700">
                  Cast Vote
                </button>
              )}
              {voted && <div className="w-1/3 bg-gray-200 h-2 rounded-full"><div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div></div>}
            </div>

            {/* Option B */}
            <div className={`p-4 border rounded-lg flex items-center justify-between cursor-pointer transition ${voted ? 'bg-gray-50' : 'hover:border-blue-400'}`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center text-orange-700 font-bold">JS</div>
                <div>
                  <h4 className="font-bold text-gray-800">John Smith (Web3 Future)</h4>
                  <p className="text-xs text-gray-500">Current Votes: 82</p>
                </div>
              </div>
              {!voted && (
                <button onClick={() => setVoted(true)} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50">
                  Cast Vote
                </button>
              )}
              {voted && <div className="w-1/3 bg-gray-200 h-2 rounded-full"><div className="bg-gray-400 h-2 rounded-full" style={{ width: '35%' }}></div></div>}
            </div>
          </div>
          
          {voted && (
            <div className="mt-6 text-center text-sm text-green-600 font-medium bg-green-50 py-2 rounded">
              ✅ Your transaction was verified on-chain. Thank you for voting!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DAOGovernance;
