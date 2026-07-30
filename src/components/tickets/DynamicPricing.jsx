import React, { useState } from 'react';

const DynamicPricing = () => {
  const [tiers, setTiers] = useState([
    { id: 1, name: 'Early Bird', price: 100, limit: 100, expiry: '2026-08-15' },
    { id: 2, name: 'General Admission', price: 150, limit: 500, expiry: '2026-09-01' }
  ]);

  const [newTier, setNewTier] = useState({ name: '', price: '', limit: '', expiry: '' });

  const handleAddTier = () => {
    if (newTier.name && newTier.price && newTier.limit && newTier.expiry) {
      setTiers([...tiers, { id: Date.now(), ...newTier }]);
      setNewTier({ name: '', price: '', limit: '', expiry: '' });
    }
  };

  const handleRemoveTier = (id) => {
    setTiers(tiers.filter(tier => tier.id !== id));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-2">Ticket Pricing Tiers</h2>
      <p className="text-gray-500 mb-6 text-sm">Configure multiple ticket tiers with prices, limits, and expiration dates.</p>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Current Tiers</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3 font-medium text-gray-600">Tier Name</th>
                <th className="p-3 font-medium text-gray-600">Price ($)</th>
                <th className="p-3 font-medium text-gray-600">Ticket Limit</th>
                <th className="p-3 font-medium text-gray-600">Expiration Date</th>
                <th className="p-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => (
                <tr key={tier.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{tier.name}</td>
                  <td className="p-3">${tier.price}</td>
                  <td className="p-3">{tier.limit}</td>
                  <td className="p-3">{tier.expiry}</td>
                  <td className="p-3">
                    <button 
                      onClick={() => handleRemoveTier(tier.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {tiers.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">No tiers configured.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Add New Tier</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tier Name</label>
            <input 
              type="text"
              value={newTier.name}
              onChange={(e) => setNewTier({ ...newTier, name: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="e.g. VIP"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
            <input 
              type="number"
              value={newTier.price}
              onChange={(e) => setNewTier({ ...newTier, price: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Limit</label>
            <input 
              type="number"
              value={newTier.limit}
              onChange={(e) => setNewTier({ ...newTier, limit: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
            <input 
              type="date"
              value={newTier.expiry}
              onChange={(e) => setNewTier({ ...newTier, expiry: e.target.value })}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
        <button 
          onClick={handleAddTier}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
        >
          Add Tier
        </button>
      </div>
    </div>
  );
};

export default DynamicPricing;
