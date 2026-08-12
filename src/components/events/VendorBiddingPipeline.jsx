import React, { useState } from 'react';

const VendorBiddingPipeline = () => {
  const [activeTab, setActiveTab] = useState('rfps'); // rfps, bids, contracts
  const [signing, setSigning] = useState(false);
  const [contractSigned, setContractSigned] = useState(false);

  const bids = [
    { id: 'b1', vendor: 'Elite Catering Co.', amount: '$12,500', rating: '4.9/5', status: 'Pending Review' },
    { id: 'b2', vendor: 'Gourmet Events', amount: '$14,200', rating: '4.7/5', status: 'Shortlisted' },
    { id: 'b3', vendor: 'QuickBite Services', amount: '$9,800', rating: '4.2/5', status: 'Rejected' }
  ];

  const handleSign = () => {
    setSigning(true);
    setTimeout(() => {
      setSigning(false);
      setContractSigned(true);
    }, 2000);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans text-slate-800 flex justify-center">
      <div className="w-full max-w-6xl flex flex-col h-[750px] bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header & Navigation */}
        <div className="bg-slate-900 p-6 flex flex-col md:flex-row justify-between items-start md:items-center text-white border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-black flex items-center">
              <span className="mr-3">🤝</span> Vendor Procurement Portal
            </h1>
            <p className="text-slate-400 text-sm mt-1">Manage RFPs, bids, and e-signatures in one place.</p>
          </div>
          
          <div className="flex space-x-2 mt-4 md:mt-0 bg-slate-800 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('rfps')}
              className={`px-4 py-2 rounded font-bold text-sm transition ${activeTab === 'rfps' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Active RFPs
            </button>
            <button 
              onClick={() => setActiveTab('bids')}
              className={`px-4 py-2 rounded font-bold text-sm transition ${activeTab === 'bids' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Review Bids (3)
            </button>
            <button 
              onClick={() => setActiveTab('contracts')}
              className={`px-4 py-2 rounded font-bold text-sm transition ${activeTab === 'contracts' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Contracts & E-Sign
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 bg-slate-50 overflow-y-auto">
          
          {activeTab === 'rfps' && (
            <div className="animate-fade-in space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">Active Requests for Proposal</h2>
                <button className="bg-slate-900 text-white font-bold px-4 py-2 rounded-lg hover:bg-slate-800 transition">
                  + Create New RFP
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="bg-green-100 text-green-700 text-[10px] font-black uppercase px-2 py-1 rounded">Accepting Bids</span>
                    <h3 className="text-lg font-black text-slate-900 mt-2">Catering: 3-Day Tech Conference (1,200 Pax)</h3>
                    <p className="text-sm text-slate-500 mt-1">Budget: $10,000 - $15,000 • Due in 4 days</p>
                  </div>
                  <button onClick={() => setActiveTab('bids')} className="text-blue-600 font-bold text-sm hover:underline">
                    View 3 Bids ➔
                  </button>
                </div>
                <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100 line-clamp-2">
                  Seeking full-service catering for a 3-day tech conference. Must include breakfast, lunch, and two coffee breaks per day. Vegan and gluten-free options are strictly required for 15% of attendees...
                </p>
              </div>
            </div>
          )}

          {activeTab === 'bids' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Bid Comparison</h2>
                  <p className="text-sm text-slate-500 mt-1">For: Catering (1,200 Pax)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {bids.map((bid) => (
                  <div key={bid.id} className={`bg-white p-6 rounded-2xl border-2 transition relative ${bid.status === 'Shortlisted' ? 'border-blue-500 shadow-md ring-4 ring-blue-500/10' : 'border-slate-200 shadow-sm'}`}>
                    {bid.status === 'Shortlisted' && (
                      <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-lg rounded-tr-xl">
                        Top Pick
                      </div>
                    )}
                    <h3 className="font-bold text-slate-900 text-lg mb-1">{bid.vendor}</h3>
                    <div className="flex items-center space-x-2 text-sm text-slate-500 mb-6">
                      <span className="text-yellow-400">★</span>
                      <span>{bid.rating} (42 reviews)</span>
                    </div>
                    
                    <div className="mb-6">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Proposed Amount</p>
                      <p className="text-3xl font-black text-slate-800">{bid.amount}</p>
                    </div>

                    <div className="space-y-2 mb-6 text-sm text-slate-600">
                      <p className="flex items-center"><span className="text-green-500 mr-2">✓</span> Full Staff Included</p>
                      <p className="flex items-center"><span className="text-green-500 mr-2">✓</span> Dietary Req. Met</p>
                      <p className="flex items-center"><span className={bid.id === 'b3' ? 'text-red-500 mr-2' : 'text-green-500 mr-2'}>{bid.id === 'b3' ? '✗' : '✓'}</span> Setup & Teardown</p>
                    </div>

                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setActiveTab('contracts')}
                        className={`flex-1 py-2 rounded-lg font-bold text-sm transition ${bid.status === 'Shortlisted' ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                      >
                        {bid.status === 'Shortlisted' ? 'Draft Contract' : 'Shortlist'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'contracts' && (
            <div className="animate-fade-in flex flex-col md:flex-row gap-6 h-full">
              
              {/* Document Preview */}
              <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                <div className="bg-slate-100 p-3 border-b border-slate-200 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-700">📄 Master_Services_Agreement_EliteCatering.pdf</span>
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase px-2 py-1 rounded">Ready for Signature</span>
                </div>
                <div className="flex-1 p-8 bg-slate-50 overflow-y-auto">
                  <div className="bg-white max-w-lg mx-auto shadow-sm border border-slate-200 min-h-[400px] p-8 font-serif text-slate-700 text-sm leading-relaxed">
                    <h2 className="text-center font-bold text-lg mb-6">MASTER SERVICES AGREEMENT</h2>
                    <p className="mb-4">This Master Services Agreement ("Agreement") is made effective as of August 15, 2026, by and between Eventra Organizers ("Client") and Elite Catering Co. ("Vendor").</p>
                    <p className="mb-4">1. SERVICES. Vendor agrees to provide catering services for 1,200 attendees as detailed in Exhibit A attached hereto.</p>
                    <p className="mb-8">2. COMPENSATION. Client agrees to pay Vendor a total sum of $12,500, payable in standard milestone installments: 50% deposit, 50% net-30 post-event.</p>
                    
                    <div className="border-t border-dashed border-slate-400 mt-12 pt-8 flex justify-between">
                      <div className="w-1/2 pr-4">
                        <p className="text-xs text-slate-500 mb-2">Organizer Signature</p>
                        <div className={`h-12 border-b-2 ${contractSigned ? 'border-slate-800 relative' : 'border-blue-500 bg-blue-50'}`}>
                           {contractSigned && <span className="absolute bottom-1 left-2 font-['Brush_Script_MT',cursive] text-2xl text-slate-800">Jane Doe</span>}
                        </div>
                      </div>
                      <div className="w-1/2 pl-4">
                        <p className="text-xs text-slate-500 mb-2">Vendor Signature</p>
                        <div className="h-12 border-b-2 border-slate-300 relative">
                          <span className="absolute bottom-1 left-2 font-['Brush_Script_MT',cursive] text-2xl text-slate-400">E. Catering</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Panel */}
              <div className="w-full md:w-80 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                <h3 className="font-bold text-slate-900 mb-4">E-Signature Gateway</h3>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  Review the contract thoroughly. Once signed, a legally binding copy will be emailed to all parties via our DocuSign API integration.
                </p>

                <div className="space-y-4 flex-1">
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                    <span className="font-medium text-slate-700">Vendor Signed (Aug 10)</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${contractSigned ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                      {contractSigned ? '✓' : '2'}
                    </span>
                    <span className={`font-medium ${contractSigned ? 'text-slate-700' : 'text-blue-700 font-bold'}`}>Organizer Signature Required</span>
                  </div>
                </div>

                <button 
                  onClick={handleSign}
                  disabled={signing || contractSigned}
                  className={`w-full py-4 rounded-xl font-black shadow-lg transition mt-6 ${contractSigned ? 'bg-green-50 text-green-600 border border-green-200' : signing ? 'bg-slate-800 text-slate-400' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
                >
                  {contractSigned ? 'Contract Executed' : signing ? 'Processing...' : 'Sign & Execute'}
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VendorBiddingPipeline;
