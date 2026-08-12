import React, { useState } from 'react';

const AccessibilityComplianceChecker = () => {
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  const [assets] = useState([
    { id: 1, name: 'Keynote_Deck_Final.pdf', type: 'PDF Document', status: 'pending' },
    { id: 2, name: 'Speaker_Intro_Video.mp4', type: 'Video Media', status: 'pending' },
    { id: 3, name: 'Event_Map_Updated.jpg', type: 'Image Asset', status: 'pending' }
  ]);

  const [scanResults, setScanResults] = useState([]);

  const startScan = () => {
    setScanning(true);
    setScanComplete(false);
    
    setTimeout(() => {
      setScanResults([
        {
          assetId: 1,
          name: 'Keynote_Deck_Final.pdf',
          issues: [
            { type: 'error', message: 'Low color contrast on slides 12-14 (Ratio 2.1:1)' },
            { type: 'warning', message: 'Missing structural heading tags (H1, H2)' }
          ],
          score: 65,
          compliant: false
        },
        {
          assetId: 2,
          name: 'Speaker_Intro_Video.mp4',
          issues: [
            { type: 'error', message: 'No closed captions (VTT) file attached' }
          ],
          score: 40,
          compliant: false
        },
        {
          assetId: 3,
          name: 'Event_Map_Updated.jpg',
          issues: [],
          score: 100,
          compliant: true
        }
      ]);
      setScanning(false);
      setScanComplete(true);
    }, 2500);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-4xl mx-auto mt-8 border-t-8 border-blue-600">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Accessibility Compliance Checker</h2>
          <p className="text-sm text-gray-500 mt-1">Automated WCAG 2.1 AA scanning for event assets.</p>
        </div>
        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl shadow-sm">
          ♿
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Asset Queue List */}
        <div className="col-span-1 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Uploaded Assets</h3>
          <div className="space-y-3">
            {assets.map(asset => (
              <div key={asset.id} className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                <span className="text-xl">
                  {asset.type === 'PDF Document' ? '📄' : asset.type === 'Video Media' ? '🎥' : '🖼️'}
                </span>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-gray-700 truncate">{asset.name}</p>
                  <p className="text-xs text-gray-400">{asset.type}</p>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={startScan}
            disabled={scanning || scanComplete}
            className="w-full mt-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:opacity-50 shadow-md"
          >
            {scanning ? 'Scanning Assets...' : scanComplete ? 'Scan Complete' : 'Run Compliance Scan'}
          </button>
        </div>

        {/* Scan Results Area */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="bg-gray-900 p-4 text-white">
            <h3 className="font-bold">Automated Audit Results</h3>
          </div>
          
          <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
            {!scanning && !scanComplete ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <span className="text-4xl mb-3">🔍</span>
                <p className="font-medium">Run a scan to check for WCAG compliance.</p>
              </div>
            ) : scanning ? (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 font-bold animate-pulse">Analyzing text contrast and metadata...</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {scanResults.map(result => (
                  <div key={result.assetId} className={`p-4 rounded-xl border-2 ${result.compliant ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex justify-between items-center mb-3 border-b border-gray-200/50 pb-2">
                      <h4 className="font-bold text-gray-800">{result.name}</h4>
                      <span className={`text-xs font-black px-2 py-1 rounded uppercase ${result.compliant ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                        {result.compliant ? 'Pass' : 'Action Required'}
                      </span>
                    </div>
                    
                    {!result.compliant ? (
                      <ul className="space-y-2">
                        {result.issues.map((issue, idx) => (
                          <li key={idx} className="flex items-start text-sm">
                            <span className="mr-2 mt-0.5">{issue.type === 'error' ? '❌' : '⚠️'}</span>
                            <span className={issue.type === 'error' ? 'text-red-700 font-medium' : 'text-yellow-700 font-medium'}>
                              {issue.message}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-green-700 font-medium flex items-center">
                        <span className="mr-2">✅</span> No accessibility issues detected.
                      </p>
                    )}
                    
                    {!result.compliant && (
                      <div className="mt-4 pt-3 border-t border-red-100 flex justify-end">
                        <button className="text-xs bg-red-600 text-white px-3 py-1.5 rounded font-bold shadow hover:bg-red-700">
                          Auto-Fix Suggestions
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AccessibilityComplianceChecker;
