import React, { useState } from 'react';

const CateringPredictor = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [predictions, setPredictions] = useState(null);

  const runModel = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setPredictions([
        { item: "Standard Omnivore Meals", qty: 450, confidence: 94 },
        { item: "Vegetarian/Vegan Options", qty: 220, confidence: 89 },
        { item: "Gluten-Free Needs", qty: 65, confidence: 91 },
        { item: "Coffee/Tea Servings", qty: 1200, confidence: 98 },
      ]);
      setAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto mt-8 border border-gray-100">
      <h2 className="text-2xl font-bold mb-2">Predictive Catering Analytics</h2>
      <p className="text-gray-500 mb-6 text-sm">
        Reduce food waste by estimating dietary needs based on attendee demographics and historical data.
      </p>

      {!predictions && !analyzing ? (
        <div className="text-center py-10 bg-gray-50 rounded border border-dashed">
          <p className="text-gray-600 mb-4">Input data ready. 850 registered attendees.</p>
          <button 
            onClick={runModel}
            className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition"
          >
            Run Prediction Model
          </button>
        </div>
      ) : analyzing ? (
        <div className="text-center py-10">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Analyzing historical consumption rates and demographics...</p>
        </div>
      ) : (
        <div>
          <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded mb-4 text-sm font-medium">
            ✅ Model execution complete. Based on 850 attendees.
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Predicted Quantity</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Model Confidence</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {predictions.map((p, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 text-gray-900 font-medium">{p.item}</td>
                    <td className="px-4 py-3 text-gray-600">{p.qty}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2 max-w-[100px]">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${p.confidence}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-500">{p.confidence}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="text-sm font-medium text-blue-600 hover:underline">Export to Caterer (PDF)</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CateringPredictor;
