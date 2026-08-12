import React, { useState } from 'react';

const VendorSmartContracts = () => {
  const [vendors, setVendors] = useState([
    {
      id: 1,
      name: 'Apex A/V Solutions',
      service: 'Main Stage Lighting & Sound',
      totalAmount: 15000,
      milestones: [
        { id: 'm1', desc: 'Equipment Delivery', amount: 5000, status: 'paid' },
        { id: 'm2', desc: 'Stage Rigging Complete', amount: 5000, status: 'pending_approval' },
        { id: 'm3', desc: 'Event Wrap & Teardown', amount: 5000, status: 'locked' }
      ]
    },
    {
      id: 2,
      name: 'Gourmet Catering Co.',
      service: 'VIP Lunch & Coffee Stations',
      totalAmount: 8500,
      milestones: [
        { id: 'm4', desc: 'Menu Finalization Deposit', amount: 2500, status: 'paid' },
        { id: 'm5', desc: 'Day 1 Service Complete', amount: 3000, status: 'locked' },
        { id: 'm6', desc: 'Day 2 Service Complete', amount: 3000, status: 'locked' }
      ]
    }
  ]);

  const [processingId, setProcessingId] = useState(null);

  const approveMilestone = (vendorId, milestoneId) => {
    setProcessingId(milestoneId);
    
    setTimeout(() => {
      setVendors(prev => prev.map(vendor => {
        if (vendor.id === vendorId) {
          return {
            ...vendor,
            milestones: vendor.milestones.map(m => 
              m.id === milestoneId ? { ...m, status: 'paid' } : m
            )
          };
        }
        return vendor;
      }));
      setProcessingId(null);
    }, 2000);
  };

  return (
    <div className="p-6 bg-gray-50 rounded-2xl shadow-xl max-w-4xl mx-auto mt-8 border border-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Vendor Smart Contracts</h2>
          <p className="text-sm text-gray-500 mt-1">Automated, milestone-based payouts via Stripe Connect API.</p>
        </div>
        <div className="mt-4 md:mt-0 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-4">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Escrow Balance</p>
            <p className="text-xl font-black text-indigo-700">$23,500.00</p>
          </div>
          <button className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-bold rounded border border-indigo-100 hover:bg-indigo-100 transition">
            Add Funds
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {vendors.map(vendor => {
          const totalPaid = vendor.milestones.filter(m => m.status === 'paid').reduce((sum, m) => sum + m.amount, 0);
          const progressPercent = (totalPaid / vendor.totalAmount) * 100;

          return (
            <div key={vendor.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-900 p-5 text-white flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">{vendor.name}</h3>
                  <p className="text-gray-400 text-sm">{vendor.service}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Contract Total</p>
                  <p className="font-mono font-bold text-lg">${vendor.totalAmount.toLocaleString()}</p>
                </div>
              </div>

              <div className="p-5">
                <div className="mb-6">
                  <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                    <span>Payout Progress</span>
                    <span>{Math.round(progressPercent)}% Released</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-gray-800 text-sm border-b pb-2 mb-3">Payment Milestones</h4>
                  {vendor.milestones.map((milestone, idx) => (
                    <div key={milestone.id} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${milestone.status === 'paid' ? 'bg-green-100 text-green-700' : milestone.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-400'}`}>
                          {idx + 1}
                        </div>
                        <div>
                          <p className={`font-medium text-sm ${milestone.status === 'locked' ? 'text-gray-500' : 'text-gray-800'}`}>{milestone.desc}</p>
                          <p className="text-xs text-gray-400 font-mono">${milestone.amount.toLocaleString()}</p>
                        </div>
                      </div>

                      <div>
                        {milestone.status === 'paid' && (
                          <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">
                            <span className="mr-1">✅</span> Funds Released
                          </span>
                        )}
                        {milestone.status === 'locked' && (
                          <span className="flex items-center text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                            🔒 Locked
                          </span>
                        )}
                        {milestone.status === 'pending_approval' && (
                          <button 
                            onClick={() => approveMilestone(vendor.id, milestone.id)}
                            disabled={processingId !== null}
                            className={`flex items-center text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition ${processingId === milestone.id ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                          >
                            {processingId === milestone.id ? (
                              <><span className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2"></span> Releasing...</>
                            ) : (
                              'Approve & Release Funds'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start space-x-3">
        <span className="text-blue-500 text-xl">ℹ️</span>
        <p className="text-xs text-blue-800 leading-relaxed font-medium">
          When you click "Approve & Release Funds", the smart contract automatically routes the exact fiat amount from your escrow balance directly to the vendor's registered bank account via Stripe Connect, eliminating Net-30 invoicing delays.
        </p>
      </div>
    </div>
  );
};

export default VendorSmartContracts;
